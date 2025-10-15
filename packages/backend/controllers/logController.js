import db from '../config/db.js';
import { multiUpload } from '../config/multer.js';

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 上传日志
export const uploadLog = async (req, res, next) => {
  try {
    const { username } = req.params;
    const {
      location_name,
      location_display_name,
      content,
      longitude,
      latitude,
      images, //  新增字段（数组）
    } = req.body;

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    if (!username || !location_name || !location_display_name || !content) {
      return res.status(400).json({ success: false, message: '缺少参数' });
    }

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return res.status(400).json({ success: false, message: '经纬度不合法' });
    }

    //  支持两种方式：
    let imagePaths = [];

    // ① 如果是 multipart/form-data 旧逻辑
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.heic' || ext === '.heif') {
          throw new Error('❌ 不支持 HEIC/HEIF 格式，请改用 JPG/PNG 上传');
        }
        return `/uploads/${file.filename}`;
      });
    }

    // ② 如果是 JSON（分块上传）逻辑
    else if (images && Array.isArray(images)) {
      imagePaths = images; // ['/static/abc.png', '/static/def.png']
    }

    const image_path = JSON.stringify(imagePaths);
    const logTable = `${username}_log`;

    const insertSQL = `
      INSERT INTO \`${logTable}\`
      (location_name, location_display_name, longitude, latitude, image_path, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertSQL,
      [location_name, location_display_name, lng, lat, image_path, content],
      (err) => {
        if (err) return next(err);

        const updateStatsSQL = `
          UPDATE user SET
            logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
            marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
          WHERE username = ?
        `;

        db.query(updateStatsSQL, [username], (err) => {
          if (err) return next(err);
          res.json({ success: true, message: '日志上传成功' });
        });
      }
    );
  } catch (err) {
    next(err);
  }
};

// 查询用户日志
export const getUserLogs = async (req, res, next) => {
  try {
    const { username } = req.params;   //   从 params 取
    const { keyword = '', city = '', page = 1, limit = 10 } = req.query;
   if (req.user.username !== req.params.username) {
      return res.status(403).json({ success: false, message: '禁止访问他人数据' });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: '非法用户名' });
    }

    const logTable = `${username}_log`;
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

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countSql = `SELECT COUNT(*) AS total FROM \`${logTable}\` ${whereClause}`;
    db.query(countSql, params, (err, countResult) => {
      if (err) return next(err);

      const total = countResult[0].total;
      const querySql = `
        SELECT id, location_name, location_display_name, longitude, latitude, image_path, content, created_at
        FROM \`${logTable}\`
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ?, ?
      `;

      db.query(querySql, [...params, offset, parseInt(limit)], (err, results) => {
        if (err) return next(err);
        res.json({ logs: results, total });
      });
    });
  } catch (err) {
    next(err);
  }
};

// 删除日志
export const deleteLog = async (req, res, next) => {
  try {
    const { username, id } = req.params; //   改成 params

    if (!id || !username || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: '参数不合法' });
    }

    const logTable = `${username}_log`;
    const deleteSQL = `DELETE FROM \`${logTable}\` WHERE id = ?`;

    db.query(deleteSQL, [id], err => {
      if (err) return next(err);

      const updateStatsSQL = `
        UPDATE user SET 
          logs_count = (SELECT COUNT(*) FROM \`${logTable}\`),
          marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
        WHERE username = ?
      `;

      db.query(updateStatsSQL, [username], err => {
        if (err) return next(err);
        res.json({ success: true, message: '日志删除成功' });
      });
    });
  } catch (err) {
    next(err);
  }
};

// 获取标记地点
export const getMarkedLocations = async (req, res, next) => {
  try {
    const { username } = req.params;  //   从 params 取
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: '非法用户名' });
    }

    const logTable = `${username}_log`;
    const sql = `SELECT DISTINCT location_name, location_display_name FROM \`${logTable}\` ORDER BY location_name`;

    db.query(sql, (err, results) => {
      if (err) return next(err);
      res.json({ locations: results });
    });
  } catch (err) {
    next(err);
  }
};
