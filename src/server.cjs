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
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  multipleStatements: true
});

const initSqlPath = path.join(__dirname, 'init.sql');
if (fs.existsSync(initSqlPath)) {
  const initSql = fs.readFileSync(initSqlPath, 'utf8');
  db.query(initSql, err => {
    if (err) {
      console.error('数据库初始化失败:', err);
    } else {
      console.log('数据库初始化完成');
    }
  });
}


// 计算勋章详情和勋章数，更新数据库，并通过回调返回结果
function updateUserMedalsDetails(username, callback) {
    const sqlGet = `SELECT logs_count, marked_count FROM user WHERE username = ?`;
    db.query(sqlGet, [username], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(new Error('用户不存在'));

        const { logs_count, marked_count } = results[0];

        const logMedals = [
            {
                name: '初学者',
                earned: logs_count >= 1,
                image_url: logs_count >= 1 ? '/assets/medal_bronze.png' : '/assets/medal_bronze_gray.png',
                description: '上传 1 条日志即可获得此勋章'
            },
            {
                name: '熟练旅者',
                earned: logs_count >= 10,
                image_url: logs_count >= 10 ? '/assets/medal_silver.png' : '/assets/medal_silver_gray.png',
                description: '上传 10 条日志即可获得此勋章'
            },
            {
                name: '足迹大师',
                earned: logs_count >= 50,
                image_url: logs_count >= 50 ? '/assets/medal_gold.png' : '/assets/medal_gold_gray.png',
                description: '上传 50 条日志即可获得此勋章'
            }
        ];

        const locationMedals = [
            {
                name: '探索者',
                earned: marked_count >= 1,
                image_url: marked_count >= 1 ? '/assets/location_bronze.png' : '/assets/location_bronze_gray.png',
                description: '标记 1 个地点即可获得此勋章'
            },
            {
                name: '探险家',
                earned: marked_count >= 5,
                image_url: marked_count >= 5 ? '/assets/location_silver.png' : '/assets/location_silver_gray.png',
                description: '标记 5 个地点即可获得此勋章'
            },
            {
                name: '地图征服者',
                earned: marked_count >= 20,
                image_url: marked_count >= 20 ? '/assets/location_gold.png' : '/assets/location_gold_gray.png',
                description: '标记 20 个地点即可获得此勋章'
            }
        ];

        const allMedals = [...logMedals, ...locationMedals];
        const medalsCount = allMedals.filter(m => m.earned).length;

        // 更新数据库的 medals_count 字段
        const sqlUpdate = `UPDATE user SET medals_count = ? WHERE username = ?`;
        db.query(sqlUpdate, [medalsCount, username], (updateErr) => {
            if (updateErr) return callback(updateErr);
            // 返回勋章数和勋章详情
            callback(null, { medalsCount, medalsDetails: allMedals });
        });
    });
}


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

// 上传日志接口，调用勋章更新函数
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
        const image_path = JSON.stringify(imagePaths);

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

                // 统计更新成功后，更新勋章数量并返回
                updateUserMedalsDetails(username, (err, result) => {
                    if (err) {
                        console.error('更新勋章失败:', err);
                        return res.status(500).json({ success: false, message: '更新勋章失败' });
                    }

                    res.json({
                        success: true,
                        message: '日志上传成功',
                        medals_count: result.medalsCount,
                        medals_details: result.medalsDetails,
                    });
                });
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

            // 调用勋章更新逻辑
            updateUserMedalsDetails(username, (err, result) => {
                if (err) {
                    console.error('更新勋章失败:', err);
                    return res.status(500).json({ success: false, message: '更新勋章失败' });
                }

                res.json({
                    success: true,
                    message: '日志删除成功',
                    medals_count: result.medalsCount,
                    medals_details: result.medalsDetails,
                });
            });
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
      doc.font(fontPath); // ✅ 每页都重新设置字体！！
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



// 启动服务
app.listen(3001, () => {
  console.log(' Server running on http://localhost:3001');
});
