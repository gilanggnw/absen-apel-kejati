import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'absen_apel_kejati',
  waitForConnections: true,
  connectionLimit: 5, // Reduce concurrent connections to avoid overwhelming DB
  queueLimit: 0,
});

export const db = drizzle(connection);
