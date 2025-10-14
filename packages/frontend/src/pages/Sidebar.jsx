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
  const [selectedLog, setSelectedLog] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [showLocations, setShowLocations] = useState(false);
  const [showMedals, setShowMedals] = useState(false);
  const [showStatsChart, setShowStatsChart] = useState(false);
  const [allLogsData, setAllLogsData] = useState([]);

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
        {selectedLog ? (
          <LogDetail
            log={currentLog}
            onBack={() => setSelectedLog(null)}
            onExport={() => downloadLogFile({ username, logId: currentLog.id, type: 'pdf' })}
          />
        ) : showLogs ? (
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
            onSelectLog={setSelectedLog}
            onDeleteLog={handleDeleteLog}
            onPageChange={(p) => { setPage(p); fetchLogs({ keyword, city, page: p }); }}
            onBack={() => setShowLogs(false)}
            onExport={() => downloadLogFile({ username, type: 'csv' })}
          />
        ) : showLocations ? (
          <LocationList locations={locations} onBack={() => setShowLocations(false)} />
        ) : showMedals ? (
          <MedalPanel stats={stats} onBack={() => setShowMedals(false)} />
        ) : showStatsChart ? (
          <div style={{ padding: '0 10px' }}>
            <button onClick={() => setShowStatsChart(false)} className="btn-return">返回</button>
            <h4>城市标记统计</h4>
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
                setShowStatsChart(true);
                setShowMedals(false);
                setShowLogs(false);
                setShowLocations(false);
              }}
            />
            {!stats ? (
              <div>加载中...</div>
            ) : (
              <div className="stats">
                <div className="stat-block" onClick={() => { fetchLocations(); setShowLocations(true); }}>
                  <div className="stat-number">{stats.marked_count}</div>
                  <div className="stat-label">已标记地点</div>
                </div>
                <div className="stat-block" onClick={() => { fetchLogs({ page: 1 }); setShowLogs(true); }}>
                  <div className="stat-number">{stats.logs_count}</div>
                  <div className="stat-label">已上传日志</div>
                </div>
                <div className="stat-block" onClick={() => { fetchMedals(); setShowMedals(true); }}>
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
