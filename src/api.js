import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // 明确声明接口服务地址
});

export default api;