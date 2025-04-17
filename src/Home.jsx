import { useRef, useState } from 'react'
import Sidebar from './Sidebar'
import mapImage from './assets/map.png'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 控制缩放倍数和缩放中心点
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  // 引用地图 DOM 元素
  const mapRef = useRef()

  // 当鼠标移动到图片上时，动态计算 transform-origin
  function handleMouseMove(e) {
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })       // 设置局部缩放焦点
    setScale(1.5)             // 设置缩放倍数
  }

  // 鼠标移出地图时，缩放复原
  function resetZoom() {
    setScale(1)
  }

  return (
    <div className="h-screen w-screen bg-[#bfbfbf] flex relative overflow-hidden">
      {/* ✅ 左侧侧边栏（宽度更大） */}
      <Sidebar isOpen={sidebarOpen} />

      {/* ✅ 主区域 */}
      <div
  className={`flex-1 transition-all duration-300 ${
    sidebarOpen ? 'ml-[360px]' : 'ml-0'
  }`}
>
        {/* 顶部导航按钮 */}
        <div className="p-4">
          <button
            className="text-black text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        {/* ✅ 地图内容区域：居中、带局部缩放 */}
        <div className="flex items-center justify-center h-[calc(100%-64px)]">
          <div
            className="overflow-hidden rounded-xl shadow-2xl transition-transform duration-300"
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
    </div>
  )
}
