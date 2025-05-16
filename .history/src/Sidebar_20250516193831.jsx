import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import avatarImg from './assets/avatar.png';
import axios from 'axios';

export default function Sidebar({ type = 'default', image, onClose, username, log, refreshLogs }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ marked_count: 0, logs_count: 0, medals_count: 0 });
  const [logDetails, setLogDetails] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const pageSize = 5;

  const totalPages = Math.ceil(total / pageSize);
  const currentLog = selectedLog || log;

  useEffect(() => {
    if (type !== 'default' || !username) return;
    axios.get(`/api/user-stats?username=${username}`)
      .then(res => setStats(res.data))
      .catch(err => console.error('获取统计失败:', err));
  }, [username, type]);

  const fetchLogs = async (pageOverride = page) => {
    try {
      const res = await axios.get('/api/user-logs', {
        params: { username, keyword, city, page: pageOverride, limit: pageSize }
      });
      setLogDetails(res.data.logs);
      setTotal(res.data.total);
      setShowLogs(true);
      setSelectedLog(null);
    } catch (err) {
      console.error('获取日志失败:', err);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('确定删除该日志吗？')) return;
    try {
      await axios.post('/api/delete-log', { id: logId, username });
      fetchLogs();
      refreshLogs?.();
    } catch {
      alert('删除失败');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        {(type === 'logDetail' && log) || selectedLog ? (
          <>
            <button className="close-btn" onClick={() => {
              if (onClose) onClose();
              setSelectedLog(null);
            }}>←</button>

            <div className="panel-content">
              <h3>📍 {currentLog.location_display_name || currentLog.location_name}</h3>
              <p><strong>🕒 时间：</strong>{new Date(currentLog.created_at).toLocaleString()}</p>
              <p><strong>📝 日志内容：</strong>{currentLog.content}</p>
              {currentLog.image_path && (
                <div style={{ marginTop: '10px' }}>
                  <strong>🖼 图片：</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(JSON.parse(currentLog.image_path) || []).map((src, idx) => (
                      <img key={idx} src={src} alt={`图片${idx + 1}`} style={{ width: '100%' }} />
                    ))}
                  </div>
                </div>
              )}
              <button
                style={{ marginTop: '12px' }}
                onClick={() => {
                  window.open(`/api/export?username=${username}&logId=${currentLog.id}&type=pdf`, '_blank');
                }}
              >
                导出此日志（PDF）
              </button>
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
              <div className="username">{username}</div>
              <button className="logout-button" onClick={handleLogout}>退出登录</button>
            </div>
            <hr className="divider" />
            {!showLogs ? (
              <div className="stats">
                <div className="stat-block"><div className="stat-number">{stats.marked_count}</div><div className="stat-label">已标记地点</div></div>
                <div className="stat-block" onClick={() => fetchLogs(1)} style={{ cursor: 'pointer' }}>
                  <div className="stat-number">{stats.logs_count}</div><div className="stat-label">已上传日志</div>
                </div>
                <div className="stat-block"><div className="stat-number">{stats.medals_count}</div><div className="stat-label">已获得勋章</div></div>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
                <h4>📓 日志列表</h4>
                <div style={{ marginBottom: '10px' }}>
                  <input placeholder="关键词" value={keyword} onChange={e => setKeyword(e.target.value)} />
                  <input placeholder="城市" value={city} onChange={e => setCity(e.target.value)} />
                  <button onClick={() => { setPage(1); fetchLogs(1); }}>搜索</button>
                  <button onClick={() => { setKeyword(''); setCity(''); fetchLogs(1); }}>重置</button>
                </div>
                <button
                  style={{ marginBottom: '12px' }}
                  onClick={() => {
                    window.open(`/api/export?username=${username}&type=csv`, '_blank');
                  }}
                >
                  导出全部日志（CSV）
                </button>
                {logDetails.map((log, idx) => (
                  <div
                    key={idx}
                    className="log-item"
                    onClick={() => setSelectedLog(log)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid #ccc', marginBottom: '8px' }}
                  >
                    <div className="log-content">
                      <div><strong>📍 地点：</strong>{log.location_display_name || log.location_name}</div>
                      <div><strong>📝 内容：</strong>{log.content}</div>
                      <div><strong>🕒 时间：</strong>{new Date(log.created_at).toLocaleString()}</div>
                    </div>
                    <button className="delete-button" onClick={e => { e.stopPropagation(); handleDeleteLog(log.id); }}>删除</button>
                  </div>
                ))}
                <div className="pagination">
                  <button disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchLogs(page - 1); }}>上一页</button>
                  <span>{page} / {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => { setPage(p => p + 1); fetchLogs(page + 1); }}>下一页</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
