import db from '../config/db.js';

export const updateMedals = async (req, res) => {
  const { username } = req.params;

  try {
    // 查询当前用户的日志数、标记地点数
    const [user] = await new Promise((resolve, reject) => {
      db.query(
        'SELECT logs_count, marked_count FROM user WHERE username=?',
        [username],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    if (!user) return res.status(404).json({ message: '用户不存在' });

    const { logs_count, marked_count } = user;

    // 根据数量判断勋章条件
    const logMedals = [logs_count >= 1, logs_count >= 10, logs_count >= 50];
    const locationMedals = [marked_count >= 1, marked_count >= 5, marked_count >= 20];
    const totalEarned = [...logMedals, ...locationMedals].filter(Boolean).length;

    // 更新数据库
    await new Promise((resolve, reject) => {
      db.query(
        'UPDATE user SET medals_count=? WHERE username=?',
        [totalEarned, username],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.json({ message: '勋章更新成功', medals_count: totalEarned });
  } catch (err) {
    console.error('更新勋章错误:', err);
    res.status(500).json({ message: '更新勋章失败' });
  }
};
