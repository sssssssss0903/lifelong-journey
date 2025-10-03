import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { initDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import medalRoutes from './routes/medalRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 初始化数据库
initDB();

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', logRoutes);  //  把 logRoutes 挂载到 /api/users
app.use('/api/exports', exportRoutes);
app.use('/api/medals', medalRoutes);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// 全局错误处理
app.use(errorHandler);

const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log('静态资源目录:', path.join(process.cwd(), 'uploads'));

  console.log(`✅ Server running at http://localhost:${PORT}`);
});
