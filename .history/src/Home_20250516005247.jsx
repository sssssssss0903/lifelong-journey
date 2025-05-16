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
  const mapInstanceRef = useRef(null);
  const [addingMode, setAddingMode] = useState(false);
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState('');

  // ✅ 初始化地图（仅执行一次）
  useEffect(() => {
    AMapLoader.load({
      securityJsCode: '你的安全密钥',
      key: 'bdb03370210cd724f39ff61caa8981cd',
      version: '2.0',
      plugins: [
        'AMap.Marker',
        'AMap.ToolBar',
        'AMap.Scale',
        'AMap.OverView',
        'AMap.Geocoder', // ✅ 必须加上
      ],
    }).then((AMap) => {
      window.AMap = AMap; // ✅ 全局保存
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

  // ✅ 地图点击添加模式
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !addingMode) return;

const handleClick = (e) => {
  const lnglat = e.lnglat;
  const coord = [lnglat.getLng(), lnglat.getLat()];
  setSelectedCoord(coord);
  console.log('点击坐标：', coord);

  const map = mapInstanceRef.current;
  if (!window.AMap || !map) {
    alert('地图尚未加载完毕');
    return;
  }

  // 👇 使用 AMap.plugin 保证 Geocoder 插件已就绪
  window.AMap.plugin('AMap.Geocoder', () => {
    const geocoder = new window.AMap.Geocoder();

    geocoder.getAddress(coord, (status, result) => {
      console.log('逆地理编码状态：', status);
      console.log('逆地理编码结果：', result);

      if (status === 'complete' && result?.regeocode?.addressComponent) {
        const comp = result.regeocode.addressComponent;
        const city = comp.city || comp.province || comp.district || '未知城市';

        if (!city || city === '[]') {
          alert('⚠️ 无法识别城市名称，请点击城市区域');
          return;
        }

        console.log('解析出的城市：', city);
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

  return (
    <div className="home-container">
      {/* 面板控制 */}
      {addPanelOpen ? (
        <AddPanel
          onClose={() => {
            setAddPanelOpen(false);
            setSidebarOpen(false);
          }}
          setMarkedRegions={() => {}}
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

      {/* 主地图区域 */}
      <div className="main-content">
        <div className="map-wrapper">
          <button
            className="menu-button"
            onClick={() => {
              setSidebarOpen((prev) => !prev);
              setAddPanelOpen(false);
              setLocationPanelOpen(false);
            }}
          >
            ☰
          </button>

          <div
            id="gaode-map"
            style={{ width: '100%', height: '100vh', minHeight: '500px' }}
          ></div>
        </div>
      </div>

      {/* 添加按钮 */}
      <button
        onClick={() => {
          setAddingMode(true);
          setSidebarOpen(false);
          setLocationPanelOpen(false);
          setAddPanelOpen(false);
        }}
        className="plus-button"
      >
        +
      </button>
    </div>
  );
}
