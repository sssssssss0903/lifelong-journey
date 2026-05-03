import axios from 'axios';

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 20000,
});

// 请求拦截器：JWT 注入
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：按 HTTP 状态码语义化处理
// 后端统一错误格式：{ code, message, status, details? }
service.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data || {};
    // 把后端规范化错误信息透传到 error.message，业务层可直接 alert(err.message)
    if (payload.message) error.message = payload.message;

    switch (status) {
      case 401:
        // 未认证：清登录态跳登录
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        if (!location.hash.includes('/login')) location.hash = '#/login';
        break;
      case 403:
        alert(payload.message || '无权限访问该资源');
        break;
      case 404:
        // 不主动 alert，让业务层自己决定（很多列表查询 404 是合理的）
        break;
      case 409:
        alert(payload.message || '资源冲突');
        break;
      case 422:
        alert(payload.message || '业务校验未通过');
        break;
      case 500:
        alert(payload.message || '服务器繁忙，请稍后再试');
        break;
      default:
        if (!status) console.warn('[network]', error.message);
    }
    return Promise.reject(error);
  }
);

export default service;
