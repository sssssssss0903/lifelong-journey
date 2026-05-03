import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { updateMedals } from '../controllers/medalController.js';

const router = express.Router();

// PUT 比 POST 更合适：基于当前统计重算勋章数，幂等更新
router.put('/:username/medals', authMiddleware, updateMedals);

export default router;
