// 统一 API 响应工具：成功 / 失败 / HTTP 状态码语义化

// 自定义错误类：controller 抛出，errorHandler 兜底统一格式
export class ApiError extends Error {
  constructor(status, message, code = undefined, details = undefined) {
    super(message);
    this.status = status;       // HTTP 状态码 400/401/403/404/409/422/500
    this.code = code;           // 业务错误码字符串，如 'AUTH_INVALID_CREDENTIALS'
    this.details = details;     // 附加信息（字段级校验错误等）
    this.name = 'ApiError';
  }
}

// 常用快捷构造器
export const BadRequest    = (msg = '请求参数错误', code = 'BAD_REQUEST', details) => new ApiError(400, msg, code, details);
export const Unauthorized  = (msg = '未登录或登录已过期', code = 'UNAUTHORIZED') => new ApiError(401, msg, code);
export const Forbidden     = (msg = '无权限访问该资源', code = 'FORBIDDEN') => new ApiError(403, msg, code);
export const NotFound      = (msg = '资源不存在', code = 'NOT_FOUND') => new ApiError(404, msg, code);
export const Conflict      = (msg = '资源冲突', code = 'CONFLICT') => new ApiError(409, msg, code);
export const Unprocessable = (msg = '业务校验未通过', code = 'UNPROCESSABLE_ENTITY', details) => new ApiError(422, msg, code, details);

// 成功响应：data 直接放在 body，符合 RESTful 资源直出风格
// 200 OK     —— 查询、删除等
// 201 Created —— 创建资源（建议带 Location 头）
// 204 No Content —— 删除/更新无返回体
export const ok = (res, data) => res.status(200).json(data);

export const created = (res, data, location) => {
  if (location) res.setHeader('Location', location);
  res.status(201).json(data);
};

export const noContent = (res) => res.status(204).end();

// 用户名白名单校验，非法直接抛 ApiError
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
export const assertUsername = (username) => {
  if (!username || !USERNAME_REGEX.test(username)) {
    throw BadRequest('用户名格式非法', 'INVALID_USERNAME');
  }
};

// 所有权校验：JWT 解出的 username 必须等于 URL 里的 username
export const assertOwnership = (req) => {
  if (req.user?.username !== req.params.username) {
    throw Forbidden('禁止访问他人数据', 'OWNERSHIP_VIOLATION');
  }
};
