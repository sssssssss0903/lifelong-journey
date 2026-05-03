import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { initDB } from './config/db.js';

import { sessionsRouter, usersAuthRouter } from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import logRoutes from './routes/logRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import medalRoutes from './routes/medalRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Location'], // 让前端能读到 201 Created 的 Location 头
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源（上传完成的最终文件）
app.use('/static', express.static(path.resolve('uploads/files')));

initDB();

// ─────────────── 路由挂载（RESTful 风格）───────────────
// 资源根 URL                              | HTTP 动词    | 含义
// ----------------------------------------|--------------|-------------------------
// POST   /api/users                       | 创建用户     | 注册
// POST   /api/sessions                    | 创建会话     | 登录（返回 token）
// GET    /api/users/:u/stats              | 查询统计     |
// GET    /api/users/:u/logs               | 列表 + 搜索 + 分页
// POST   /api/users/:u/logs               | 创建日志     | 201
// DELETE /api/users/:u/logs/:id           | 删除日志     | 204
// GET    /api/users/:u/locations          | 标记地点列表 |
// PUT    /api/users/:u/medals             | 重算勋章     | 幂等更新
// GET    /api/exports                     | 导出文件     | 二进制流
// POST   /api/uploads/check               | 秒传探测     | controller resource
// GET    /api/uploads/status              | 续传探测     |
// POST   /api/uploads/chunks              | 上传分块     |
// POST   /api/uploads/complete            | 合并         | 201

app.use('/api/sessions', sessionsRouter);
app.use('/api/users', usersAuthRouter);   // POST /api/users → 注册
app.use('/api/users', userRoutes);        // GET /api/users/:u/stats
app.use('/api/users', logRoutes);         // GET/POST/DELETE /api/users/:u/logs
app.use('/api/users', medalRoutes);       // PUT /api/users/:u/medals
app.use('/api/exports', exportRoutes);
app.use('/api', uploadRoutes);            // /api/uploads/*

// 404 兜底（必须挂在所有业务路由之后）
app.use(notFoundHandler);

// 全局错误处理（必须放最后）
app.use(errorHandler);

const PORT = config.PORT || 3001;
app.listen(PORT, () => {
  console.log('静态资源目录:', path.join(process.cwd(), 'uploads'));
  console.log(`Server running at http://localhost:${PORT}`);
});
