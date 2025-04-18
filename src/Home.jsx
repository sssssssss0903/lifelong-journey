import { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import mapImage from './assets/map.png';
import './Home.css'; // 添加样式引用

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);

  const [scale, setScale] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const mapRef = useRef();

  function handleMouseMove(e) {
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
    setScale(1.5);
  }

  function resetZoom() {
    setScale(1);
  }

  return (
    <div className="home-container">
      {addPanelOpen ? (
        <AddPanel
          onClose={() => {
            setAddPanelOpen(false);
            setSidebarOpen(false);
          }}
        />
      ) : sidebarOpen ? (
        <Sidebar />
      ) : null}

      <div className="main-content">
      <button
  className="map-menu-btn"
  onClick={() => {
    setSidebarOpen((prev) => !prev);
    setAddPanelOpen(false);
  }}
>
  ☰
</button>


        <div className="map-wrapper" onMouseMove={handleMouseMove} onMouseLeave={resetZoom}>
          <img
            ref={mapRef}
            src={mapImage}
            alt="地图"
            className="map-image"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
        </div>
      </div>

      <button
        onClick={() => {
          setAddPanelOpen(true);
          setSidebarOpen(false);
        }}
        className="plus-btn"
      >
        +
      </button>
    </div>
  );
}
