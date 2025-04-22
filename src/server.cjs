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
  user: '',
  password: '',
  database: '',
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
  const createUser = 'INSERT INTO user (username, password) VALUES (?, ?)';
  db.query(createUser, [username, password], (err) => {
    if (err) return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });

    const createStatsTable = `CREATE TABLE \`${username}_stats\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      marked_count INT DEFAULT 0,
      logs_count INT DEFAULT 0,
      medals_count INT DEFAULT 0
    )`;

    const createLogTable = `CREATE TABLE \`${username}_log\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      location_name VARCHAR(100),               -- 地图打点 ID，如 pHB
      location_display_name VARCHAR(100),       -- 显示中文，如 武汉
      image_path VARCHAR(255),
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(createStatsTable, err => {
      if (err) {
        db.query('DELETE FROM user WHERE username = ?', [username]);
        return res.status(500).json({ success: false, message: '创建统计表失败' });
      }

      db.query(createLogTable, err => {
        if (err) {
          db.query(`DROP TABLE \`${username}_stats\``);
          db.query('DELETE FROM user WHERE username = ?', [username]);
          return res.status(500).json({ success: false, message: '创建日志表失败' });
        }

        const initStats = `INSERT INTO \`${username}_stats\` (marked_count, logs_count, medals_count) VALUES (0, 0, 0)`;
        db.query(initStats, err => {
          if (err) {
            db.query(`DROP TABLE \`${username}_log\``);
            db.query(`DROP TABLE \`${username}_stats\``);
            db.query('DELETE FROM user WHERE username = ?', [username]);
            return res.status(500).json({ success: false, message: '初始化数据失败' });
          }
          return res.json({ success: true, message: '注册成功' });
        });
      });
    });
  });
});

// 获取用户统计
app.get('/api/user-stats', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '非法用户名' });

  const tableName = `${username}_stats`;
  const sql = `SELECT marked_count, logs_count, medals_count FROM \`${tableName}\``;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });
    res.json(results[0]);
  });
});

// 上传日志
app.post('/api/upload-log', upload.single('image'), (req, res) => {
  const { username, location_name, location_display_name, content } = req.body;
  if (!username || !location_name || !location_display_name || !content) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }

  const image_path = req.file ? `http://localhost:3001/uploads/${req.file.filename}` : null;
  const logTable = `${username}_log`;
  const statsTable = `${username}_stats`;

  const checkLocationSQL = `SELECT COUNT(*) as count FROM \`${logTable}\` WHERE location_name = ?`;
  db.query(checkLocationSQL, [location_name], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '查询地点失败' });

    const insertSQL = `INSERT INTO \`${logTable}\` 
      (location_name, location_display_name, image_path, content) VALUES (?, ?, ?, ?)`;

    db.query(insertSQL, [location_name, location_display_name, image_path, content], (err) => {
      if (err) return res.status(500).json({ success: false, message: '插入日志失败' });

      const updateLogsSQL = `UPDATE \`${statsTable}\` SET logs_count = logs_count + 1`;
      db.query(updateLogsSQL, err => {
        if (err) return res.status(500).json({ success: false, message: '更新日志数失败' });

        const refreshMarked = `UPDATE \`${statsTable}\` SET marked_count = (
          SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`
        )`;
        db.query(refreshMarked, err => {
          if (err) return res.status(500).json({ success: false, message: '更新 marked_count 失败' });
          res.json({ success: true, message: '日志上传成功' });
        });
      });
    });
  });
});

// 查询日志（完整日志信息展示用）
app.get('/api/user-logs', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '非法用户名' });

  const logTable = `${username}_log`;
  const sql = `SELECT id, location_name, location_display_name, image_path, content, created_at 
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
  const statsTable = `${username}_stats`;

  const getLocationSQL = `SELECT location_name FROM \`${logTable}\` WHERE id = ?`;
  db.query(getLocationSQL, [id], (err, result) => {
    if (err || result.length === 0) {
      return res.status(500).json({ message: '获取日志地点失败' });
    }

    const deleteSQL = `DELETE FROM \`${logTable}\` WHERE id = ?`;
    db.query(deleteSQL, [id], (err) => {
      if (err) return res.status(500).json({ message: '删除日志失败' });

      const updateLogsSQL = `UPDATE \`${statsTable}\` SET logs_count = logs_count - 1 WHERE logs_count > 0`;
      db.query(updateLogsSQL, err => {
        if (err) return res.status(500).json({ message: '更新日志数失败' });

        const countDistinctSQL = `SELECT COUNT(DISTINCT location_name) as marked FROM \`${logTable}\``;
        db.query(countDistinctSQL, (err, countResult) => {
          if (err) return res.status(500).json({ message: '统计地点失败' });

          const markedCount = countResult[0].marked;
          const updateMarkedSQL = `UPDATE \`${statsTable}\` SET marked_count = ?`;
          db.query(updateMarkedSQL, [markedCount], (err) => {
            if (err) return res.status(500).json({ message: '更新 marked_count 失败' });
            res.json({ success: true, message: '日志删除成功' });
          });
        });
      });
    });
  });
});

// 提供地图打点用的位置 ID 列表（简化接口）
app.get('/api/user-log', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '非法用户名' });
  }

  const logTable = `${username}_log`;
  const sql = `SELECT location_name FROM \`${logTable}\``;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });

    const markedLocations = [...new Set(results.map(item => item.location_name))];
    res.json({ marked_locations: markedLocations });
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
