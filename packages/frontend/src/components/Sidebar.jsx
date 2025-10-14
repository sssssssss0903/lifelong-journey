import { useNavigate } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import avatarImg from '../assets/avatar.png';
import MedalPanel from './MedalPanel';
import UserHeader from './UserHeader';
import LogList from './LogList';
import LogDetail from './LogDetail';
import LocationList from './LocationList';

const StatsChart = lazy(() => import('./StatsChart'));


import api from '../api';


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
  const fetchMedals = async (show = true) => {
  try {
    // 1️⃣ 通知后端重新计算勋章数量
    await api.post(`/api/users/${username}/medals`);

    // 2️⃣ 重新获取最新统计数据（包括 medals_count）
    const res = await api.get(`/api/users/${username}/stats`);
    setStats(res.data);

    // 3️⃣ 打开勋章展示界面
    if (show) {
      setShowMedals(true);
      setShowLogs(false);
      setShowLocations(false);
      setShowStatsChart(false);
    }
  } catch (err) {
    console.error('更新勋章失败:', err);
    alert('更新勋章失败，请稍后重试');
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
  {selectedLog ? (
    <LogDetail
      log={currentLog}
      onBack={() => setSelectedLog(null)}
      onExport={() => downloadLogFile({ username, logId: currentLog.id, type: 'pdf' })}
    />
  ) : showLogs ? (
    <LogList
      logs={logDetails}
      page={page}
      totalPages={totalPages}
      keyword={keyword}
      city={city}
      onKeywordChange={e => setKeyword(e.target.value)}
      onCityChange={e => setCity(e.target.value)}
      onSearch={() => { setPage(1); fetchLogs(1); }}
      onReset={() => { setKeyword(''); setCity(''); fetchLogs(1); }}
      onSelectLog={setSelectedLog}
      onDeleteLog={handleDeleteLog}
      onPageChange={p => { setPage(p); fetchLogs(p); }}
      onBack={() => setShowLogs(false)}
      onExport={() => downloadLogFile({ username, type: 'csv' })}
    />
  ) : showLocations ? (
    <LocationList locations={locationList} onBack={() => setShowLocations(false)} />
  ) : showMedals ? (
    <MedalPanel stats={stats} onBack={() => setShowMedals(false)} />
  ) : showStatsChart ? (
    <div style={{ padding: '0 10px' }}>
      <button onClick={() => setShowStatsChart(false)} className="btn-return">返回</button>
      <h4> 城市标记统计</h4>
      <Suspense fallback={<div>加载中...</div>}>
        <StatsChart logsData={allLogsData} />
      </Suspense>
    </div>
  ) : (
    <>
      <UserHeader
        username={username}
        onLogout={handleLogout}
        onChart={async () => {
          await fetchAllLogs();
          setShowStatsChart(true);
          setShowMedals(false);
          setShowLogs(false);
          setShowLocations(false);
        }}
      />
      {/* 统计区 */}
      {!stats ? (
        <div>加载中...</div>
      ) : (
        <div className="stats">
          <div className="stat-block" onClick={fetchLocations}>
            <div className="stat-number">{stats.marked_count}</div>
            <div className="stat-label">已标记地点</div>
          </div>
          <div className="stat-block" onClick={() => fetchLogs(1)}>
            <div className="stat-number">{stats.logs_count}</div>
            <div className="stat-label">已上传日志</div>
          </div>
          <div className="stat-block" onClick={() => fetchMedals(true)}>
            <div className="stat-number">{stats.medals_count}</div>
            <div className="stat-label">已获得勋章</div>
          </div>
        </div>
      )}
    </>
  )}
</div>

    </div>
  );
}
