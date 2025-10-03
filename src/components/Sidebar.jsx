import { useNavigate } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import avatarImg from '../assets/avatar.png';
const StatsChart = lazy(() => import('./StatsChart'));

import api from '../api';

// 勋章图标
import medalBronze from '../assets/medal_bronze.png';
import medalBronzeGray from '../assets/medal_bronze_gray.png';
import medalSilver from '../assets/medal_silver.png';
import medalSilverGray from '../assets/medal_silver_gray.png';
import medalGold from '../assets/medal_gold.png';
import medalGoldGray from '../assets/medal_gold_gray.png';

// 地点勋章图标
import locationBronze from '../assets/location_bronze.png';
import locationBronzeGray from '../assets/location_bronze_gray.png';
import locationSilver from '../assets/location_silver.png';
import locationSilverGray from '../assets/location_silver_gray.png';
import locationGold from '../assets/location_gold.png';
import locationGoldGray from '../assets/location_gold_gray.png';

export default function Sidebar({ type = 'default', image, onClose, username, log, refreshLogs }) {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logDetails, setLogDetails] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const pageSize = 5;

  const [showLocations, setShowLocations] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [medalList, setMedalList] = useState([]);
  const [showMedals, setShowMedals] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);

  const totalPages = Math.ceil(total / pageSize);
  const currentLog = selectedLog || log;

  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [allLogsData, setAllLogsData] = useState([]);

  // 获取全部日志（用于图表）
  const fetchAllLogs = async () => {
    try {
      const res = await api.get(`/api/users/${username}/logs`);
      setAllLogsData(res.data.logs || []);
    } catch (err) {
      console.error('[图表] 获取全部日志失败:', err);
    }
  };

  // 初始加载用户统计
  useEffect(() => {
    if (type === 'default' && username) {
      getUserStats();
    }
  }, [username, type]);

  // sidebar 宽度拖拽
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 400 && newWidth <= 720) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // 获取用户统计
  const getUserStats = async () => {
    try {
      const res = await api.get(`/api/users/${username}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取已标记地点
  const fetchLocations = async () => {
    try {
      const res = await api.get(`/api/users/${username}/locations`);
      setLocationList(res.data.locations);
      setShowLocations(true);
      setShowLogs(false);
    } catch (err) {
      console.error('获取地点失败：', err);
    }
  };

  // 获取日志
  const fetchLogs = async (pageOverride = page) => {
    try {
      const res = await api.get(`/api/users/${username}/logs`, {
        params: { keyword, city, page: pageOverride, limit: pageSize },
      });
      setLogDetails(res.data.logs);
      setTotal(res.data.total);
      setShowLogs(true);
      setSelectedLog(null);
    } catch (err) {
      console.error('获取日志失败:', err);
    }
  };

  // 计算勋章（修复：避免死循环）
  const fetchMedals = (show = true) => {
    if (!stats) return;

    const logCount = stats.logs_count;
    const markedCount = stats.marked_count;

    const logMedals = [
      { name: '初学者', earned: logCount >= 1, image_url: logCount >= 1 ? medalBronze : medalBronzeGray, description: '上传 1 条日志即可获得此勋章' },
      { name: '熟练旅者', earned: logCount >= 10, image_url: logCount >= 10 ? medalSilver : medalSilverGray, description: '上传 10 条日志即可获得此勋章' },
      { name: '足迹大师', earned: logCount >= 50, image_url: logCount >= 50 ? medalGold : medalGoldGray, description: '上传 50 条日志即可获得此勋章' },
    ];

    const locationMedals = [
      { name: '探索者', earned: markedCount >= 1, image_url: markedCount >= 1 ? locationBronze : locationBronzeGray, description: '标记 1 个地点即可获得此勋章' },
      { name: '探险家', earned: markedCount >= 5, image_url: markedCount >= 5 ? locationSilver : locationSilverGray, description: '标记 5 个地点即可获得此勋章' },
      { name: '地图征服者', earned: markedCount >= 20, image_url: markedCount >= 20 ? locationGold : locationGoldGray, description: '标记 20 个地点即可获得此勋章' },
    ];

    const allMedals = [...logMedals, ...locationMedals];
    setMedalList(allMedals);

    const earnedCount = allMedals.filter((m) => m.earned).length;

    // ✅ 只有在变化时才更新 stats，避免死循环
    if (stats.medals_count !== earnedCount) {
      setStats((prev) => ({ ...prev, medals_count: earnedCount }));
    }

    if (show) {
      setShowMedals(true);
      setShowLogs(false);
      setShowLocations(false);
      setShowStatsChart(false);
    }
  };

  // 删除日志
  const handleDeleteLog = async (logId) => {
    if (!window.confirm('确定删除该日志吗？')) return;
    try {
      await api.delete(`/api/users/${username}/logs/${logId}`);
      fetchLogs();
      refreshLogs?.();
      getUserStats();
    } catch {
      alert('删除失败');
    }
  };

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  // 导出日志
  const downloadLogFile = async ({ username, logId = '', type = 'csv' }) => {
    try {
      const params = { username, type };
      if (logId) params.logId = logId;

      const res = await api.get('/api/exports', {
        params,
        responseType: 'blob',
      });

      const blob = res.data;
      let filename = logId ? `log_${logId}.${type}` : `logs_export.${type}`;
      const disposition = res.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请稍后重试');
    }
  };

  return (
    <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar-content">
        {(type === 'logDetail' && log) || selectedLog ? (
          <>
            <button className="close-btn" onClick={() => { if (onClose) onClose(); setSelectedLog(null); }}>←</button>
            <div className="panel-content">
              <h3>📍 {currentLog.location_display_name || currentLog.location_name}</h3>
              <p><strong>🕒 时间：</strong>{new Date(currentLog.created_at).toLocaleString()}</p>
              <p><strong>📝 日志内容：</strong>{currentLog.content}</p>
              {currentLog.image_path && (
                <div style={{ marginTop: '10px' }}>
                  <strong>🖼 图片：</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(JSON.parse(currentLog.image_path) || []).map((src, idx) => (
                      <img key={idx} src={`${api.defaults.baseURL}${src}`} alt={`图片${idx + 1}`} style={{ width: '100%' }} />
                    ))}
                  </div>
                </div>
              )}
              <button className="export1-btn" onClick={() => {
                const user = username || localStorage.getItem('username');
                downloadLogFile({ username: user, logId: currentLog.id, type: 'pdf' });
              }}>导出此日志（PDF）</button>
            </div>
          </>
        ) : showLocations ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
            <button onClick={() => setShowLocations(false)} className="btn-return">返回</button>
            <h4>📍 已标记地点</h4>
            {locationList.map((loc, idx) => (
              <div key={idx} className="log-item" style={{ cursor: 'pointer', padding: '8px', borderBottom: '1px solid #eee' }}>
                {loc.location_display_name || loc.location_name}
              </div>
            ))}
          </div>
        ) : showMedals ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
            <button onClick={() => setShowMedals(false)} className="btn-return">返回</button>
            <h4 style={{ marginBottom: '10px' }}>🏅 我的勋章</h4>
            {medalList.length > 0 ? (
              <div className="medal-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {medalList.map((medal, idx) => (
                  <div key={idx} className={`medal-item ${medal.earned ? 'earned' : 'unearned'}`} style={{
                    borderRadius: '12px',
                    background: medal.earned ? '#f0fff0' : '#f8f8f8',
                    border: medal.earned ? '2px solid #5cb85c' : '2px dashed #ccc',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    padding: '12px',
                    transition: 'transform 0.2s',
                    cursor: 'default',
                  }}
                    title={medal.description}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}>
                    <img src={medal.image_url} alt={medal.name} style={{
                      width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px',
                      filter: medal.earned ? 'none' : 'grayscale(100%)', marginBottom: '8px',
                    }} />
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: medal.earned ? '#333' : '#aaa' }}>
                      {medal.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {medal.description}
                    </div>
                  </div>
                ))}
              </div>
            ) : <p>暂无勋章</p>}
          </div>
        ) : showStatsChart ? (
          <div style={{ padding: '0 10px' }}>
            <button onClick={() => setShowStatsChart(false)} className="btn-return">返回</button>
            <h4>📈 城市标记统计</h4>
            <Suspense fallback={<div>加载中...</div>}>
              <StatsChart logsData={allLogsData} />
            </Suspense>
          </div>
        ) : showLogs ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px' }}>
            <button onClick={() => setShowLogs(false)} className="btn-return">返回</button>
            <h4>📓 日志列表</h4>
            <div style={{ marginBottom: '10px' }}>
              <div className="search-bar">
                <input className="search-input" placeholder="关键词" value={keyword} onChange={e => setKeyword(e.target.value)} />
                <input className="search-input" placeholder="城市" value={city} onChange={e => setCity(e.target.value)} />
                <button className="search-btn" onClick={() => { setPage(1); fetchLogs(1); }}>搜索</button>
                <button className="reset-btn" onClick={() => { setKeyword(''); setCity(''); fetchLogs(1); }}>重置</button>
              </div>
            </div>
            <button className="export-btn" onClick={() => { downloadLogFile({ username, type: 'csv' }); }}>导出全部日志（CSV）</button>
            {logDetails.map((log, idx) => (
              <div key={idx} className="log-item" onClick={() => setSelectedLog(log)}
                style={{ cursor: 'pointer', borderBottom: '1px solid #ccc', marginBottom: '8px' }}>
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
        ) : (
          <>
            <div className="user-info">
              <div className="user-avatar"><img src={avatarImg} alt="avatar" /></div>
              <div className="username">{username}</div>
              <div className="user-buttons">
                <button className="logout-button" onClick={handleLogout}>退出登录</button>
                <button className="chart-button" onClick={async () => {
                  await fetchAllLogs();
                  setShowStatsChart(true);
                  setShowMedals(false);
                  setShowLogs(false);
                  setShowLocations(false);
                }}>可视分析</button>
              </div>
            </div>
            <hr className="divider" />
            {!stats ? (
              <div>加载中...</div>
            ) : (
              <div className="stats">
                <div className="stat-block" onClick={fetchLocations} style={{ cursor: 'pointer' }}>
                  <div className="stat-number">{stats.marked_count}</div>
                  <div className="stat-label">已标记地点</div>
                </div>
                <div className="stat-block" onClick={() => fetchLogs(1)} style={{ cursor: 'pointer' }}>
                  <div className="stat-number">{stats.logs_count}</div>
                  <div className="stat-label">已上传日志</div>
                </div>
                <div className="stat-block" onClick={() => fetchMedals(true)} style={{ cursor: 'pointer' }}>
                  <div className="stat-number">{stats.medals_count}</div>
                  <div className="stat-label">已获得勋章</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="resizer" onMouseDown={() => setIsResizing(true)} />
    </div>
  );
}
