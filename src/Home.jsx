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
      plugins: ['AMap.Marker', 'AMap.ToolBar', 'AMap.Scale', 'AMap.OverView', 'AMap.Geocoder','AMap.HeatMap'],
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

    useEffect(() => {
        console.log('地图实例:', mapInstanceRef.current);
    }, [mapInstanceRef.current]);

    //初始化加载已有足迹
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get(`/api/user-logs?username=${username}`);
                setMarkedRegions(res.data.logs || []);
            } catch (err) {
                console.error('加载用户日志失败:', err.message);
            }
        };
        if (username) {
            fetchLogs();
        }
    }, [username]);

    //加载 marker
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (map && markedRegions.length > 0) {
            //清除已有 marker
            if (window.currentMarkers) {
                window.currentMarkers.forEach(marker => marker.setMap(null));
            }

            //渲染新的 marker
            const markers = markedRegions.map(log => {
                return new window.AMap.Marker({
                    position: [log.longitude, log.latitude],
                    title: log.location_display_name,
                    map: map,
                });
            });

            //存起来以便清除或管理
            window.currentMarkers = markers;
        }
    }, [mapInstanceRef.current, markedRegions]);



  // 地图添加坐标模式
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

// 定义为独立函数（在组件内部但在 useEffect 外部）
const fetchLogs = async () => {
  if (!username) return;
  try {
    const res = await axios.get(`/api/user-logs?username=${username}`);
    setMarkedRegions(res.data.logs || []);
  } catch (err) {
    console.error('获取日志失败:', err);
  }
};

// 初始加载时执行一次
useEffect(() => {
  fetchLogs();
}, [username]);

  // 打点到地图（带坐标防御）
  //useEffect(() => {
  //  const map = mapInstanceRef.current;
  //  if (!map || !window.AMap) return;

  //  map.clearMap();

  //  console.log(' 打点数据:', markedRegions);

  //  markedRegions.forEach((log) => {
  //    const lng = parseFloat(log.longitude);
  //    const lat = parseFloat(log.latitude);

  //    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
  //      console.warn('跳过非法坐标日志:', log);
  //      return;
  //    }

  //    const marker = new window.AMap.Marker({
  //      position: [lng, lat],
  //      title: log.location_display_name || log.location_name,
  //        map,
  //        content: `<div style="
  //                  background: radial-gradient(circle, #ff4d4f, #8b0000);
  //                  border-radius: 50%;
  //                  width: 16px;
  //                  height: 16px;
  //                  box-shadow: 0 0 8px rgba(255, 0, 0, 0.6);
  //                  border: 2px solid white;
  //              "></div>`,
  //        offset: new window.AMap.Pixel(-8, -8),
  //    });

  //    marker.on('click', () => {
  //      setSelectedLog(log);
  //    });
  //  });
  //}, [markedRegions]);



    // 打点 + 热力图渲染（合并逻辑）
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.AMap || !window.AMap.Heatmap) return;

        map.clearMap(); // 清除旧图层和点

        console.log('打点数据:', markedRegions);

        const heatData = [];

        markedRegions.forEach((log) => {
            const lng = parseFloat(log.longitude);
            const lat = parseFloat(log.latitude);

            if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
                console.warn('跳过非法坐标日志:', log);
                return;
            }

            // 红色立体动态打点
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
                offset: new window.AMap.Pixel(-9, -9),
            });


            marker.on('click', () => {
                setSelectedLog(log);
            });

            // 热力图数据收集
            heatData.push({ lng, lat, count: 1 });
        });

        // 聚合处理（避免重叠点太亮）
        const aggregateHeatPoints = (points) => {
            const grid = new Map();
            points.forEach(({ lng, lat }) => {
                const key = `${lng.toFixed(4)},${lat.toFixed(4)}`;
                if (!grid.has(key)) {
                    grid.set(key, { lng: parseFloat(lng.toFixed(4)), lat: parseFloat(lat.toFixed(4)), count: 1 });
                } else {
                    grid.get(key).count += 1;
                }
            });
            return Array.from(grid.values());
        };

        const aggregatedHeatData = aggregateHeatPoints(heatData);

        // 清除旧热力图实例
        if (window.heatmapInstance) {
            map.remove(window.heatmapInstance);
        }

        // 添加热力图插件并渲染
        window.AMap.plugin('AMap.Heatmap', () => {
            const heatmap = new window.AMap.Heatmap(map, {
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


  // 切换面板
  useEffect(() => {
    if (selectedLog) {
      setSidebarOpen(false);
      setAddPanelOpen(false);
      setLocationPanelOpen(false);
    }
  }, [selectedLog]);

  return (
    <div className="home-container">
      {/* 侧边面板 */}
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
          refreshLogs={fetchLogs}
          onCenter={() => {
            if (mapInstanceRef.current && selectedLog) {
              mapInstanceRef.current.setZoom(12);
              mapInstanceRef.current.setCenter([selectedLog.longitude, selectedLog.latitude]);
            }
          }}
        />
      ) : sidebarOpen ? (
        <Sidebar username={username}
      refreshLogs={fetchLogs}/>
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
