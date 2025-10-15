import db from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { config } from '../config/env.js';
import { fileURLToPath } from 'url';

// __dirname 替代方案 (ESM 模块)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录（server 上一级）
const projectRoot = path.resolve(__dirname, '..');
// 确保导出目录存在
if (!fs.existsSync(config.EXPORT_DIR)) {
  fs.mkdirSync(config.EXPORT_DIR, { recursive: true });
}

// 导出日志（CSV 或 PDF）
export const exportLogs = async (req, res, next) => {
  try {
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
        return res.status(500).json({ error: '查询日志失败或无数据' });
      }

      const now = Date.now();
      const filename = logId ? `log_${logId}.${type}` : `logs_export_${now}.${type}`;
      const filepath = path.join(config.EXPORT_DIR, filename);

     if (type === 'csv') {
  try {
    const fields = ['id', 'location_name', 'location_display_name', 'longitude', 'latitude', 'content', 'created_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(results);

    // ⚠️ 在 CSV 前加 BOM，避免 Excel 打开乱码
    const bom = '\uFEFF' + csv;
    fs.writeFileSync(filepath, bom, 'utf8');

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.download(filepath, filename, (err) => {
      if (!err) fs.unlink(filepath, () => {});
    });
  } catch (e) {
    return next(e);
  }
}


      if (type === 'pdf') {
  try {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // 字体路径
    const fontPath = path.join(projectRoot, 'public/fonts/noto.ttf');
    if (fs.existsSync(fontPath)) {
      console.log(`  使用字体文件: ${fontPath}`);
      doc.font(fontPath);
    } else {
      console.warn(`⚠️ 未找到字体文件: ${fontPath}，将使用默认字体，可能导致乱码`);
    }

    results.forEach((log, idx) => {

  doc.fontSize(12);
  doc.text(`地点: ${log.location_display_name || log.location_name}`);
  doc.text(`时间: ${new Date(log.created_at).toLocaleString()}`);
  doc.text(`内容:`);
  doc.text( `${log.content}`);
  doc.moveDown(1);

  //  处理图片
  try {
    if (log.image_path) {
      const images = JSON.parse(log.image_path);
      if (Array.isArray(images) && images.length > 0) {
        images.forEach((img, i) => {
          // 拼接服务器上图片的绝对路径
          const imgFullPath = path.join(projectRoot, 'uploads/files', img.replace(/^\/static\//, ''));
          if (fs.existsSync(imgFullPath)) {
            try {
              doc.image(imgFullPath, {
                fit: [450, 300],
                align: 'center',
                valign: 'center',
              });
              doc.moveDown(0.5);
            } catch (e) {
              console.warn(`⚠️ 图片绘制失败: ${imgFullPath}`, e.message);
            }
          } else {
            console.warn(`⚠️ 找不到图片文件: ${imgFullPath}`);
          }
        });
      }
    }
  } catch (e) {
    console.warn(`⚠️ 图片字段解析失败: ${e.message}`);
  }

  doc.moveDown(2);
});


    doc.end();

    stream.on('finish', () => {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.download(filepath, filename, (err) => {
        if (!err) fs.unlink(filepath, () => {});
      });
    });

    stream.on('error', (e) => next(e));
  } catch (e) {
    return next(e);
  }
}

    });
  } catch (err) {
    next(err);
  }
};

