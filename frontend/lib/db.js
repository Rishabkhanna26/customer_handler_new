import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'client_handle',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function getConnection() {
  return await getPool().getConnection();
}
