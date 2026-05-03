import { ApiError } from '../utils/apiResponse.js';

// 统一错误响应格式（参考 RFC 7807 Problem Details，做了简化）
// {
//   code:    业务错误码字符串
//   message: 给用户看的提示
//   status:  HTTP 状态码
//   details: 字段级错误数组（可选）
// }
export const errorHandler = (err, req, res, _next) => {
  // 已知 ApiError：使用其 status / code
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      code: err.code || 'API_ERROR',
      message: err.message,
      status: err.status,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // multer 文件上传错误
  if (err?.name === 'MulterError') {
    return res.status(400).json({
      code: 'UPLOAD_ERROR',
      message: err.message,
      status: 400,
    });
  }

  // MySQL 错误：唯一键冲突映射 409
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      code: 'DUPLICATE_ENTRY',
      message: '资源已存在',
      status: 409,
    });
  }

  // 兜底：5xx 内部错误
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : (err.message || 'unknown'),
    status: 500,
  });
};

// 404 兜底（路由没匹配到）
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    code: 'ROUTE_NOT_FOUND',
    message: `路径 ${req.method} ${req.originalUrl} 不存在`,
    status: 404,
  });
};
