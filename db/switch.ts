// Database switching utility
const USE_MYSQL = process.env.USE_MYSQL === 'true';

let db: any;
let schema: any;

if (USE_MYSQL) {
  // MySQL configuration
  const mysqlConnection = require('./mysql');
  const mysqlSchema = require('./schema-mysql');
  db = mysqlConnection.db;
  schema = mysqlSchema;
} else {
  // Turso configuration (existing)
  const tursoConnection = require('./index');
  const tursoSchema = require('./schema');
  db = tursoConnection.db;
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
