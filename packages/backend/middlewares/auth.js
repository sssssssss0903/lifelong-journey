import { verifyToken } from '../utils/jwt.js';
import { Unauthorized } from '../utils/apiResponse.js';

export function authMiddleware(req, _res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return next(Unauthorized('缺少或格式错误的 Token', 'AUTH_MISSING_TOKEN'));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return next(Unauthorized('Token 无效或已过期', 'AUTH_INVALID_TOKEN'));
  }

  req.user = decoded;
  next();
}
