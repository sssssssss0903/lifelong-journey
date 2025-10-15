import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 解决 __dirname 在 ES module 里不可用的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 默认从项目根目录加载 .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  PORT: process.env.PORT || 3001,
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 3306,
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'lifelong_journey',
  JWT_SECRET: process.env.JWT_SECRET || 'my_secret_key',
  //  新增导出目录配置
  EXPORT_DIR: process.env.EXPORT_DIR 
    ? path.resolve(process.env.EXPORT_DIR) 
    : path.resolve(__dirname, '../exports'),
};
