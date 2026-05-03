import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { exportLogs } from '../controllers/exportController.js';

const router = express.Router();

// 导出文件 = 私有数据，必须鉴权
router.get('/', authMiddleware, exportLogs);

export default router;
