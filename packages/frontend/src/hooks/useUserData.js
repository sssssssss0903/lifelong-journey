import { useState, useEffect, useCallback } from 'react';
import api from '../api';

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

  const getUserStats = useCallback(async () => {
    if (!username) return;
    try {
      const res = await api.get(`/api/users/${username}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error('获取统计失败:', err);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchLogs = useCallback(async ({ keyword = '', city = '', page = 1 }) => {
    if (!username) return;
    try {
      const res = await api.get(`/api/users/${username}/logs`, {
        params: { keyword, city, page, limit: pageSize },
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error('获取日志失败:', err);
    }
  }, [username]);

  const fetchAllLogs = useCallback(async () => {
    try {
      const res = await api.get(`/api/users/${username}/logs`);
      return res.data.logs || [];
    } catch (err) {
      console.error('获取全部日志失败:', err);
      return [];
    }
  }, [username]);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await api.get(`/api/users/${username}/locations`);
      setLocations(res.data.locations);
    } catch (err) {
      console.error('获取地点失败:', err);
    }
  }, [username]);

  const fetchMedals = useCallback(async () => {
    try {
      await api.post(`/api/users/${username}/medals`);
      await getUserStats(); // 更新勋章数
    } catch (err) {
      console.error('更新勋章失败:', err);
    }
  }, [username, getUserStats]);

  useEffect(() => {
    if (type === 'default' && username) {
      getUserStats();
    }
  }, [username, type, getUserStats]);

  return {
    stats, logs, total, locations, medals, loading,
    getUserStats, fetchLogs, fetchAllLogs, fetchLocations, fetchMedals, pageSize
  };
}
