import { useNavigate } from 'react-router-dom';
import { useState, Suspense, lazy } from 'react';
import avatarImg from '../assets/avatar.png';
import MedalPanel from '../components/MedalPanel';
import UserHeader from '../components/UserHeader';
import LogList from '../components/LogList';
import LogDetail from '../components/LogDetail';
import LocationList from '../components/LocationList';
import { useUserData } from '../hooks/useUserData';
import { useResizableWidth } from '../hooks/useResizableWidth';
import { useDownload } from '../hooks/useDownload';
import { useSidebarStore } from '../store/useSidebarStore';

const StatsChart = lazy(() => import('../components/StatsChart'));

export default function Sidebar({ type = 'default', image, onClose, username, log, refreshLogs }) {
  const navigate = useNavigate();
  const {
    stats, logs, total, locations, loading,
    getUserStats, fetchLogs, fetchAllLogs, fetchLocations, fetchMedals, pageSize
  } = useUserData(username, type);

  const { width: sidebarWidth, isResizing, setIsResizing } = useResizableWidth();
  const { downloadLogFile } = useDownload();

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  
  const { mode, setMode, selectedLog, setSelectedLog, allLogsData, setAllLogsData } = useSidebarStore();

  const totalPages = Math.ceil(total / pageSize);
  const currentLog = selectedLog || log;

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm('确定删除该日志吗？')) return;
    try {
      await api.delete(`/api/users/${username}/logs/${logId}`);
      fetchLogs({ keyword, city, page });
      refreshLogs?.();
      getUserStats();
    } catch {
      alert('删除失败');
    }
  };

  return (
    <div className="sidebar" style={{ width: `${sidebarWidth}px` }}>
      <div className="sidebar-content">
       {mode === 'detail' ? (
  <LogDetail
    log={selectedLog || log}
    onBack={() => setMode('logs')}
    onExport={() => downloadLogFile({ username, logId: (selectedLog || log).id, type: 'pdf' })}
  />
) : mode === 'logs' ? (
  <LogList
    logs={logs}
    page={page}
    totalPages={totalPages}
    keyword={keyword}
    city={city}
    onKeywordChange={(e) => setKeyword(e.target.value)}
    onCityChange={(e) => setCity(e.target.value)}
    onSearch={() => { setPage(1); fetchLogs({ keyword, city, page: 1 }); }}
    onReset={() => { setKeyword(''); setCity(''); fetchLogs({ page: 1 }); }}
    onSelectLog={(log) => setSelectedLog(log)}
    onDeleteLog={handleDeleteLog}
    onPageChange={(p) => { setPage(p); fetchLogs({ keyword, city, page: p }); }}
    onBack={() => setMode('home')}
    onExport={() => downloadLogFile({ username, type: 'csv' })}
  />
) : mode === 'locations' ? (
  <LocationList locations={locations} onBack={() => setMode('home')} />
) : mode === 'medals' ? (
  <MedalPanel stats={stats} onBack={() => setMode('home')} />
) : mode === 'stats' ? (
  <div style={{ padding: '0 10px' }}>
    <button onClick={() => setMode('home')} className="btn-return">返回</button>
    <h4>日志上传统计</h4>
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
        const data = await fetchAllLogs();
        setAllLogsData(data);
        setMode('stats');
      }}
    />
    {!stats ? (
      <div>加载中...</div>
    ) : (
      <div className="stats">
        <div
          className="stat-block"
          onClick={() => {
            fetchLocations();
            setMode('locations');
          }}
        >
          <div className="stat-number">{stats.marked_count}</div>
          <div className="stat-label">已标记地点</div>
        </div>
        <div
          className="stat-block"
          onClick={() => {
            fetchLogs({ page: 1 });
            setMode('logs');
          }}
        >
          <div className="stat-number">{stats.logs_count}</div>
          <div className="stat-label">已上传日志</div>
        </div>
        <div
          className="stat-block"
          onClick={() => {
            fetchMedals();
            setMode('medals');
          }}
        >
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
