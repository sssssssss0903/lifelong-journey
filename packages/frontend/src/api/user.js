import api from './request';

/**
 * 用户登录
 * @param {Object} data - 登录信息 { username, password }
 * @returns {Promise} axios响应
 */
export const login = (data) => api.post('/api/auth/login', data);

/**
 * 用户注册
 * @param {Object} data - 注册信息
 */
export const register = (data) => api.post('/api/auth/register', data);

/**
 * 获取当前用户信息
 */
export const getProfile = () => api.get('/api/users/profile');
/**
 * 获取用户统计信息
 * @param {string} username 用户名
 * @returns Promise
 */
export const getUserStats = (username) =>
  api.get(`/api/users/${username}/stats`);

/**
 * 更新勋章（触发服务器重新计算）
 * @param {string} username
 */
export const updateUserMedals = (username) =>
  api.post(`/api/users/${username}/medals`);