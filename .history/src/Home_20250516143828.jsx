import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import './styles.css';
import wuhanImg from './assets/wuhan.jpg';
import axios from 'axios';
import AMapLoader from '@amap/amap-jsapi-loader';

export default function Home({ username }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [addingMode, setAddingMode] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [markedRegions, setMarkedRegions] = useState([]);

  const mapInstanceRef = useRef(null);

  // 初始化地图
  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: 'fbce27ca4fb16e9fd96a2f7085b3fc23',
    };

    AMapLoader.load({
      key: 'bdb03370210cd724f39ff61caa8981cd',
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.Geocoder'],
    }).then((AMap) => {
      window.AMap = AMap;
      const map = new AMap.Map('gaode-map', {
        zoom: 5,
        center: [104.114129, 37.550339],
        resizeEnable: true,
      });
      mapInstanceRef.current = map;

      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'], () => {
        map.addControl(new AMap.ToolBar({ position: 'RT' }));
        map.addControl(new AMap.Scale({ position: 'LB' }));
        map.addControl(new AMap.OverView({ isOpen: true, position: 'RT' }));
      });
    });
  }, []);

  // 添加模式：点击地图获取坐标+城市名
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !addingMode) return;

    const handleClick = (e) => {
      const coord = [e.lnglat.getLng(), e.lnglat.getLat()];
      setSelectedCoord(coord);

      if (!window.AMap) return alert('地图尚未加载完毕');

      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress(coord, (status, result) => {
          if (status === 'complete' && result?.regeocode?.addressComponent) {
            const comp = result.regeocode.addressComponent;
            const city = comp.city || comp.province || comp.district || '未知城市';

            if (!city || city === '[]') {
              alert('⚠️ 无法识别城市名称，请点击城市区域');
              return;
            }

            setSelectedCityName(city);
            setAddPanelOpen(true);
          } else {
            alert('❌ 无法识别该位置，请点击有地址区域');
          }
        });
      });

      setAddingMode(false);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [addingMode]);

  // 加载日志用于打点
  useEffect(() => {
    if (!username) return;

    const fetchLogs = async () => {
      try {
        const res = await axios.get(`/api/user-logs?username=${username}`);
        setMarkedRegions(res.data || []);
      } catch (err) {
        console.error('获取日志失败:', err);
      }
    };

    fetchLogs();
  }, [username]);

  // 标记到地图
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.AMap) return;

    map.clearMap();

    markedRegions.forEach((log) => {
      const marker = new window.AMap.Marker({
        position: [log.longitude, log.latitude],
        title: log.location_display_name || log.location_name,
        map,
      });

      marker.on('click', () => {
        setSelectedLog(log);
      });
    });
  }, [markedRegions]);

  // 选中日志时关闭其他面板
  useEffect(() => {
    if (selectedLog) {
      setSidebarOpen(false);
      setAddPanelOpen(false);
      setLocationPanelOpen(false);
    }
  }, [selectedLog]);

  return (
    <div className="home-container">
      {/* 面板控制 */}
      {addPanelOpen ? (
        <AddPanel
          onClose={() => {
            setAddPanelOpen(false);
            setSidebarOpen(false);
          }}
          setMarkedRegions={setMarkedRegions}
          coord={selectedCoord}
          city={selectedCityName}
        />
      ) : selectedLog ? (
        <Sidebar
          type="logDetail"
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          onCenter={() => {
            if (mapInstanceRef.current && selectedLog) {
              mapInstanceRef.current.setZoom(12);
              mapInstanceRef.current.setCenter([selectedLog.longitude, selectedLog.latitude]);
            }
          }}
        />
      ) : sidebarOpen ? (
        <Sidebar username={username} />
      ) : null}

      {/* 地图 */}
      <div className="main-content">
        <div className="map-wrapper">
          <button
            className="menu-button"
            onClick={() => {
              setSidebarOpen((prev) => !prev);
              setAddPanelOpen(false);
              setLocationPanelOpen(false);
              setSelectedLog(null);
            }}
          >
            ☰
          </button>

          <div id="gaode-map" style={{ width: '100%', height: '100vh', minHeight: '500px' }}></div>
        </div>
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => {
          setAddingMode(true);
          setSidebarOpen(false);
          setLocationPanelOpen(false);
          setAddPanelOpen(false);
          setSelectedLog(null);
        }}
        className="plus-button"
      >
        +
      </button>
    </div>
  );
}
