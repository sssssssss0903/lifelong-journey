import db from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import {
  ok,
  created,
  BadRequest,
  Unauthorized,
  Conflict,
} from '../utils/apiResponse.js';

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });

// POST /api/sessions   ← RESTful: 创建一个会话（=登录）
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw BadRequest('用户名和密码不能为空', 'MISSING_CREDENTIALS');
    }

    const results = await queryAsync(
      'SELECT username FROM user WHERE username = ? AND password = ?',
      [username, password]
    );

    if (results.length === 0) {
      // 401 区分是「认证失败」(没有/凭证错) vs 403「无权限」(已认证但无权访问)
      throw Unauthorized('账号或密码错误', 'INVALID_CREDENTIALS');
    }

    const token = generateToken({ username: results[0].username });
    // 创建会话资源 → 201 Created
    created(res, { username: results[0].username, token });
  } catch (err) {
    next(err);
  }
};

// POST /api/users   ← RESTful: 创建用户资源（=注册）
export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      throw BadRequest('用户名和密码不能为空', 'MISSING_CREDENTIALS');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw BadRequest('用户名格式非法（仅允许字母数字下划线）', 'INVALID_USERNAME');
    }

    try {
      await queryAsync(
        'INSERT INTO user (username, password, logs_count, marked_count, medals_count) VALUES (?, ?, 0, 0, 0)',
        [username, password]
      );
    } catch (err) {
      // MySQL 唯一键冲突 → 409 Conflict
      if (err?.code === 'ER_DUP_ENTRY') {
        throw Conflict('用户名已被使用', 'USERNAME_TAKEN');
      }
      throw err;
    }

    try {
      await queryAsync(`
        CREATE TABLE \`${username}_log\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          location_name VARCHAR(100),
          location_display_name VARCHAR(100),
          longitude DOUBLE,
          latitude DOUBLE,
          image_path TEXT,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    } catch (err) {
      // 建表失败回滚用户记录，避免脏数据
      await queryAsync('DELETE FROM user WHERE username = ?', [username]).catch(() => {});
      throw err;
    }

    created(res, { username }, `/api/users/${username}`);
  } catch (err) {
    next(err);
  }
};
