const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 从环境变量中读取数据库连接信息
const { DB_HOST, DB_USER, DB_PASSWORD } = process.env;

async function main() {
    try {
        // 创建数据库连接
        const connection = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD
        });

        console.log('Connected to the MySQL server.');

        // 读取 init.sql 文件内容
        const sqlFilePath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        // 将 SQL 文件内容按分号分割成多个 SQL 语句
        const statements = sql.split(';').filter(statement => statement.trim()!== '');

        // 依次执行每个 SQL 语句
        for (const statement of statements) {
            if (statement.trim() === '') continue;

            try {
                // 检查是否是 USE 语句或其他不支持预编译的语句
                const trimmedStmt = statement.trim().toUpperCase();
                if (trimmedStmt.startsWith('USE ') ||
                    trimmedStmt.startsWith('SET ') ||
                    trimmedStmt.startsWith('CREATE DATABASE ')) {
                    // 使用 query() 执行不支持预编译的语句
                    await connection.query(statement);
                } //else {
                    // 使用 execute() 执行支持预编译的语句（如 CREATE TABLE）
                   // await connection.execute(statement);
               // }
                console.log(`Executed SQL statement: ${statement.trim()}`);
            } catch (err) {
                console.error(`Error executing statement: ${statement.trim()}`);
                throw err; // 继续抛出错误，终止脚本执行
            }
        }

        console.log('Database and user table created successfully.');

        // 关闭数据库连接
        await connection.end();
    } catch (error) {
        console.error('Error deploying database:', error);
    }
}

main();