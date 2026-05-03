import db from '../config/db.js';
import { ok, NotFound, assertUsername, assertOwnership } from '../utils/apiResponse.js';

// GET /api/users/:username/stats  → 200 OK
export const getUserStats = (req, res, next) => {
  try {
    assertOwnership(req);
    assertUsername(req.params.username);

    db.query(
      'SELECT logs_count, marked_count, medals_count FROM user WHERE username = ?',
      [req.params.username],
      (err, results) => {
        if (err) return next(err);
        if (results.length === 0) return next(NotFound('用户不存在', 'USER_NOT_FOUND'));
        ok(res, results[0]);
      }
    );
  } catch (err) {
    next(err);
  }
};
