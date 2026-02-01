import mysql from "mysql2/promise";

const DB_NAME = "client_handle";

const config = {
  host: "localhost",
  user: "root",        // change if needed
  password: "",        // change if needed
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

    // 4️⃣ create admins table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 5️⃣ create clients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(150),
        reason VARCHAR(150),
        status VARCHAR(50) DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 6️⃣ create admin_clients table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin_clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        client_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (admin_id, client_id),
        FOREIGN KEY (admin_id) REFERENCES admins(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // 7️⃣ create messages table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_id INT NOT NULL,
        admin_id INT,
        direction ENUM('incoming','outgoing') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (admin_id) REFERENCES admins(id)
      )
    `);

    console.log("✅ All tables ready");

    await connection.end();
  } catch (err) {
    console.error("❌ Database init failed:", err.message);
    process.exit(1); // stop app if DB fails
  }
}
