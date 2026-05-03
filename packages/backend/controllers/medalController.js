import db from '../config/db.js';
import { ok, NotFound, assertUsername, assertOwnership } from '../utils/apiResponse.js';

const queryAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });

// PUT /api/users/:username/medals  → 200 OK
// 用 PUT 而非 POST：每次调用结果幂等（基于当前统计重算），适合 PUT 全量更新语义
export const updateMedals = async (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    const { username } = req.params;
    const rows = await queryAsync(
      'SELECT logs_count, marked_count FROM user WHERE username = ?',
      [username]
    );
    if (rows.length === 0) throw NotFound('用户不存在', 'USER_NOT_FOUND');

    const { logs_count, marked_count } = rows[0];
    const logMedals = [logs_count >= 1, logs_count >= 10, logs_count >= 50];
    const locationMedals = [marked_count >= 1, marked_count >= 5, marked_count >= 20];
    const totalEarned = [...logMedals, ...locationMedals].filter(Boolean).length;

    await queryAsync('UPDATE user SET medals_count = ? WHERE username = ?', [totalEarned, username]);

    ok(res, { medals_count: totalEarned });
  } catch (err) {
    next(err);
  }
};
