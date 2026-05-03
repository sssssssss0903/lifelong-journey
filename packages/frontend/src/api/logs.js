import api from './request';

// 列表 + 搜索 + 分页
// 后端响应：{ logs: [...], pagination: { page, limit, total, totalPages } }
export const getUserLogs = (username, params = {}) =>
  api.get(`/api/users/${username}/logs`, { params });

// 创建日志 → POST 用户的 logs 资源（之前误用 /upload 路径）
export const uploadLog = (username, data) =>
  api.post(`/api/users/${username}/logs`, data);

// 删除 → DELETE /api/users/:u/logs/:id  (之前是 /log/:id，单数)
// 成功返回 204 No Content（response.data 为空字符串/undefined）
export const deleteLog = (username, id) =>
  api.delete(`/api/users/${username}/logs/${id}`);

// 标记地点列表
export const getMarkedLocations = (username) =>
  api.get(`/api/users/${username}/locations`);
