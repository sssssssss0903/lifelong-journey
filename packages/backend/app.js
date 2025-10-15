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
import uploadRoutes from './routes/uploadRoutes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// 中间件
app.use(cors({
  origin: 'http://localhost:5173', // 精确指定前端来源
  credentials: true,               //  允许携带 cookie/token
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 让上传后的文件可直接访问
app.use("/static", express.static(path.resolve("uploads/files")));
// 初始化数据库
initDB();

// 路由挂载
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/users', medalRoutes);
app.use('/api/users', logRoutes);  //  把 logRoutes 挂载到 /api/users
app.use('/api/exports', exportRoutes);

app.use('/api', uploadRoutes);


//app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// 全局错误处理
app.use(errorHandler);

const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log('静态资源目录:', path.join(process.cwd(), 'uploads'));

  console.log(`  Server running at http://localhost:${PORT}`);
});
