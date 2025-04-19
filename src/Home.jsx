import { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import chinaSvg from './assets/china.svg?raw';
import './styles.css';
import wuhanImg from './assets/wuhan.jpg';

export default function Home({ username }) { //  1. 接收 username
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [locationPanelOpen, setLocationPanelOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [origin] = useState({ x: 50, y: 50 });
  const mapRef = useRef();

  function handleMapClick(e) {
    const id = e.target.closest('[id]')?.id;
    console.log('Clicked:', id);
    if (id === 'pHB') {
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
