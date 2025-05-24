import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import avatarImg from './assets/avatar.png';
import axios from 'axios';

export default function Sidebar({ type = 'default', image, onClose, username, log, refreshLogs }) {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    marked_count: 0,
    logs_count: 0,
    medals_count: 0,
  });

  const [logDetails, setLogDetails] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (type !== 'default' || !username) return;

    axios.get(`/api/user-stats?username=${username}`)
      .then(res => {
        setStats(res.data);
      })
      .catch(err => console.error('获取统计失败:', err));
  }, [username, type]);

const fetchLogs = () => {
  if (!username) return;
  axios.get(`/api/user-logs?username=${username}`)
    .then(res => {
      setLogDetails(res.data);
      setShowLogs(true);

      //  再次获取最新统计
      return axios.get(`/api/user-stats?username=${username}`);
    })
    .then(res => setStats(res.data));
};


  const handleDeleteLog = (logId) => {
    if (!username) return;
    if (!window.confirm('确定要删除这条日志吗？')) return;

    axios.post('/api/delete-log', { id: logId, username })
      .then(res => {
        alert(res.data.message);
         
        setLogDetails(prev => prev.filter(log => log.id !== logId));
        setStats(prev => ({
          ...prev,
          logs_count: Math.max(prev.logs_count - 1, 0)
        }));
         refreshLogs?.(); 
      })
      .catch(err => {
        console.error('删除失败:', err);
        alert('删除失败，请重试');
      });
  };

  function handleLogout() {
    localStorage.removeItem('username');
    navigate('/login');
  }
return (
  <div className="sidebar">
    <div className="sidebar-content">

      {type === 'logDetail' && log ? (
        <>
          <button className="close-btn" onClick={onClose}>←</button>
          <div className="panel-content">
            <h3>📍 {log.location_display_name || log.location_name}</h3>
            <p><strong>🕒 时间：</strong>{new Date(log.created_at).toLocaleString()}</p>
            <p><strong>📝日志内容：</strong>{log.content}</p>
            {log.image_path && (
  <div style={{ marginTop: '10px' }}>
    <strong>🖼 图片：</strong>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
      {(() => {
        try {
          const imgs = JSON.parse(log.image_path);
          if (Array.isArray(imgs)) {
            return imgs.map((src, idx) => (
              <img key={idx} src={src} alt={`图片${idx + 1}`} style={{ width: '100%' }} />
            ));
          } else {
            return <img src={log.image_path} alt="日志图片" style={{ width: '100%' }} />;
          }
        } catch {
          return <img src={log.image_path} alt="日志图片" style={{ width: '100%' }} />;
        }
      })()}
    </div>
  </div>
)}

          </div>
        </>
      ) : type === 'location' ? (
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

          {!showLogs ? (
            <div className="stats">
              <div className="stat-block" onClick={() => alert('TODO: 展示标记地点')}>
                <div className="stat-number">{stats.marked_count}</div>
                <div className="stat-label">已标记地点</div>
              </div>
              <div className="stat-block" onClick={fetchLogs} style={{ cursor: 'pointer' }}>
                <div className="stat-number">{stats.logs_count}</div>
                <div className="stat-label">已上传日志</div>
              </div>
              <div className="stat-block" onClick={() => alert('TODO: 展示勋章')}>
                <div className="stat-number">{stats.medals_count}</div>
                <div className="stat-label">已获得勋章</div>
              </div>
            </div>
          ) : (
            <div className="log-list" style={{ flex: 1, overflowY: 'auto' }}>
              <h4>📓 日志条目</h4>
              {logDetails.map((log, idx) => (
                <div key={idx} className="log-item">
                  <div className="log-content">
                    <div><strong>📍 地点：</strong>{log.location_display_name || log.location_name}</div>
                    <div><strong>📝 日志内容：</strong>{log.content}</div>
                    {log.image_path && (
                      <div>
                        <strong>🖼 图片：</strong>
                        <img src={log.image_path} alt="上传图片" />
                      </div>
                    )}
                    <div><strong>🕒 时间：</strong>{new Date(log.created_at).toLocaleString()}</div>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => handleDeleteLog(log.id)}
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

}
