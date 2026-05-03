import { useState, useEffect, useCallback } from 'react';
import {
  getUserStats,
  getUserLogs,
  getMarkedLocations,
  updateUserMedals,
} from '../api/index'; //  全部走封装好的 API

/**
 * 管理用户相关数据（统计、日志、地点、勋章）
 */
export function useUserData(username, type = 'default') {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [locations, setLocations] = useState([]);
  const [medals, setMedals] = useState([]);
  const [loading, setLoading] = useState(true);

  const pageSize = 5;

  /**  获取统计 */
  const fetchUserStats = useCallback(async () => {
    if (!username) return;
    try {
      const res = await getUserStats(username);
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  /**  分页获取日志 */
  const fetchLogs = useCallback(
    async ({ keyword = '', city = '', page = 1 } = {}) => {
      if (!username) return;
      try {
        const res = await getUserLogs(username, {
          keyword,
          city,
          page,
          limit: pageSize,
        });
        setLogs(res.data.logs);
        // 后端响应结构：{ logs, pagination: { total, totalPages, page, limit } }
        setTotal(res.data.pagination?.total ?? res.data.total ?? 0);
      } catch (err) {
        console.error('获取日志失败:', err);
      }
    },
    [username]
  );

  /**  获取所有日志 */
  const fetchAllLogs = useCallback(async () => {
    if (!username) return [];
    try {
      const res = await getUserLogs(username);
      return res.data.logs || [];
    } catch (err) {
      console.error('获取全部日志失败:', err);
      return [];
    }
  }, [username]);

  /**  获取地点 */
  const fetchLocations = useCallback(async () => {
    if (!username) return;
    try {
      const res = await getMarkedLocations(username);
      setLocations(res.data.locations);
    } catch (err) {
      console.error('获取地点失败:', err);
    }
  }, [username]);

  /**  更新勋章 */
  const fetchMedals = useCallback(async () => {
    if (!username) return;
    try {
      const res = await updateUserMedals(username);
      setMedals(res.data);
      await fetchUserStats(); // 更新统计中的勋章数
    } catch (err) {
      console.error('更新勋章失败:', err);
    }
  }, [username, fetchUserStats]);

  /** 初始化：进入页面自动拉取统计 */
  useEffect(() => {
    if (type === 'default' && username) {
      fetchUserStats();
    }
  }, [username, type, fetchUserStats]);

  return {
    stats,
    logs,
    total,
    locations,
    medals,
    loading,
    fetchUserStats,
    fetchLogs,
    fetchAllLogs,
    fetchLocations,
    fetchMedals,
    pageSize,
  };
}
