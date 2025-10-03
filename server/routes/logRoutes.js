// routes/logRoutes.js
import express from 'express';
import { uploadLog, getUserLogs, deleteLog, getMarkedLocations } from '../controllers/logController.js';
import { multiUpload } from '../config/multer.js';

const router = express.Router();

// 获取用户日志
router.get('/:username/logs', getUserLogs);

// 上传日志
router.post('/:username/logs', multiUpload, uploadLog);

// 删除日志
router.delete('/:username/logs/:id', deleteLog);

// 获取用户标记地点
router.get('/:username/locations', getMarkedLocations);

export default router;
