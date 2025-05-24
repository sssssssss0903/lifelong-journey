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
const multiUpload = upload.array('images', 10); // 支持最多上传 10 张图

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadDir));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'lifelong_journey',
});

db.connect(err => {
  if (err) throw err;
  console.log(' MySQL connected');
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
  const createUserSQL = 'INSERT INTO user (username, password, logs_count, marked_count, medals_count) VALUES (?, ?, 0, 0, 0)';
  db.query(createUserSQL, [username, password], err => {
    if (err) return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });

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

    db.query(createLogTable, err => {
      if (err) {
        db.query('DELETE FROM user WHERE username = ?', [username]);
        return res.status(500).json({ success: false, message: '创建日志表失败' });
      }

      res.json({ success: true, message: '注册成功' });
    });
  });
});

// 获取统计数据
app.get('/api/user-stats', (req, res) => {
  const username = req.query.username;
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return res.status(400).json({ error: '非法用户名' });

  const sql = `SELECT logs_count, marked_count, medals_count FROM user WHERE username = ?`;
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });
    res.json(results[0]);
  });
});

// 上传日志
app.post('/api/upload-log', multiUpload, (req, res) => {
  const { username, location_name, location_display_name, content } = req.body;
  const lng = parseFloat(req.body.longitude);
  const lat = parseFloat(req.body.latitude);

  if (!username || !location_name || !location_display_name || !content) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    return res.status(400).json({ success: false, message: '经纬度不合法' });
  }

  const imagePaths = (req.files || []).map(file => `http://localhost:3001/uploads/${file.filename}`);
  const image_path = JSON.stringify(imagePaths); // 存为字符串数组

  const logTable = `${username}_log`;

  const insertSQL = `INSERT INTO \`${logTable}\` 
    (location_name, location_display_name, longitude, latitude, image_path, content)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(insertSQL, [location_name, location_display_name, lng, lat, image_path, content], err => {
    if (err) return res.status(500).json({ success: false, message: '插入日志失败' });
app.post('/api/upload-log', multiUpload, (req, res) => {
  try {
    const { username, location_name, location_display_name, content } = req.body;
    const lng = parseFloat(req.body.longitude);
    const lat = parseFloat(req.body.latitude);

    if (!username || !location_name || !location_display_name || !content) {
      return res.status(400).json({ success: false, message: '缺少参数' });
    }
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ success: false, message: '经纬度不合法' });
    }

    const imagePaths = (req.files || []).map(file => `http://localhost:3001/uploads/${file.filename}`);
    const image_path = JSON.stringify(imagePaths);

    const logTable = `${username}_log`;

    const insertSQL = `INSERT INTO \`${logTable}\`
      (location_name, location_display_name, longitude, latitude, image_path, content)
      VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(insertSQL, [location_name, location_display_name, lng, lat, image_path, content], err => {
      if (err) {
        console.error('数据库插入失败:', err);  // ← 日志
        return res.status(500).json({ success: false, message: '插入日志失败' });
      }

      const updateStatsSQL = `
        UPDATE user SET
          logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
          marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
        WHERE username = ?`;

      db.query(updateStatsSQL, [username], err => {
        if (err) {
          console.error('更新统计失败:', err);  // ← 日志
          return res.status(500).json({ success: false, message: '更新统计失败' });
        }

        res.json({ success: true, message: '日志上传成功' });
      });
    });
  } catch (err) {
    console.error('处理上传时异常:', err);  // ← 捕获未预期异常
    res.status(500).json({ success: false, message: '服务器异常' });
  }
});

    const updateStatsSQL = `
      UPDATE user SET 
        logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
        marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
      WHERE username = ?`;

    db.query(updateStatsSQL, [username], err => {
      if (err) return res.status(500).json({ success: false, message: '更新统计失败' });
      res.json({ success: true, message: '日志上传成功' });
    });
  });
});

//日志查询
app.get('/api/user-logs', (req, res) => {
  const { username, keyword = '', city = '', page = 1, limit = 10 } = req.query;

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '非法用户名' });
  }

  const logTable = `${username}_log`;

  // 动态条件构造
  let conditions = [];
  let params = [];

  if (keyword.trim()) {
    conditions.push(`(location_display_name LIKE ? OR content LIKE ?)`);
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (city.trim()) {
    conditions.push(`location_name = ?`);
    params.push(city);
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

  // 分页参数
  const offset = (parseInt(page) - 1) * parseInt(limit);

  // 总数查询
  const countSql = `SELECT COUNT(*) AS total FROM \`${logTable}\` ${whereClause}`;
  db.query(countSql, params, (err, countResult) => {
    if (err) return res.status(500).json({ error: '获取总数失败' });

    const total = countResult[0].total;

    // 数据查询
    const querySql = `
      SELECT id, location_name, location_display_name, longitude, latitude, image_path, content, created_at
      FROM \`${logTable}\`
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ?, ?
    `;

    db.query(querySql, [...params, offset, parseInt(limit)], (err, results) => {
      if (err) return res.status(500).json({ error: '查询失败' });
      res.json({ logs: results, total });
    });
  });
});


// 删除日志
app.post('/api/delete-log', (req, res) => {
  const { id, username } = req.body;
  if (!id || !username || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ message: '参数不合法' });
  }

  const logTable = `${username}_log`;
  const deleteSQL = `DELETE FROM \`${logTable}\` WHERE id = ?`;

  db.query(deleteSQL, [id], err => {
    if (err) return res.status(500).json({ message: '删除日志失败' });

    const updateStatsSQL = `
      UPDATE user SET 
        logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
        marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
      WHERE username = ?`;

    db.query(updateStatsSQL, [username], err => {
      if (err) return res.status(500).json({ message: '更新统计失败' });
      res.json({ success: true, message: '日志删除成功' });
    });
  });
});

// 启动服务
app.listen(3001, () => {
  console.log(' Server running on http://localhost:3001');
});
