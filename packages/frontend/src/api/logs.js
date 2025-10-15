import api from './request';

/**
 * 获取用户日志
 * @param {string} username 用户名
 * @param {Object} params 查询参数 { keyword, city, page, limit }
 */
export const getUserLogs = (username, params = {}) =>
  api.get(`/api/users/${username}/logs`, { params });

/**
 * 上传日志
 * @param {string} username
 * @param {Object} data { location_name, location_display_name, content, longitude, latitude, images }
 */
export const uploadLog = (username, data) =>
  api.post(`/api/users/${username}/upload`, data);

/**
 * 删除日志
 * @param {string} username
 * @param {number} id 日志 ID
 */
export const deleteLog = (username, id) =>
  api.delete(`/api/users/${username}/log/${id}`);

/**
 * 获取标记地点
 * @param {string} username
 */
export const getMarkedLocations = (username) =>
  api.get(`/api/users/${username}/marked`);
