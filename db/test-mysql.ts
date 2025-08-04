import 'dotenv/config';
import { db } from './mysql';

async function testConnection() {
  try {
    console.log('🔄 Testing MySQL database connection...');
    
    // Simple query to test connection
    const result = await db.execute('SELECT 1 as test');
    console.log('✅ MySQL connection successful!');
    console.log('Test result:', result);
    
    // Test if we can list tables
    const tables = await db.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables);
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your .env file for correct credentials');
    console.log('3. Ensure the database exists: CREATE DATABASE absen_apel_kejati;');
    console.log('4. Verify MySQL user has proper permissions');
  }
}

if (require.main === module) {
  testConnection().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}
