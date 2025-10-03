import express from 'express';
import { exportLogs } from '../controllers/exportController.js';

const router = express.Router();

// GET /api/exports
router.get('/', exportLogs);

export default router;
