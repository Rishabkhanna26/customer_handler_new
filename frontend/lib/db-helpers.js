import { getConnection } from "./db";

// Get all users with their admin info
export async function getAllUsers() {
  const connection = await getConnection();
  try {
    const [users] = await connection.query(`
      SELECT u.*, a.name as admin_name 
      FROM users u 
      LEFT JOIN admin_accounts a ON u.assigned_admin_id = a.id
      ORDER BY u.created_at DESC
    `);
    return users;
  } finally {
    connection.release();
  }
}

// Get user by ID
export async function getUserById(userId) {
  const connection = await getConnection();
  try {
    const [user] = await connection.query(`
      SELECT u.*, a.name as admin_name 
      FROM users u 
      LEFT JOIN admin_accounts a ON u.assigned_admin_id = a.id
      WHERE u.id = ?
    `, [userId]);
    return user[0];
  } finally {
    connection.release();
  }
}

// Get all messages with user and admin details
export async function getAllMessages() {
  const connection = await getConnection();
  try {
    const [messages] = await connection.query(`
      SELECT m.*, u.name as user_name, u.phone, a.name as admin_name 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      LEFT JOIN admin_accounts a ON m.admin_id = a.id
      ORDER BY m.created_at DESC
    `);
    return messages;
  } finally {
    connection.release();
  }
}

// Get messages for a specific user
export async function getMessagesForUser(userId) {
  const connection = await getConnection();
  try {
    const [messages] = await connection.query(`
      SELECT m.*, u.name as user_name, a.name as admin_name 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      LEFT JOIN admin_accounts a ON m.admin_id = a.id
      WHERE m.user_id = ?
      ORDER BY m.created_at DESC
    `, [userId]);
    return messages;
  } finally {
    connection.release();
  }
}

// Get all requirements with user info
export async function getAllRequirements() {
  const connection = await getConnection();
  try {
    const [requirements] = await connection.query(`
      SELECT r.*, u.name, u.phone 
      FROM user_requirements r 
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return requirements;
  } finally {
    connection.release();
  }
}

export async function updateRequirementStatus(requirementId, status) {
  const connection = await getConnection();
  try {
    await connection.query(
      `UPDATE user_requirements SET status = ? WHERE id = ?`,
      [status, requirementId]
    );
    const [rows] = await connection.query(
      `SELECT r.*, u.name, u.phone 
       FROM user_requirements r 
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.id = ?
       LIMIT 1`,
      [requirementId]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

// Get all needs with user and admin info
export async function getAllNeeds() {
  const connection = await getConnection();
  try {
    const [needs] = await connection.query(`
      SELECT n.*, u.name, u.phone, a.name as assigned_admin_name 
      FROM user_needs n 
      LEFT JOIN users u ON n.user_id = u.id 
      LEFT JOIN admin_accounts a ON n.assigned_to = a.id
      ORDER BY n.created_at DESC
    `);
    return needs;
  } finally {
    connection.release();
  }
}

// Add new user
export async function addUser(phone, name, email, assigned_admin_id) {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(`
      INSERT INTO users (phone, name, email, assigned_admin_id) 
      VALUES (?, ?, ?, ?)
    `, [phone, name, email, assigned_admin_id]);
    return result.insertId;
  } finally {
    connection.release();
  }
}

// Add new message
export async function addMessage(user_id, admin_id, message_text, message_type) {
  const connection = await getConnection();
  try {
    const [result] = await connection.query(`
      INSERT INTO messages (user_id, admin_id, message_text, message_type, status) 
      VALUES (?, ?, ?, ?, 'sent')
    `, [user_id, admin_id, message_text, message_type]);
    return result.insertId;
  } finally {
    connection.release();
  }
}

// Get dashboard stats
export async function getDashboardStats() {
  const connection = await getConnection();
  try {
    const [stats] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM messages WHERE message_type = 'incoming') as incoming_messages,
        (SELECT COUNT(*) FROM user_requirements WHERE status = 'in_progress') as active_requirements,
        (SELECT COUNT(*) FROM user_needs WHERE status = 'open') as open_needs
    `);
    return stats[0];
  } finally {
    connection.release();
  }
}

export async function getAdminById(adminId) {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id, name, email, phone, admin_tier, status, created_at, updated_at
       FROM admin_accounts
       WHERE id = ?
       LIMIT 1`,
      [adminId]
    );
    return rows[0] || null;
  } finally {
    connection.release();
  }
}

export async function updateAdminProfile(adminId, { name, email }) {
  const connection = await getConnection();
  try {
    const updates = [];
    const values = [];
    if (typeof name === 'string') {
      updates.push('name = ?');
      values.push(name.trim());
    }
    if (typeof email === 'string') {
      updates.push('email = ?');
      values.push(email.trim() || null);
    }
    if (updates.length === 0) {
      return await getAdminById(adminId);
    }
    values.push(adminId);
    await connection.query(
      `UPDATE admin_accounts SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return await getAdminById(adminId);
  } finally {
    connection.release();
  }
}
