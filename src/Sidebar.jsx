export default function Sidebar({ isOpen }) {
    return (
      <div
        className={`fixed top-0 left-0 h-full w-[360px] bg-white shadow-lg transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          {/* 用户信息区域 */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-red-500 flex items-center justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="avatar"
                  className="w-10 h-10 object-cover rounded-full"
                />
              </div>
              <div className="text-xl font-bold text-gray-800">USER NAME</div>
            </div>
            {/* 菜单按钮或占位 */}
            <div className="text-gray-500 text-2xl">☰</div>
          </div>
  
          <hr className="mb-8 border-gray-300" />
  
          {/* 数据展示区域 */}
          <div className="flex flex-col space-y-10 text-center">
            <div>
              <div className="text-4xl font-extrabold text-black">25</div>
              <div className="text-base text-gray-500 mt-1">已标记城市</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-black">136</div>
              <div className="text-base text-gray-500 mt-1">已上传日志</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-black">12</div>
              <div className="text-base text-gray-500 mt-1">已获得勋章</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  