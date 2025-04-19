require('dotenv').config();
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

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected!');
});
// 登录接口
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
  
    const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
    db.query(sql, [username, password], (err, results) => {
      if (err) {
        console.error('数据库查询失败：', err);
        return res.status(500).json({ success: false, message: '服务器错误' });
      }
  
      if (results.length > 0) {
        res.json({ success: true, message: '登录成功' , username: results[0].username });
      } else {
        res.json({ success: false, message: '账号或密码错误' });
      }
    });
  });
  
// 注册接口
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  const createUser = 'INSERT INTO user (username, password) VALUES (?, ?)';
  db.query(createUser, [username, password], (err, result) => {
    if (err) {
      console.error(' 注册失败，可能用户名重复：', err);
      return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });
    }

    const createStatsTable = `CREATE TABLE \`${username}_stats\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      marked_count INT DEFAULT 0,
      logs_count INT DEFAULT 0,
      medals_count INT DEFAULT 0
    )`;

    const createLogTable = `CREATE TABLE \`${username}_log\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      location_name VARCHAR(100),
      image_path VARCHAR(255),
      content TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    db.query(createStatsTable, err => {
      if (err) {
        console.error('创建统计表失败：', err);
        // 回滚用户表插入
        db.query('DELETE FROM user WHERE username = ?', [username], () => {
          return res.status(500).json({ success: false, message: '创建统计表失败，注册已回滚' });
        });
        return;
      }

      db.query(createLogTable, err => {
        if (err) {
          console.error(' 创建日志表失败：', err);
          db.query(`DROP TABLE \`${username}_stats\``, () => {
            db.query('DELETE FROM user WHERE username = ?', [username], () => {
              return res.status(500).json({ success: false, message: '创建日志表失败，注册已回滚' });
            });
          });
          return;
        }

        const initStats = `INSERT INTO \`${username}_stats\` (marked_count, logs_count, medals_count) VALUES (0, 0, 0)`;
        db.query(initStats, err => {
          if (err) {
            console.error(' 插入初始统计数据失败：', err);
            db.query(`DROP TABLE \`${username}_log\``, () => {
              db.query(`DROP TABLE \`${username}_stats\``, () => {
                db.query('DELETE FROM user WHERE username = ?', [username], () => {
                  return res.status(500).json({ success: false, message: '初始化数据失败，注册已回滚' });
                });
              });
            });
            return;
          }

          console.log(' 用户注册成功：', username);
          return res.json({ success: true, message: '注册成功' });
        });
      });
    });
  });
});



app.get('/api/user-stats', (req, res) => {
  const username = req.query.username;

  // 简单校验避免 SQL 注入
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '非法用户名' });
  }

  const tableName = `${username}_stats`;
  const sql = `SELECT marked_count, logs_count, medals_count FROM \`${tableName}\``;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: '查询失败' });
    if (results.length === 0) return res.status(404).json({ error: '未找到数据' });

    res.json(results[0]);
  });
});

app.post('/api/upload-log', upload.single('image'), (req, res) => {
  console.log('✅ 收到上传请求');
  console.log('📦 请求体内容：', req.body);
  console.log('🖼 图片文件：', req.file);
  const { username, location_name, content } = req.body;

  if (!username || !location_name || !content) {
    return res.status(400).json({ success: false, message: '缺少参数' });
  }

  const image_path = req.file ? `/uploads/${req.file.filename}` : null;
  const logTable = `${username}_log`;
  const statsTable = `${username}_stats`;

  // 检查是否为新地点
  const checkLocationSQL = `SELECT COUNT(*) as count FROM \`${logTable}\` WHERE location_name = ?`;

  db.query(checkLocationSQL, [location_name], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: '查询地点失败' });

    const isNewLocation = results[0].count === 0;

    // 插入日志
    const insertSQL = `INSERT INTO \`${logTable}\` (location_name, image_path, content) VALUES (?, ?, ?)`;
    db.query(insertSQL, [location_name, image_path, content], (err) => {
      if (err) return res.status(500).json({ success: false, message: '插入日志失败' });

      // 构建更新语句
      const updateStatsSQL = `UPDATE \`${statsTable}\` SET logs_count = logs_count + 1${isNewLocation ? ', marked_count = marked_count + 1' : ''}`;

      db.query(updateStatsSQL, (err) => {
        if (err) return res.status(500).json({ success: false, message: '更新统计数据失败' });

        res.json({ success: true, message: '日志上传成功' });
      });
    });
  });
});


app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
