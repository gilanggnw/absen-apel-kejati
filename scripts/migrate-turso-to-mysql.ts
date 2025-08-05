import 'dotenv/config';

// Turso database connection
import { db as tursoDb } from '../db/index';
import { 
  usersTable as tursoUsers, 
  employeesTable as tursoEmployees,
  attendanceTable as tursoAttendance 
} from '../db/schema';

// MySQL database connection
import { db as mysqlDb } from '../db/mysql';
import { 
  usersTable as mysqlUsers, 
  employeesTable as mysqlEmployees,
  attendanceTable as mysqlAttendance 
} from '../db/schema-mysql';

async function migrateUsers() {
  try {
    console.log('📥 Fetching users from Turso...');
    const tursoUserData = await tursoDb.select().from(tursoUsers);
    console.log(`Found ${tursoUserData.length} users in Turso`);

    if (tursoUserData.length > 0) {
      console.log('📤 Clearing existing users in MySQL...');
      await mysqlDb.delete(mysqlUsers);
      
      console.log('📤 Inserting users into MySQL...');
      await mysqlDb.insert(mysqlUsers).values(tursoUserData);
      console.log(`✅ Successfully migrated ${tursoUserData.length} users`);
    }
  } catch (error) {
    console.error('❌ Error migrating users:', error);
  }
}

async function migrateEmployees() {
  try {
    console.log('📥 Fetching employees from Turso...');
    const tursoEmployeeData = await tursoDb.select().from(tursoEmployees);
    console.log(`Found ${tursoEmployeeData.length} employees in Turso`);

    if (tursoEmployeeData.length > 0) {
      console.log('📤 Clearing existing employees in MySQL...');
      await mysqlDb.delete(mysqlEmployees);
      
      console.log('📤 Inserting employees into MySQL...');
      // Clean the data to match MySQL schema
      const cleanedData = tursoEmployeeData.map(emp => ({
        ...emp,
        foto: emp.foto ? String(emp.foto) : null,
        jabatan: emp.jabatan || null,
        pangkat: emp.pangkat || null
      }));
      await mysqlDb.insert(mysqlEmployees).values(cleanedData);
      console.log(`✅ Successfully migrated ${tursoEmployeeData.length} employees`);
    }
  } catch (error) {
    console.error('❌ Error migrating employees:', error);
  }
}

async function migrateAttendance() {
  try {
    console.log('📥 Fetching attendance records from Turso...');
    const tursoAttendanceData = await tursoDb.select().from(tursoAttendance);
    console.log(`Found ${tursoAttendanceData.length} attendance records in Turso`);

    if (tursoAttendanceData.length > 0) {
      console.log('📤 Clearing existing attendance records in MySQL...');
      await mysqlDb.delete(mysqlAttendance);
      
      console.log('📤 Inserting attendance records into MySQL...');
      // Process in batches to avoid memory issues
      const batchSize = 1000;
      for (let i = 0; i < tursoAttendanceData.length; i += batchSize) {
        const batch = tursoAttendanceData.slice(i, i + batchSize);
        // Clean the data to match MySQL schema
        const cleanedBatch = batch.map(att => ({
          ...att,
          photo: att.photo ? String(att.photo) : null,
          nip: att.nip || null,
          verified_by: att.verified_by || null
        }));
        await mysqlDb.insert(mysqlAttendance).values(cleanedBatch);
        console.log(`✅ Migrated batch ${Math.ceil((i + batchSize) / batchSize)} of ${Math.ceil(tursoAttendanceData.length / batchSize)}`);
      }
      console.log(`✅ Successfully migrated ${tursoAttendanceData.length} attendance records`);
    }
  } catch (error) {
    console.error('❌ Error migrating attendance:', error);
  }
}

// Helper function to check connection
async function checkConnections() {
  try {
    console.log('🔍 Checking Turso connection...');
    await tursoDb.select().from(tursoUsers).limit(1);
    console.log('✅ Turso connection OK');

    console.log('🔍 Checking MySQL connection...');
    await mysqlDb.select().from(mysqlUsers).limit(1);
    console.log('✅ MySQL connection OK');
  } catch (error) {
    console.error('❌ Connection check failed:', error);
    throw error;
  }
}

// Main migration function
async function runMigration() {
  try {
    console.log('🚀 Starting Turso to MySQL migration...');
    console.log('='.repeat(50));

    await checkConnections();

    await migrateUsers();
    console.log('-'.repeat(30));
    
    await migrateEmployees();
    console.log('-'.repeat(30));
    
    await migrateAttendance();
    console.log('-'.repeat(30));

    console.log('='.repeat(50));
    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export { runMigration };
