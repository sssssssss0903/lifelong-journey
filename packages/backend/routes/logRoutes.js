import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadLog, getUserLogs, deleteLog, getMarkedLocations } from '../controllers/logController.js';

const router = express.Router();

// 全部日志接口前置鉴权
router.use(authMiddleware);

// 资源命名统一为 logs（复数）
router.post('/:username/logs', uploadLog);              // 201
router.get('/:username/logs', getUserLogs);             // 200
router.delete('/:username/logs/:id', deleteLog);        // 204（之前是 /log/:id 单数）
router.get('/:username/locations', getMarkedLocations); // 200

export default router;
