import { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import chinaSvg from './assets/china.svg?raw';
import './styles.css';
import wuhanImg from './assets/wuhan.jpg';
import pointImg from './assets/point.png';
import axios from 'axios';
import { COORDINATES } from './utils/coordinates';
import AMapLoader from '@amap/amap-jsapi-loader';

const mapInstanceRef = useRef(null);

useEffect(() => {
  AMapLoader.load({
    key: 'bdb03370210cd724f39ff61caa8981cd',
    version: '2.0',
    plugins: ['AMap.Marker', 'AMap.ToolBar'],
  }).then((AMap) => {
    const map = new AMap.Map('gaode-map', {
      zoom: 5,
      center: [104.114129, 37.550339], // 中国中间
      resizeEnable: true,
    });
    mapInstanceRef.current = map;

    // 加载标记点
    markedRegions.forEach(regionId => {
      const coord = COORDINATES[regionId];
      if (!coord) return;

      const marker = new AMap.Marker({
        position: [coord[0], coord[1]],
        title: regionId,
      });
      map.add(marker);
    });
  });
}, [markedRegions]);

export default function Home({ username }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin] = useState({ x: 50, y: 50 });
  const mapRef = useRef();
  const [markedRegions, setMarkedRegions] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  //  提前定义函数，防止 useEffect 中提前调用失败
  const loadMarkedRegions = async () => {
    try {
      const res = await axios.get(`/api/user-log?username=${username}`);
      const markedLocations = res.data.marked_locations || [];
      console.log("加载到的 marked_locations:", markedLocations);
      setMarkedRegions(markedLocations);
    } catch (err) {
      console.error("加载标记失败:", {
        message: err.message,
        response: err.response,
        stack: err.stack,
      });
    }
  };

  //         组件挂载后加载用户标记区域
  useEffect(() => {
    if (username) {
      console.log("useEffect: 触发标记加载，用户名:", username);
      loadMarkedRegions();
      setIsDataLoaded(true);
    }
  }, [username]);

  //  打印标记区域变化
  useEffect(() => {
    console.log("markedRegions 更新:", markedRegions);
  }, [markedRegions]);

  function handleMapClick(e) {
    const clickedId = e.target.closest('[id]')?.id;
    console.log('Clicked:', clickedId);
    if (!clickedId) return;
    if (clickedId === 'pHB' || markedRegions.includes(clickedId)) {
      setLocationPanelOpen(true);
      setSidebarOpen(false);
      setAddPanelOpen(false);
    } else {
      setLocationPanelOpen(false);
    }
  }

  function zoomIn() {
    setScale(prev => Math.min(prev + 0.2, 3));
  }

  function zoomOut() {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }

  return (
    <div className="home-container">
      {addPanelOpen ? (
        <AddPanel
          onClose={() => {
            setAddPanelOpen(false);
            setSidebarOpen(false);
          }}
          setMarkedRegions={setMarkedRegions}
          markedRegions={markedRegions}
        />
      ) : locationPanelOpen ? (
        <Sidebar
          type="location"
          onClose={() => setLocationPanelOpen(false)}
          image={wuhanImg}
        />
      ) : sidebarOpen ? (
        <Sidebar username={username} />
      ) : null}

      <div className="main-content">
        <div className="map-wrapper">
          <button
            className="menu-button"
            onClick={() => {
              setSidebarOpen(prev => !prev);
              setAddPanelOpen(false);
              setLocationPanelOpen(false);
            }}
          >
            ☰
          </button>

          {/* 地图和标记一同缩放
          <div
            className="svg-container"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
              minHeight: '100vh',
              position: 'relative',
            }}
            onClick={handleMapClick}
            ref={mapRef}
          >
            {/* 地图本体 */}
            <div dangerouslySetInnerHTML={{ __html: chinaSvg }} />

            {/* 地图标记 */}
            <div
              className="marker-container"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10, //  确保在地图之上
              }}
            >
              {markedRegions.map(regionId => {
                const coord = COORDINATES[regionId];
                if (!coord) {
                  console.warn(`⚠️ COORDINATES 中未找到 ${regionId}`);
                  return null;
                }
                return (
                  <img
                    key={regionId}
                    src={pointImg}
                    className="location-marker"
                    style={{
                      position: 'absolute',
                      left: `${coord[0]}%`,
                      top: `${coord[1]}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                    
                      zIndex: 20, //  显示在最上层
                    }}
                    alt="标记点"
                  />
                );
              })}
            </div>
          </div>
        </div> */{'}'}

        {/* 缩放按钮 */}
        <div className="zoom-controls">
          <button onClick={zoomIn}>＋</button>
          <button onClick={zoomOut}>－</button>
        </div>
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => {
          setAddPanelOpen(true);
          setSidebarOpen(false);
          setLocationPanelOpen(false);
        }}
        className="plus-button"
      >
        +
      </button>
    </div>
  );
}
