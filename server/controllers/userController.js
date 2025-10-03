// controllers/userController.js
import db from '../config/db.js';

// GET /api/users/:username/stats
export const getUserStats = (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '非法用户名' });
  }

  const sql = `SELECT logs_count, marked_count, medals_count FROM user WHERE username = ?`;
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });
    res.json(results[0]);
  });
};
