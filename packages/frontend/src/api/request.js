import axios from 'axios';

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001', // 动态配置
  timeout: 20000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
     console.log(' 当前请求：', config.url, 'Token =', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
service.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    switch (status) {
      case 401:
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      window.location.href = '/login';
        break;
      case 403:
        alert('无权限访问该资源');
        break;
      case 404:
        alert('请求的资源不存在');
        break;
      case 500:
        alert('服务器繁忙，请稍后再试');
        break;
    }
    return Promise.reject(error);
  }
);

export default service;
