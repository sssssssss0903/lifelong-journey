import express from 'express';
import { getUserStats } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/:username/stats
router.get('/:username/stats', getUserStats);

export default router;
