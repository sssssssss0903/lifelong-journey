import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import './styles.css';

import api from './api';
import AMapLoader from '@amap/amap-jsapi-loader';

export default function Home({ username }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [addingMode, setAddingMode] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [markedRegions, setMarkedRegions] = useState([]);
const [mapReady, setMapReady] = useState(false);
  const mapInstanceRef = useRef(null);

  // 初始化地图
  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: 'fbce27ca4fb16e9fd96a2f7085b3fc23',
    };

    AMapLoader.load({
      key: 'bdb03370210cd724f39ff61caa8981cd',
      version: '2.0',
      plugins: ['AMap.Marker', 'AMap.ToolBar', 'AMap.Scale', 'AMap.Geocoder', 'AMap.HeatMap', 'AMap.ControlBar']
    }).then((AMap) => {
      window.AMap = AMap;
      const map = new AMap.Map('gaode-map', {
        zoom: 5,
        center: [104.114129, 37.550339],
        resizeEnable: true,
      });
      mapInstanceRef.current = map;
      
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.ControlBar'], () => {
        map.addControl(new AMap.ToolBar({ position: 'RT' }));
        map.addControl(new AMap.Scale({ position: 'LB' }));
        map.addControl(new AMap.ControlBar({
          showZoomBar: true,
          showControlButton: true,
          position: { right: '10px', top: '80px' }
        }));
         setMapReady(true);
         if (username) fetchLogs();
      });
    });
  }, []);

const fetchLogs = async () => {
  if (!username) return;
  try {
    const res = await api.get(`/api/user-logs?username=${username}&limit=1000`);
    const logs = res.data.logs || [];

    setMarkedRegions(prev => {
      const prevStr = JSON.stringify(prev);
      const newStr = JSON.stringify(logs);
      return prevStr !== newStr ? logs : prev;
    });
  } catch (err) {
    console.error('获取日志失败:', err);
  }
};



  // 渲染 marker + 热力图
  useEffect(() => {
    const map = mapInstanceRef.current;
    if ( !map || !mapReady ||!window.AMap || !window.AMap.HeatMap) return;

    map.clearMap();

    const heatData = [];

    markedRegions.forEach(log => {
      const lng = parseFloat(log.longitude);
      const lat = parseFloat(log.latitude);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

      const marker = new window.AMap.Marker({
        position: [lng, lat],
        title: log.location_display_name || log.location_name,
        map,
        content: `
          <div style="
            background: radial-gradient(circle at center, #ff6666, #b22222);
            border-radius: 50%;
            width: 18px;
            height: 18px;
            box-shadow: 0 0 12px 6px rgba(255, 102, 102, 0.7);
            border: 2px solid white;
          "></div>
        `,
         icon: null, 
        offset: new window.AMap.Pixel(-9, -9)
      });

      marker.on('click', () => {
        setSelectedLog(log);
        map.setZoom(12);
        map.setCenter([lng, lat]);
      });

      heatData.push({ lng, lat, count: 1 });
    });

    const aggregatedHeatData = Array.from(
      heatData.reduce((map, { lng, lat }) => {
        const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
        const existing = map.get(key);
        if (existing) {
          existing.count++;
        } else {
          map.set(key, { lng, lat, count: 1 });
        }
        return map;
      }, new Map()).values()
    );

if (window.heatmapInstance) {
  window.heatmapInstance.setMap(null); // 正确移除
  window.heatmapInstance = null;
}


    window.AMap.plugin('AMap.HeatMap', () => {
      const heatmap = new window.AMap.HeatMap(map, {
        radius: 30,
        opacity: [0.3, 1],
        gradient: {
          0.3: '#72f0ff',
          0.6: '#ffca3e',
          1.0: '#ff4d4f',
        },
      });
      heatmap.setDataSet({ data: aggregatedHeatData, max: 10 });
      window.heatmapInstance = heatmap;
    });
  }, [markedRegions]);

  // 地图点击添加坐标
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !addingMode) return;

    const handleClick = (e) => {
      const coord = [e.lnglat.getLng(), e.lnglat.getLat()];
      setSelectedCoord(coord);

      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress(coord, (status, result) => {
          const comp = result?.regeocode?.addressComponent;
          const city = comp?.city || comp?.province || comp?.district || '未知城市';
          if (!city || city === '[]') return alert('⚠️ 无法识别城市名称，请点击城市区域');

          setSelectedCityName(city);
          setAddPanelOpen(true);
        });
      });

      setAddingMode(false);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [addingMode]);

  useEffect(() => {
    if (selectedLog) {
      setSidebarOpen(false);
      setAddPanelOpen(false);
    }
  }, [selectedLog]);

  return (
    <div className="home-container">
      {addPanelOpen ? (
        <AddPanel
          onClose={() => {
            setAddPanelOpen(false);
            setSidebarOpen(true);
          }}
          refreshLogs={fetchLogs}
          coord={selectedCoord}
          city={selectedCityName}
        />
      ) : selectedLog ? (
        <Sidebar
          type="logDetail"
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
          refreshLogs={fetchLogs}
        />
      ) : sidebarOpen ? (
        <Sidebar username={username} refreshLogs={fetchLogs} />
      ) : null}

      <div className="main-content">
        <div className="map-wrapper">
          <button
            className="menu-button"
            onClick={() => {
              setSidebarOpen(prev => !prev);
              setAddPanelOpen(false);
              setSelectedLog(null);
            }}
          >☰</button>
          <div id="gaode-map" style={{ width: '100%', height: '100vh', minHeight: '500px' }}></div>
        </div>
      </div>

      <button
        onClick={() => {
          setAddingMode(true);
          setSidebarOpen(false);
          setAddPanelOpen(false);
          setSelectedLog(null);
        }}
        className="plus-button"
      >+</button>
    </div>
  );
}
