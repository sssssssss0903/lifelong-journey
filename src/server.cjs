const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

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
  const query = 'INSERT INTO user (username, password) VALUES (?, ?)';
  db.query(query, [username, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: '注册失败，用户名可能已存在' });
    }
    res.status(200).json({ message: '注册成功' });
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
