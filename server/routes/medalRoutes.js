import express from 'express';
import { getUserMedals } from '../controllers/medalController.js';

const router = express.Router();

// GET /api/medals
router.get('/', getUserMedals);

export default router;
