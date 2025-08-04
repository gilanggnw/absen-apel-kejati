// Database switching utility
const USE_MYSQL = process.env.USE_MYSQL === 'true';

let db: any;
let schema: any;

if (USE_MYSQL) {
  console.log('🐬 Using MySQL database');
  // MySQL configuration
  const { db: mysqlDb } = require('./mysql');
  const mysqlSchema = require('./schema-mysql');
  db = mysqlDb;
  schema = mysqlSchema;
} else {
  console.log('🚀 Using Turso (SQLite) database');
  // Turso configuration (existing)  
  const { db: tursoDb } = require('./index');
  const tursoSchema = require('./schema');
  db = tursoDb;
  schema = tursoSchema;
}

export { db };
export const { 
  usersTable, 
  accountsTable, 
  sessionsTable, 
  verificationTokensTable,
  employeesTable,
  attendanceTable 
} = schema;
