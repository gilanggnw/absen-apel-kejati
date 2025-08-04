import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

console.log('Environment check:');
console.log('USE_MYSQL:', process.env.USE_MYSQL);
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);

import { db, attendanceTable, employeesTable } from './switch';
import { count } from 'drizzle-orm';

async function testMySQLConnection() {
  try {
    console.log('🔍 Testing MySQL connection...');
    
    // Test basic connection
    const attendanceCount = await db.select({ count: count() }).from(attendanceTable);
    console.log('📊 Attendance records count:', attendanceCount[0]?.count || 0);
    
    const employeesCount = await db.select({ count: count() }).from(employeesTable);
    console.log('👥 Employees count:', employeesCount[0]?.count || 0);
    
    // Test fetching some records
    const sampleAttendance = await db.select().from(attendanceTable).limit(5);
    console.log('📝 Sample attendance records:', sampleAttendance);
    
    const sampleEmployees = await db.select().from(employeesTable).limit(5);
    console.log('👤 Sample employees:', sampleEmployees.map((emp: any) => ({
      id: emp.id,
      nama: emp.nama,
      nip: emp.nip,
      hasPhoto: !!emp.foto
    })));
    
    console.log('✅ MySQL connection test completed successfully!');
  } catch (error) {
    console.error('❌ MySQL connection test failed:', error);
  }
}

testMySQLConnection();
