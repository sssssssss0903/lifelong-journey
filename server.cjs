
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const { error } = require('console');
// 判断是否打包（是否在 win-unpacked ）
const isPackaged =process.execPath.includes('win-unpacked');

// 设置 dotenv 路径：打包后从 .exe 所在目录读取，否则用开发目录
const dotenvPath = isPackaged
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(__dirname, '.env');

require('dotenv').config({ path: dotenvPath });

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });
const multiUpload = upload.array('images', 10); // 支持最多上传 10 张图

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(uploadDir));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

const initSql = `
CREATE DATABASE IF NOT EXISTS lifelong_journey;

USE lifelong_journey;

CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  marked_count INT DEFAULT 0,
  logs_count INT DEFAULT 0,
  medals_count INT DEFAULT 0
);
`;

db.query(initSql, err => {
  if (err) {
    console.error('数据库初始化失败:', err);
  } else {
    console.log('数据库初始化完成');
  }
});

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM user WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(' 登录查询失败:', err);
      return res.status(500).json({ success: false, message: '服务器错误' });}
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
    if (err) {
      console.error('注册失败:', err);
      return res.status(500).json({ success: false, message: '注册失败，用户名可能已存在' });}

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
  try {
    const { username, location_name, location_display_name, content } = req.body;
    const lng = parseFloat(req.body.longitude);
    const lat = parseFloat(req.body.latitude);

    console.log('接收到日志上传请求:', {
      username, location_name, location_display_name, lng, lat,
      imageCount: req.files?.length,
    });

    if (!username || !location_name || !location_display_name || !content) {
      return res.status(400).json({ success: false, message: '缺少参数' });
    }
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ success: false, message: '经纬度不合法' });
    }

    const imagePaths = (req.files || []).map(file => `http://localhost:3001/uploads/${file.filename}`);
    const image_path = JSON.stringify(imagePaths); // 多张图存为 JSON 字符串

    const logTable = `${username}_log`;

    const insertSQL = `INSERT INTO \`${logTable}\`
      (location_name, location_display_name, longitude, latitude, image_path, content)
      VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(insertSQL, [location_name, location_display_name, lng, lat, image_path, content], err => {
      if (err) {
        console.error('数据库插入失败:', err);
        return res.status(500).json({ success: false, message: '插入日志失败' });
      }

      const updateStatsSQL = `
        UPDATE user SET
          logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
          marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
        WHERE username = ?`;

      db.query(updateStatsSQL, [username], err => {
        if (err) {
          console.error('更新统计失败:', err);
          return res.status(500).json({ success: false, message: '更新统计失败' });
        }

        res.json({ success: true, message: '日志上传成功' });
      });
    });
  } catch (err) {
    console.error('上传处理异常:', err);
    res.status(500).json({ success: false, message: '服务器异常' });
  }
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
    conditions.push(`(location_name LIKE ?)`);
    params.push(`%${city}%`);
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

//获取用户所有标记地点
app.get('/api/marked-locations',(req,res) => {
  const {username } =req.query;
  if(!/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({error: '非法用户名'});
  }

  const logTable = `${username}_log`;
  const sql = `SELECT DISTINCT location_name, location_display_name 
    FROM \`${logTable}\`
    ORDER BY location_name
    `;

  db.query(sql,(err,results) =>{
    if(err) return res.status(500).json({error: '查询失败'});
    res.json({ locations: results });
  });
});

const exportDir = path.join(__dirname, 'exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir);
}

app.get('/api/export', (req, res) => {
  const { username, type = 'csv', logId } = req.query;

  if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: '非法用户名' });
  }

  const logTable = `${username}_log`;
  const baseSql = `SELECT id, location_name, location_display_name, longitude, latitude, content, image_path, created_at FROM \`${logTable}\``;
  const sql = logId ? `${baseSql} WHERE id = ?` : baseSql;
  const params = logId ? [logId] : [];

  db.query(sql, params, (err, results) => {
    if (err || !results.length) {
      console.error('导出查询失败:', err);
      return res.status(500).json({ error: '查询日志失败或无数据' });
    }

    const now = Date.now();
    const filename = logId
      ? `log_${logId}_${type}.${type === 'csv' ? 'csv' : 'pdf'}`
      : `logs_export_${now}.${type === 'csv' ? 'csv' : 'pdf'}`;
    const filepath = path.join(exportDir, filename);

    if (type === 'csv') {
      const fields = ['id', 'location_name', 'location_display_name', 'longitude', 'latitude', 'content', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(results);
      fs.writeFileSync(filepath, csv);
      res.setHeader('Cache-Control', 'no-store');
      return res.download(filepath, filename);
    }

if (type === 'pdf') {
  const doc = new PDFDocument({ margin: 50 });

  const fontPath = path.join(__dirname, 'fonts', 'noto.ttf');
  if (!fs.existsSync(fontPath)) {
    console.error('字体文件不存在:', fontPath);
    return res.status(500).json({ error: '找不到字体文件，请检查路径' });
  }

  doc.font(fontPath);
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  results.forEach((log, idx) => {
    doc.fontSize(16).text(`日志 `, { underline: true });
    doc.fontSize(12);
    doc.text(`地点: ${log.location_display_name || log.location_name}`);
    doc.text(`时间: ${new Date(log.created_at).toLocaleString()}`);
    doc.text(`内容: ${log.content}`);

    try {
      const imagePaths = JSON.parse(log.image_path || '[]');
imagePaths.forEach((url, i) => {
  const filename = path.basename(url);
  const localPath = path.join(__dirname, 'uploads', filename);

  if (fs.existsSync(localPath)) {
    try {
      doc.addPage();
      doc.font(fontPath); 
      doc.image(localPath, {
        fit: [450, 300],
        align: 'center',
        valign: 'center',
      });
    } catch (imgErr) {
      doc.font(fontPath); // 确保 fallback 能正常写字
      doc.text(`⚠️ 第 ${i + 1} 张图片插入失败: ${imgErr.message}`);
    }
  } else {
    doc.text(`⚠️ 找不到图片文件: ${filename}`);
  }
});
    } catch (err) {
      doc.text('⚠️ 图片路径解析失败');
    }

    doc.moveDown(2);
  });

  doc.end();
  stream.on('finish', () => {
    res.setHeader('Cache-Control', 'no-store');
    return res.download(filepath, filename);
  });
}
  });
});

// 根据 marked_count 返回用户全部应获得的荣誉称号
app.get('/api/user-medals', (req, res) => {
  const { username } = req.query;
  if (!username || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return res.status(400).json({ success: false, message: '非法用户名' });
  }

  const queryUser = 'SELECT marked_count, medals_count FROM user WHERE username = ?';
  db.query(queryUser, [username], (err, results) => {
    if (err) {
      console.error('查询用户数据失败:', err);
      return res.status(500).json({ success: false, message: '数据库错误' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    const { marked_count, medals_count } = results[0];

    // 荣誉规则（按门槛从低到高排列，支持拓展）
    const honorRules = [
      { count: 1, title: '第一步' },
      { count: 3, title: '旅途起步' },
      { count: 5, title: '城市漫游者' },
      { count: 8, title: '探索先锋' },
      { count: 12, title: '风景收藏家' },
      { count: 18, title: '山河见证者' },
      { count: 25, title: '足迹达人' },
      { count: 35, title: '世界行者' },
    ];

    // 解锁的所有荣誉
    const unlockedMedals = honorRules
      .filter(rule => marked_count >= rule.count)
      .map(rule => rule.title);

    // 如果解锁了新荣誉（数量超过原本 medals_count），更新 user.medals_count
    if (unlockedMedals.length > medals_count) {
      const updateSql = 'UPDATE user SET medals_count = ? WHERE username = ?';
      db.query(updateSql, [unlockedMedals.length, username], updateErr => {
        if (updateErr) {
          console.error('更新用户medals_count失败:', updateErr);
          return res.status(500).json({ success: false, message: '更新失败' });
        }
        return res.json({ success: true, medals: unlockedMedals, medals_count: unlockedMedals.length });
      });
    } else {
      // 无新增，仅返回当前荣誉
      return res.json({ success: true, medals: unlockedMedals, medals_count: unlockedMedals.length });
    }
  });
});


// 启动服务
app.listen(3001, () => {
  console.log(' Server running on http://localhost:3001');
});
