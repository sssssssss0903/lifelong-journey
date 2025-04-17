import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  function handleLogin() {
    // 可加入账号密码校验等逻辑
    navigate('/home') // ✅ 正确跳转
  }

  return (
    <div
      className="h-screen w-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/src/assets/bg2.png')" }}
    >
      <img
        src="/src/assets/bg1.png"
        className="absolute bottom-0 left-0 w-full h-full object-cover opacity-80 pointer-events-none z-0"
        alt="overlay"
      />

      <div className="absolute bottom-10 right-10 w-[960px] h-[540px] flex bg-white/90 rounded-xl shadow-xl overflow-hidden z-10">
        <div className="w-1/2 p-6 flex flex-col items-center justify-center text-black">
          <h1 className="text-xl font-bold mb-2">欢迎使用</h1>
          <h2 className="text-md mb-4">Lifelong Journey</h2>
          <img src="/src/assets/map.png" alt="Map" className="w-full object-contain" />
        </div>

        <div className="w-[1px] bg-gray-300" />

        <div className="w-1/2 px-10 py-8 text-black flex flex-col justify-center">
          <div className="text-right mb-8 text-base italic">
            <p>Your journey</p>
            <p>Your map</p>
          </div>

          <h2 className="text-xl font-bold mb-5">登录</h2>

          <input
            className="p-3 mb-4 border rounded w-full h-[50px] text-base placeholder:text-sm"
            placeholder="请输入账号"
          />
          <input
            type="password"
            className="p-3 mb-4 border rounded w-full h-[50px] text-base placeholder:text-sm"
            placeholder="请输入密码"
          />

          <label className="text-sm mb-5 flex items-center">
            <input type="checkbox" className="mr-2" />
            记住密码
          </label>

          <button
            onClick={handleLogin}
            className="bg-black text-white h-[50px] rounded w-full hover:bg-gray-800 mb-4 text-base font-semibold"
          >
            登录
          </button>

          <div className="flex justify-between text-sm text-blue-600">
            <a href="#">注册账号</a>
            <a href="#">忘记密码</a>
          </div>
        </div>
      </div>
    </div>
  )
}
