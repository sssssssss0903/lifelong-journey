import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { getUserStats } from '../controllers/userController.js';

const router = express.Router();

// 用户私有信息需要鉴权
router.get('/:username/stats', authMiddleware, getUserStats);

export default router;
