import express from 'express';
import { updateMedals } from '../controllers/medalController.js';
const router = express.Router();

router.post('/:username/medals', updateMedals);

export default router;
