import db from '../config/db.js';

// 获取用户荣誉称号
export const getUserMedals = (req, res, next) => {
  const { username } = req.params;

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

    // 荣誉规则
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

    // 解锁的荣誉
    const unlockedMedals = honorRules
      .filter(rule => marked_count >= rule.count)
      .map(rule => rule.title);

    // 如果新解锁了更多荣誉，更新数据库
    if (unlockedMedals.length > medals_count) {
      const updateSql = 'UPDATE user SET medals_count = ? WHERE username = ?';
      db.query(updateSql, [unlockedMedals.length, username], updateErr => {
        if (updateErr) {
          console.error('更新用户 medals_count 失败:', updateErr);
          return res.status(500).json({ success: false, message: '更新失败' });
        }
        return res.json({ success: true, medals: unlockedMedals, medals_count: unlockedMedals.length });
      });
    } else {
      return res.json({ success: true, medals: unlockedMedals, medals_count: unlockedMedals.length });
    }
  });
};
