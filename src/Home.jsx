import { useEffect,useRef, useState,useMemo } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import chinaSvg from './assets/china.svg?raw';
import './styles.css';
import wuhanImg from './assets/wuhan.jpg';
import pointImg from './assets/point.png'; // 新增图片导入
import axios from 'axios';
import { COORDINATES } from './utils/coordinates'; 

export default function Home({ username }) { //  1. 接收 username
  console.log("当前用户名:", username); // 添加日志检查
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin] = useState({ x: 50, y: 50 });
  const mapRef = useRef();
  const [markedRegions, setMarkedRegions] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  console.log("当前 markedRegions:", markedRegions); // 添加日志检查


  // 新增useEffect获取标记区域
  useEffect(() => {
    const loadData = async () => {
      if (username) {
        await loadMarkedRegions();
        setIsDataLoaded(true);
      }
    };
    loadData();
    console.log("useEffect 触发，用户名:", username); // 验证依赖项触发
    const loadMarkedRegions = async () => {
      try {
        const res = await axios.get(`/api/user-log?username=${username}`);
        const markedLocations = res.data.marked_locations || [];
        setMarkedRegions(markedLocations);
      } catch (err) {
        console.error("完整错误信息:", {
          message: err.message,
          response: err.response,
          stack: err.stack
        });
      }
    };
  
    if (username) {
      loadMarkedRegions();
    }
  }, [username]);
  
  function handleMapClick(e) {
    const clickedId = e.target.closest('[id]')?.id;
    console.log('Clicked:', clickedId);
    if (!clickedId) return;
    if (clickedId === 'pHB') {
      // 处理 pHB 被点击的情况
      setLocationPanelOpen(true);
      setSidebarOpen(false);
      setAddPanelOpen(false);
    } else if (markedRegions.includes(clickedId)) {
      console.log("Marked Region Clicked:", clickedId); // 添加日志检查
      setLocationPanelOpen(true);
      // 可以在此处根据ID加载不同地点的数据(没写)
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
          setMarkedRegions={setMarkedRegions} // 传递状态更新函数
          markedRegions={markedRegions} // 传递当前状态
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
          <div 
        className="marker-container" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none' // 防止遮挡点击
        }}
      >
        {markedRegions.map(regionId => (
          <img
            key={regionId}
            src={pointImg}
            className="location-marker"
            style={{
              position: 'absolute',
              left: `${COORDINATES[regionId]?.[0] || 0}%`,
              top: `${COORDINATES[regionId]?.[1] || 0}%`,
              transform: 'translate(-50%, -50%)', // 居中定位
              width: '24px', // 根据需求调整
              height: '24px',
              transition: 'all 0.3s' // 缩放动画
            }}
            alt="标记点"
          />
        ))}
        </div>
          <div
            ref={mapRef}
            className="svg-container"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
              minHeight: '100vh'
            }}
            onClick={handleMapClick}
            dangerouslySetInnerHTML={{ __html: chinaSvg }}
          />
        </div>

        {/* ➕➖ 缩放按钮 */}
        <div className="zoom-controls">
          <button onClick={zoomIn}>＋</button>
          <button onClick={zoomOut}>－</button>
        </div>
      </div>

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
