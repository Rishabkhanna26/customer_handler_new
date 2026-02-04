import './load-env.js';
import mysql from "mysql2/promise";

const DB_NAME = process.env.DB_NAME || "client_handle";

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "root",
  port: Number(process.env.DB_PORT || 3306),
};

async function dbExists(connection, dbName) {
  const [rows] = await connection.query(
    `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
    [dbName]
  );
  return rows.length > 0;
}

async function tableExists(connection, tableName) {
  const [rows] = await connection.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB_NAME, tableName]
  );
  return rows.length > 0;
}

export async function initDatabase() {
  try {
    // 1️⃣ connect without database first
    const connection = await mysql.createConnection(config);

    console.log("✅ MySQL connected");

    // 2️⃣ check if database exists
    const exists = await dbExists(connection, DB_NAME);
    
    if (exists) {
      console.log(`✅ Database '${DB_NAME}' already exists - skipping creation`);
      await connection.query(`USE ${DB_NAME}`);
    } else {
      console.log(`📝 Creating database '${DB_NAME}'...`);
      // 3️⃣ create database if not exists
      await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
      console.log(`✅ Database '${DB_NAME}' created`);

      // 4️⃣ switch to database
      await connection.query(`USE ${DB_NAME}`);
    }

    // ========== TABLE DEFINITIONS ==========
    const tables = [
      {
        name: "admin_accounts",
        sql: `
          CREATE TABLE admin_accounts (
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
        `,
      },
      {
        name: "users",
        sql: `
          CREATE TABLE users (
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
        `,
      },
      {
        name: "messages",
        sql: `
          CREATE TABLE messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            admin_id INT NOT NULL,
            message_text TEXT NOT NULL,
            message_type ENUM('incoming', 'outgoing') NOT NULL,
            status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (admin_id) REFERENCES admin_accounts(id),
            INDEX (user_id, created_at),
            INDEX (admin_id, created_at)
          )
        `,
      },
      {
        name: "user_requirements",
        sql: `
          CREATE TABLE user_requirements (
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
        `,
      },
      {
        name: "user_needs",
        sql: `
          CREATE TABLE user_needs (
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
        `,
      },
    ];

    let createdCount = 0;
    for (const table of tables) {
      const exists = await tableExists(connection, table.name);
      if (exists) {
        console.log(`✅ Table '${table.name}' already exists - skipping`);
        continue;
      }
      console.log(`📝 Creating table '${table.name}'...`);
      await connection.query(table.sql);
      createdCount += 1;
    }

    if (createdCount === 0) {
      console.log("✅ All tables already exist");
    } else {
      console.log(`✅ Tables created: ${createdCount}/${tables.length}`);
    }

    console.log("✅ Database ready and verified");

    await connection.end();
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
    process.exit(1);
  }
}
