import express from 'express';
import { login, register } from '../controllers/authController.js';

// 这个 router 同时挂在 /api/sessions 和 /api/users 下：
// - POST /api/sessions  → login（创建一个会话资源）
// - POST /api/users     → register（创建一个用户资源）
// 比起 /api/auth/login + /api/auth/register 更 RESTful

export const sessionsRouter = express.Router();
sessionsRouter.post('/', login); // POST /api/sessions

export const usersAuthRouter = express.Router();
usersAuthRouter.post('/', register); // POST /api/users
