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





export default function Home({ username }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin] = useState({ x: 50, y: 50 });
  const mapRef = useRef();
  const [markedRegions, setMarkedRegions] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const mapInstanceRef = useRef(null);
  const [addingMode, setAddingMode] = useState(false);
const [selectedCoord, setSelectedCoord] = useState(null);
const [selectedCityName, setSelectedCityName] = useState('');

// 地图初始化（仅执行一次）
useEffect(() => {
  AMapLoader.load({
    key: 'bdb03370210cd724f39ff61caa8981cd',
    version: '2.0',
    plugins: ['AMap.Marker', 
      'AMap.ToolBar',
       'AMap.Scale',
      'AMap.OverView'],
  }).then((AMap) => {
    const map = new AMap.Map('gaode-map', {
      zoom: 5,
      center: [104.114129, 37.550339],
      resizeEnable: true,
    });
    mapInstanceRef.current = map;
     AMap.plugin([
      'AMap.ToolBar',
      'AMap.Scale',
      'AMap.OverView',
    ], () => {
      map.addControl(new AMap.ToolBar({ position: 'RT' }));     // 工具条，含方向盘
      map.addControl(new AMap.Scale({ position: 'LB' }));       // 比例尺
      map.addControl(new AMap.OverView({ isOpen: true,position:'RT' }));      // 鹰眼
    });
  });

}, []);

// 标记更新（依赖 markedRegions）
useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map) return;

  markedRegions.forEach(regionId => {
    const coord = COORDINATES[regionId];
    if (!coord) return;

    const marker = new AMap.Marker({
      position: [coord[0], coord[1]],
      title: regionId,
    });
    map.add(marker);
  });
}, [markedRegions]);

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

  useEffect(() => {
  const map = mapInstanceRef.current;
  if (!map || !addingMode) return;

  const handleClick = (e) => {
    const lnglat = e.lnglat; // 高德对象，含 lng/lat 属性
    const coord = [lnglat.getLng(), lnglat.getLat()];
    setSelectedCoord(coord);

    // 使用高德的逆地理编码获取城市名
    AMapLoader.load({
      key: 'bdb03370210cd724f39ff61caa8981cd',
      version: '2.0',
      plugins: ['AMap.Geocoder'],
    }).then(AMap => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(coord, (status, result) => {
        if (status === 'complete' && result.regeocode) {
          const city = result.regeocode.addressComponent.city || result.regeocode.addressComponent.province;
          setSelectedCityName(city);
          setAddPanelOpen(true); // 开启 AddPanel
        } else {
          alert('无法识别该位置的城市名');
        }
      });
    });

    setAddingMode(false); // 关闭添加模式
  };

  map.on('click', handleClick);
  return () => map.off('click', handleClick);
}, [addingMode]);


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
           coord={selectedCoord}
    city={selectedCityName}
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
  id="gaode-map"
  style={{
    width: '100%',
    height: '100vh',
    minHeight: '500px',
  }}
></div>
        </div> 
      </div>

      {/* 添加按钮 */}
    <button
  onClick={() => {
    setAddingMode(true); // 开启添加模式
    setSidebarOpen(false);
    setLocationPanelOpen(false);
    setAddPanelOpen(false); // 延后打开 AddPanel
  }}
  className="plus-button"
>
  +
</button>
    </div>
  );
}
