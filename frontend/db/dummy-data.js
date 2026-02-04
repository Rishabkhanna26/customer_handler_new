import './load-env.js';
import mysql from "mysql2/promise";
import { hashPassword } from "../lib/auth.js";

const DB_NAME = process.env.DB_NAME || "client_handle";

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "root",
  port: Number(process.env.DB_PORT || 3306),
};

export async function insertDummyData() {
  try {
    const connection = await mysql.createConnection({
      ...config,
      database: DB_NAME
    });

    console.log("📝 Inserting dummy data...");

    const superAdminPassword = hashPassword('Admin@123');
    const clientAdminPassword = hashPassword('Admin@123');

    // 1️⃣ Insert Super Admin
    await connection.query(`
      INSERT INTO admin_accounts (id, name, phone, email, password_hash, admin_tier, status)
      VALUES (1, 'Super Admin', '9999999999', 'superadmin@algoaura.com', ?, 'super_admin', 'active')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [superAdminPassword]);

    // 2️⃣ Insert Client Admins
    await connection.query(`
      INSERT INTO admin_accounts (id, name, phone, email, password_hash, admin_tier, parent_admin_id, status)
      VALUES 
      (2, 'Client Admin 1', '9876543210', 'admin1@client.com', ?, 'client_admin', 1, 'active'),
      (3, 'Client Admin 2', '9865432109', 'admin2@client.com', ?, 'client_admin', 1, 'active')
      ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)
    `, [clientAdminPassword, clientAdminPassword]);

    // 3️⃣ Insert Users/Contacts
    await connection.query(`
      INSERT IGNORE INTO users (phone, name, email, assigned_admin_id)
      VALUES 
      ('8765432109', 'Rajesh Kumar', 'rajesh@email.com', 2),
      ('8754321098', 'Priya Singh', 'priya@email.com', 2),
      ('8743210987', 'Amit Patel', 'amit@email.com', 3),
      ('8732109876', 'Sneha Desai', 'sneha@email.com', 3),
      ('8721098765', 'Vikram Sharma', 'vikram@email.com', 2)
    `);

    // 4️⃣ Insert Messages
    await connection.query(`
      INSERT INTO messages (user_id, admin_id, message_text, message_type, status)
      VALUES 
      (1, 2, 'Hi, I need help with my project', 'incoming', 'delivered'),
      (1, 2, 'Sure! I will help you. What do you need?', 'outgoing', 'sent'),
      (2, 2, 'Can you provide a quote?', 'incoming', 'delivered'),
      (2, 2, 'I will send you the quote soon', 'outgoing', 'sent'),
      (3, 3, 'Hello, I am interested in your services', 'incoming', 'delivered'),
      (3, 3, 'Thank you for reaching out!', 'outgoing', 'sent'),
      (4, 3, 'What is your pricing?', 'incoming', 'delivered'),
      (5, 2, 'I want to know more details', 'incoming', 'read')
    `);

    // 5️⃣ Insert User Requirements
    await connection.query(`
      INSERT INTO user_requirements (user_id, requirement_text, category, status)
      VALUES 
      (1, 'Develop a mobile app', 'Development', 'in_progress'),
      (1, 'SEO Optimization', 'Marketing', 'pending'),
      (2, 'Website redesign', 'Design', 'pending'),
      (3, 'API Integration', 'Development', 'in_progress'),
      (4, 'Content Writing', 'Content', 'pending'),
      (5, 'Cloud Migration', 'Infrastructure', 'completed')
    `);

    // 6️⃣ Insert User Needs
    await connection.query(`
      INSERT INTO user_needs (user_id, need_text, priority, status, assigned_to)
      VALUES 
      (1, 'Fast turnaround time', 'high', 'assigned', 2),
      (1, 'Budget friendly solution', 'medium', 'assigned', 2),
      (2, 'Modern design trends', 'urgent', 'assigned', 2),
      (3, 'Scalable architecture', 'high', 'assigned', 3),
      (4, 'Native speaker writers', 'medium', 'open', 3),
      (5, 'Zero downtime migration', 'urgent', 'assigned', 2)
    `);

    console.log("✅ Dummy data inserted successfully");
    await connection.end();
  } catch (err) {
    console.error("❌ Dummy data insertion failed:", err.message);
    process.exit(1);
  }
}
