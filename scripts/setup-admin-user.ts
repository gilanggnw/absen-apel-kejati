// Utility to check users and create admin user if needed
// Run this once to set up your admin user properly

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { usersTable } from '../db/schema-mysql';
import crypto from 'crypto';

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'absen_apel_kejati',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = drizzle(connection);

async function checkAndCreateAdminUser() {
  try {
    console.log('🔍 Checking existing users...');
    
    // Check existing users
    const existingUsers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role
      })
      .from(usersTable);

    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });

    if (existingUsers.length === 0) {
      console.log('\n🔧 No users found. Creating default admin user...');
      
      const adminUserId = crypto.randomUUID();
      await db
        .insert(usersTable)
        .values({
          id: adminUserId,
          name: 'Administrator',
          email: 'admin@kejati.local',
          password: 'admin123', // Change this to a proper hashed password
          role: 'admin'
        });

      console.log('✅ Default admin user created successfully!');
      console.log(`   ID: ${adminUserId}`);
      console.log('   Email: admin@kejati.local');
      console.log('   Password: admin123 (Please change this)');
      console.log('   Role: admin');
    } else {
      console.log('\n✅ Users already exist in the database.');
    }

    console.log('\n💡 You can now use any of these user IDs for verification:');
    const finalUsers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role
      })
      .from(usersTable);

    finalUsers.forEach(user => {
      console.log(`  - ${user.name}: ${user.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

// Run the function
checkAndCreateAdminUser();
