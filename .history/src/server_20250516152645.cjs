const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lifelong_journey',
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '服务器错误' });
    if (results.length > 0) {
      res.json({ success: true, message: '登录成功', username: results[0].username });
    } else {
      res.json({ success: false, message: '账号或密码错误' });
    }
  });
});

// 注册
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const createUser = 'INSERT INTO user (username, password, marked_count, logs_count, medals_count) VALUES (?, ?, 0, 0, 0)';
  db.query(createUser, [username, password], (err) => {
    if (err) return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });

    const createLogTable = `CREATE TABLE \`${username}_log\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      location_name VARCHAR(100),
      location_display_name VARCHAR(100),
      longitude DOUBLE,
      latitude DOUBLE,
      image_path TEXT,
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(createLogTable, err => {
      if (err) {
        db.query('DELETE FROM user WHERE username = ?', [username]);
        return res.status(500).json({ success: false, message: '创建日志表失败' });
      }

      return res.json({ success: true, message: '注册成功' });
    });
  });
});

// 获取用户统计
app.get('/api/user-stats', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '非法用户名' });

  const sql = `SELECT marked_count, logs_count, medals_count FROM user WHERE username = ?`;
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });
    res.json(results[0]);
  });
});

// 上传日志
app.post('/api/upload-log', upload.single('image'), (req, res) => {
  const { username, location_name, location_display_name, content } = req.body;
  const lng = parseFloat(req.body.longitude);
  const lat = parseFloat(req.body.latitude);

  if (!username || !location_name || !location_display_name || !content) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return res.status(400).json({ success: false, message: '经纬度不合法' });
  }

  const image_path = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null;
  const logTable = `${username}_log`;

  const insertSQL = `INSERT INTO \`${logTable}\` 
    (location_name, location_display_name, longitude, latitude, image_path, content)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(insertSQL, [location_name, location_display_name, lng, lat, image_path, content], (err) => {
    if (err) return res.status(500).json({ success: false, message: '插入日志失败' });

    const updateLogsSQL = `UPDATE user SET logs_count = logs_count + 1 WHERE username = ?`;
    db.query(updateLogsSQL, [username], err => {
      if (err) return res.status(500).json({ success: false, message: '更新日志数失败' });

      const refreshMarked = `UPDATE user SET marked_count = (
        SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`
      ) WHERE username = ?`;
      db.query(refreshMarked, [username], err => {
        if (err) return res.status(500).json({ success: false, message: '更新 marked_count 失败' });
        res.json({ success: true, message: '日志上传成功' });
      });
    });
  });
});


// 查询日志（完整日志信息展示用）
app.get('/api/user-logs', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '非法用户名' });

  const logTable = `${username}_log`;
  const sql = `SELECT id, location_name, location_display_name, longitude, latitude, image_path, content, created_at 
               FROM \`${logTable}\` ORDER BY created_at DESC`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    res.json(results);
  });
});

// 删除日志
app.post('/api/delete-log', (req, res) => {
  const { id, username } = req.body;
  if (!id || !username || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ message: '参数不合法' });
  }

  const logTable = `${username}_log`;

  const getLocationSQL = `SELECT location_name FROM \`${logTable}\` WHERE id = ?`;
  db.query(getLocationSQL, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: '获取日志地点失败' });
    }

    const deleteSQL = `DELETE FROM \`${logTable}\` WHERE id = ?`;
    db.query(deleteSQL, [id], (err) => {
      if (err) return res.status(500).json({ message: '删除日志失败' });

      const updateLogsSQL = `UPDATE user SET logs_count = logs_count - 1 WHERE username = ? AND logs_count > 0`;
      db.query(updateLogsSQL, [username], err => {
        if (err) return res.status(500).json({ message: '更新日志数失败' });

        const countDistinctSQL = `SELECT COUNT(DISTINCT location_name) as marked FROM \`${logTable}\``;
        db.query(countDistinctSQL, (err, countResult) => {
          if (err) return res.status(500).json({ message: '统计地点失败' });

          const markedCount = countResult[0].marked;
          const updateMarkedSQL = `UPDATE user SET marked_count = ? WHERE username = ?`;
          db.query(updateMarkedSQL, [markedCount, username], (err) => {
            if (err) return res.status(500).json({ message: '更新 marked_count 失败' });
            res.json({ success: true, message: '日志删除成功' });
          });
        });
      });
    });
  });
});

// 启动服务
app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
