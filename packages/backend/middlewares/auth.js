import { verifyToken } from '../utils/jwt.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization']; // 从请求头取 token
 if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '缺少或格式错误的 Token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Token 无效或已过期' });
  }
  req.user = decoded; // 在请求对象中保存用户信息
  next(); // 放行
}
