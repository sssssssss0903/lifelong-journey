import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';   
import AddPanel from './AddPanel';          
import '../assets/styles.css';
import { getUserLogs } from '../api/index.js';
const AMapLoader = await import('@amap/amap-jsapi-loader').then(m => m.default || m);



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

  /** ------------------ 初始化地图 ------------------ */
  useEffect(() => {
    const mapContainer = document.getElementById('gaode-map');
    if (!mapContainer) return;

    window._AMapSecurityConfig = {
      securityJsCode: 'fbce27ca4fb16e9fd96a2f7085b3fc23',
    };

    if (mapInstanceRef.current) return;

    AMapLoader.load({
      key: 'bdb03370210cd724f39ff61caa8981cd',
      version: '2.0',
      plugins: [
        'AMap.Marker',
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.Geocoder',
        'AMap.HeatMap',
        'AMap.ControlBar'
      ]
    })
      .then((AMap) => {
        if (!document.getElementById('gaode-map')) return;
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
          map.addControl(
            new AMap.ControlBar({
              showZoomBar: true,
              showControlButton: true,
              position: { right: '10px', top: '80px' },
            })
          );
          setMapReady(true);
        });
      })
      .catch((e) => console.error('地图加载失败:', e));
  }, []);

  /** ------------------ 拉取用户日志 ------------------ */
  const fetchLogs = useCallback(async () => {
    if (!username) return;
    try {
      const res = await getUserLogs(username, { limit: 1000 });
      const logs = res.data.logs || [];
      setMarkedRegions(prev => {
        const prevStr = JSON.stringify(prev);
        const newStr = JSON.stringify(logs);
        return prevStr !== newStr ? logs : prev;
      });
    } catch (err) {
      console.error('获取日志失败:', err);
    }
  }, [username]);

  /** 等地图准备好、用户名存在、且 token 有效时再拉取日志 */
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (mapReady && username && token) {
      fetchLogs();
    }
  }, [mapReady, username, fetchLogs]);

  /** ------------------ 预处理热力图数据（useMemo） ------------------ */
  const aggregatedHeatData = useMemo(() => {
    const heatData = [];
    markedRegions.forEach(log => {
      const lng = parseFloat(log.longitude);
      const lat = parseFloat(log.latitude);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      heatData.push({ lng, lat, count: 1 });
    });

    return Array.from(
      heatData.reduce((map, { lng, lat }) => {
        const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
        const existing = map.get(key);
        if (existing) existing.count++;
        else map.set(key, { lng, lat, count: 1 });
        return map;
      }, new Map()).values()
    );
  }, [markedRegions]);

  /** ------------------ 渲染 marker + 热力图 ------------------ */
  const handleMarkerClick = useCallback((log, map) => {
    const lng = parseFloat(log.longitude);
    const lat = parseFloat(log.latitude);
    setSelectedLog(log);
    map.setZoom(12);
    map.setCenter([lng, lat]);
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady || !window.AMap || !window.AMap.HeatMap) return;

    map.clearMap();
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

      marker.on('click', () => handleMarkerClick(log, map));
    });

    if (window.heatmapInstance) {
      window.heatmapInstance.setMap(null);
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
  }, [aggregatedHeatData, markedRegions, mapReady, handleMarkerClick]);

  /** ------------------ 地图点击添加坐标 ------------------ */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !addingMode || !mapReady) return;

    const handleClick = (e) => {
      const coord = [e.lnglat.getLng(), e.lnglat.getLat()];
      setSelectedCoord(coord);

      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress(coord, (status, result) => {
          const comp = result?.regeocode?.addressComponent;
          const city = comp?.city || comp?.province || comp?.district || '未知城市';
          if (!city || city === '[]') {
            alert('⚠️ 无法识别城市名称，请点击城市区域');
            return;
          }
          setSelectedCityName(city);
          setAddPanelOpen(true);
        });
      });

      setAddingMode(false);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [addingMode, mapReady]);

  /** ------------------ 添加模式光标切换 ------------------ */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (addingMode) {
      map.setDefaultCursor('crosshair'); // 十字瞄准
    } else {
      map.setDefaultCursor('grab'); // 普通手型
    }
  }, [addingMode]);

  /** ------------------ 切换面板 ------------------ */
  useEffect(() => {
    if (selectedLog) {
      setSidebarOpen(false);
      setAddPanelOpen(false);
    }
  }, [selectedLog]);

  /** ------------------ 渲染 ------------------ */
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
      ) : sidebarOpen ? (
        <Sidebar username={username} refreshLogs={fetchLogs}>
          <Sidebar.UserInfo />
          <Sidebar.Stats />
          <Sidebar.LogList />
          <Sidebar.Locations />
          <Sidebar.Medals />
          <Sidebar.Chart />
          <Sidebar.LogDetail />
        </Sidebar>
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

      {/* “添加模式”按钮 */}
      <button
        onClick={() => {
          if (!mapReady) return alert('地图尚未加载完成');
          setAddingMode(true);
          setSidebarOpen(false);
          setAddPanelOpen(false);
          setSelectedLog(null);
          alert('请点击地图选择一个位置');
        }}
        className="plus-button"
      >+</button>
    </div>
  );
}
