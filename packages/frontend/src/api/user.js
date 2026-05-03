import api from './request';

// 登录 → POST /api/sessions （创建会话资源）
export const login = (data) => api.post('/api/sessions', data);

// 注册 → POST /api/users  （创建用户资源）
export const register = (data) => api.post('/api/users', data);

// 用户统计
export const getUserStats = (username) =>
  api.get(`/api/users/${username}/stats`);

// 重算勋章 → PUT 幂等更新
export const updateUserMedals = (username) =>
  api.put(`/api/users/${username}/medals`);
