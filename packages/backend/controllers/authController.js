
import db from '../config/db.js';
import { generateToken } from '../utils/jwt.js';

// 登录
export const login = (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '服务器错误' });

    if (results.length > 0) {
      const user = results[0];
      const token = generateToken({ username: user.username });

      res.json({
        success: true,
        message: '登录成功',
        username: user.username,
        token,
      });
    } else {
      res.json({ success: false, message: '账号或密码错误' });
    }
  });
};

// 注册
export const register = (req, res) => {
  const { username, password } = req.body;
  const createUserSQL =
    'INSERT INTO user (username, password, logs_count, marked_count, medals_count) VALUES (?, ?, 0, 0, 0)';

  db.query(createUserSQL, [username, password], (err) => {
    if (err) {
      console.error('注册失败:', err);
      return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });
    }

    const createLogTable = `
      CREATE TABLE \`${username}_log\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        location_name VARCHAR(100),
        location_display_name VARCHAR(100),
        longitude DOUBLE,
        latitude DOUBLE,
        image_path TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;

    db.query(createLogTable, (err) => {
      if (err) {
        db.query('DELETE FROM user WHERE username = ?', [username]);
        return res.status(500).json({ success: false, message: '创建日志表失败' });
      }

      res.json({ success: true, message: '注册成功' });
    });
  });
};
