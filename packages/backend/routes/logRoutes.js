import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadLog, getUserLogs, deleteLog, getMarkedLocations } from '../controllers/logController.js';

const router = express.Router();

// 所有日志相关操作都要鉴权
router.post('/:username/logs', authMiddleware, uploadLog);
router.get('/:username/logs', authMiddleware, getUserLogs);
router.delete('/:username/log/:id', authMiddleware, deleteLog);
router.get('/:username/locations', authMiddleware, getMarkedLocations);

export default router;
