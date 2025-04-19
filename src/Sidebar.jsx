import { useNavigate } from 'react-router-dom';
import avatarImg from './assets/avatar.png';

export default function Sidebar({ type = 'default', image, onClose }) {
  const navigate = useNavigate();

  function handleLogout() {
    // 清除登录状态
    // localStorage.removeItem('token'); 等
    navigate('/login');
  }

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {type === 'location' ? (
          <>
            {/* 返回按钮 */}
            <button className="close-btn" onClick={onClose}>←</button>

            {/* 地点信息 */}
            <div className="panel-content">
              <h3>当前位置：湖北省</h3>
              <p>武汉大学</p>
              {image && (
                <img src={image} alt="武汉大学" className="location-image" />
              )}
            </div>
          </>
        ) : (
          <>
            {/* 👤 用户信息区域 */}
            <div className="user-info">
              <div className="user-avatar">
                <img src={avatarImg} alt="avatar" />
              </div>
              <div className="username">USER NAME</div>

              {/* ➕ 退出按钮 */}
              <button className="logout-button" onClick={handleLogout}>
                退出登录
              </button>
            </div>

            <hr className="divider" />

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
          </>
        )}
      </div>
    </div>
  );
}
