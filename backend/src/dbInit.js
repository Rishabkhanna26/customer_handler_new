import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME = process.env.DB_NAME || "client_handle";

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "root",
  port: Number(process.env.DB_PORT || 3306),
};

export async function initDatabase() {
  try {
    // 1️⃣ connect without database first
    const connection = await mysql.createConnection(config);

    console.log("✅ MySQL connected");

    // 2️⃣ create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    console.log(`✅ Database '${DB_NAME}' ready`);

    // 3️⃣ switch to database
    await connection.query(`USE ${DB_NAME}`);

    // 4️⃣ create admin_accounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE,
        password_hash TEXT,
        admin_tier ENUM('super_admin', 'client_admin') DEFAULT 'client_admin',
        status ENUM('active', 'inactive') DEFAULT 'active',
        parent_admin_id INT,
        last_login DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_admin_id) REFERENCES admin_accounts(id),
        INDEX (admin_tier),
        INDEX (phone)
      )
    `);

    // 5️⃣ create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100),
        email VARCHAR(150),
        assigned_admin_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_admin_id) REFERENCES admin_accounts(id),
        INDEX (phone),
        INDEX (assigned_admin_id)
      )
    `);

    // 6️⃣ create messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        admin_id INT NOT NULL,
        message_text TEXT NOT NULL,
        message_type ENUM('incoming', 'outgoing') NOT NULL,
        status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
        metadata JSON,
        media_mime_type VARCHAR(255),
        media_filename VARCHAR(255),
        media_data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES admin_accounts(id),
        INDEX (user_id, created_at),
        INDEX (admin_id, created_at)
      )
    `);

    // 7️⃣ create user_requirements table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_requirements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        requirement_text TEXT NOT NULL,
        category VARCHAR(100),
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX (user_id, status)
      )
    `);

    // 8️⃣ create user_needs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_needs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        need_text TEXT NOT NULL,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'assigned', 'completed') DEFAULT 'open',
        assigned_to INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES admin_accounts(id),
        INDEX (user_id, status)
      )
    `);

    console.log("✅ All tables ready");

    await connection.end();
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
    process.exit(1); // stop app if DB fails
  }
}
