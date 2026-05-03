import db from '../config/db.js';
import path from 'path';
import {
  ok,
  created,
  noContent,
  BadRequest,
  NotFound,
  Unprocessable,
  assertUsername,
  assertOwnership,
} from '../utils/apiResponse.js';

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });

// POST /api/users/:username/logs  → 201 Created
export const uploadLog = async (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    const { username } = req.params;
    const {
      location_name,
      location_display_name,
      content,
      longitude,
      latitude,
      images,
    } = req.body;

    if (!location_name || !location_display_name || !content) {
      throw BadRequest('缺少必填字段', 'MISSING_FIELDS', {
        required: ['location_name', 'location_display_name', 'content'],
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw Unprocessable('经纬度不合法', 'INVALID_COORDINATES');
    }

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === '.heic' || ext === '.heif') {
          throw Unprocessable('不支持 HEIC/HEIF 格式，请改用 JPG/PNG', 'UNSUPPORTED_IMAGE_FORMAT');
        }
        return `/uploads/${file.filename}`;
      });
    } else if (Array.isArray(images)) {
      imagePaths = images;
    }

    const logTable = `${username}_log`;
    const result = await queryAsync(
      `INSERT INTO \`${logTable}\` (location_name, location_display_name, longitude, latitude, image_path, content) VALUES (?, ?, ?, ?, ?, ?)`,
      [location_name, location_display_name, lng, lat, JSON.stringify(imagePaths), content]
    );

    await queryAsync(
      `UPDATE user SET
         logs_count   = (SELECT COUNT(*) FROM \`${logTable}\`),
         marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
       WHERE username = ?`,
      [username]
    );

    const newId = result.insertId;
    created(res, { id: newId, location_name, location_display_name, longitude: lng, latitude: lat, content, images: imagePaths },
      `/api/users/${username}/logs/${newId}`);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:username/logs?keyword=&city=&page=&limit=  → 200 OK
export const getUserLogs = async (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    const { username } = req.params;
    const { keyword = '', city = '', page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const offset = (pageNum - 1) * limitNum;

    // 防 LIKE 通配符注入：转义用户输入里的 % _ \
    const escapeLike = (s) => s.replace(/[\\%_]/g, '\\$&');

    const conditions = [];
    const params = [];
    if (keyword.trim()) {
      const kw = `%${escapeLike(keyword.trim())}%`;
      conditions.push('(location_display_name LIKE ? OR content LIKE ?)');
      params.push(kw, kw);
    }
    if (city.trim()) {
      conditions.push('location_name LIKE ?');
      params.push(`%${escapeLike(city.trim())}%`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const logTable = `${username}_log`;

    const countResult = await queryAsync(
      `SELECT COUNT(*) AS total FROM \`${logTable}\` ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const logs = await queryAsync(
      `SELECT id, location_name, location_display_name, longitude, latitude, image_path, content, created_at
       FROM \`${logTable}\`
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ?, ?`,
      [...params, offset, limitNum]
    );

    ok(res, {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:username/logs/:id  → 204 No Content
export const deleteLog = async (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    const { username, id } = req.params;
    const logTable = `${username}_log`;

    const result = await queryAsync(`DELETE FROM \`${logTable}\` WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      // 资源不存在 → 404；DELETE 本身幂等，但用 404 让前端能区分"已删除"和"从未存在"
      throw NotFound('日志不存在', 'LOG_NOT_FOUND');
    }

    await queryAsync(
      `UPDATE user SET
         logs_count   = (SELECT COUNT(*) FROM \`${logTable}\`),
         marked_count = (SELECT COUNT(DISTINCT location_name) FROM \`${logTable}\`)
       WHERE username = ?`,
      [username]
    );

    noContent(res);
  } catch (err) {
    next(err);
  }
};

// GET /api/users/:username/locations  → 200 OK
export const getMarkedLocations = async (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    const logTable = `${req.params.username}_log`;
    const locations = await queryAsync(
      `SELECT DISTINCT location_name, location_display_name FROM \`${logTable}\` ORDER BY location_name`
    );
    ok(res, { locations });
  } catch (err) {
    next(err);
  }
};
