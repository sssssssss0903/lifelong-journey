import mysql from 'mysql2';
import { config } from './env.js';

export const initDB = () => {
  const db = mysql.createConnection({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    multipleStatements: true,
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

  db.query(initSql, (err) => {
    if (err) {
      console.error('❌ 数据库初始化失败:', err);
    } else {
      console.log('✅ 数据库初始化完成');
    }
  });

  return db;
};

// 这里导出一个单例
const db = initDB();
export default db;
