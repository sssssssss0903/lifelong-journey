import avatarImg from './assets/avatar.png';

export default function Sidebar() {
  return (
    <div className="sidebar">
      {/* 侧边栏内部容器 */}
      <div className="sidebar-content">
        {/* 👤 用户信息区域 */}
        <div className="user-info">
          {/* 用户头像 */}
          <div className="user-avatar">
            <img
              src={avatarImg}
              alt="avatar"
            />
          </div>

          {/* 用户名 */}
          <div className="username">
            USER NAME
          </div>
        </div>

        {/* 分隔线 */}
        <hr className="divider" />

        {/* 📊 数据统计区域 */}
        <div className="stats">
          <div className="stat-block">
            <div className="stat-number">25</div>
            <div className="stat-label">已标记城市</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">136</div>
            <div className="stat-label">已上传日志</div>
          </div>
          <div className="stat-block">
            <div className="stat-number">12</div>
            <div className="stat-label">已获得勋章</div>
          </div>
        </div>
      </div>
    </div>
  );
}
