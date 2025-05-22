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