import jwt from 'jsonwebtoken';

import { config } from '../config/env.js';

const SECRET_KEY = config.JWT_SECRET;

// 生成 token
export function generateToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: '2h' }); // 有效期 2 小时
}

// 验证 token
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}
