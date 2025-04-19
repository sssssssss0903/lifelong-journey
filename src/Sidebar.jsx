import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import avatarImg from './assets/avatar.png';
import axios from 'axios';

export default function Sidebar({ type = 'default', image, onClose, username }) {
  const navigate = useNavigate();

  // 用于保存从后端获取的数据
  const [stats, setStats] = useState({
    marked_count: 0,
    logs_count: 0,
    medals_count: 0,
  });

  useEffect(() => {
    if (type !== 'default') return;
    if (!username) return;
  
    console.log(' 请求 stats：', username);
    axios.get(`/api/user-stats?username=${username}`)
      .then(res => {
        console.log('获取成功:', res.data);
        setStats(res.data);
      })
      .catch(err => console.error(' 获取失败:', err));
  }, [username, type]);
  

  function handleLogout() {
    localStorage.removeItem('username');
    navigate('/login');
  }

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {type === 'location' ? (
          <>
            <button className="close-btn" onClick={onClose}>←</button>
            <div className="panel-content">
              <h3>当前位置：湖北省武汉市</h3>
              <p>武汉大学</p>
              {image && <img src={image} alt="武汉大学" className="location-image" />}
            </div>
          </>
        ) : (
          <>
            <div className="user-info">
              <div className="user-avatar">
                <img src={avatarImg} alt="avatar" />
              </div>
              <div className="username">{username || '游客'}</div>
              <button className="logout-button" onClick={handleLogout}>退出登录</button>
            </div>

            <hr className="divider" />

            <div className="stats">
              <div className="stat-block">
                <div className="stat-number">{stats.marked_count}</div>
                <div className="stat-label">已标记地点</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">{stats.logs_count}</div>
                <div className="stat-label">已上传日志</div>
              </div>
              <div className="stat-block">
                <div className="stat-number">{stats.medals_count}</div>
                <div className="stat-label">已获得勋章</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
