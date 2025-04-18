import { useRef, useState } from 'react';
import Sidebar from './Sidebar';
import AddPanel from './AddPanel';
import mapImage from './assets/map.png';

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
    <div className="h-screen w-screen flex bg-[#bfbfbf] overflow-hidden relative">
      {/* Sidebar or AddPanel (mutually exclusive) */}
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

      {/* Main content: Map and controls */}
      <div className="flex-1 overflow-y-auto">
        {/* Menu button (top-left) */}
        <div className="p-4 fixed top-0 left-0 z-50">
          <button
            className="text-black text-2xl bg-white rounded-md p-2 shadow-md"
            onClick={() => {
              setSidebarOpen((prev) => !prev);
              setAddPanelOpen(false);
            }}
          >
            ☰
          </button>
        </div>

        {/* Map area */}
        <div className="flex items-center justify-center h-[calc(100%-64px)] mt-16">
          <div
            className="rounded-xl shadow-2xl transition-transform duration-300"
            onMouseMove={handleMouseMove}
            onMouseLeave={resetZoom}
          >
            <img
              ref={mapRef}
              src={mapImage}
              alt="地图"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${origin.x}% ${origin.y}%`,
              }}
              className="transition-transform duration-300 w-[90vw] max-w-[1400px] h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Red plus button (bottom-right) */}
      <button
  onClick={() => {
    setAddPanelOpen(true);
    setSidebarOpen(false);
  }}
  className="fixed bottom-10 right-10 bg-red-600 hover:bg-red-700 text-white text-5xl w-20 h-20 rounded-full flex items-center justify-center shadow-lg z-50"
>
  +
</button>


    </div>
  );
}