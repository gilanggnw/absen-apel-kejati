'use server';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import {
  employeesTable,
  attendanceTable,
  usersTable
} from '../../db/schema-mysql';

// Direct MySQL connection for verification actions
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'absen_apel_kejati',
  ssl: process.env.MYSQL_HOST?.includes('aivencloud.com') ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('🐬 MySQL Connection Config:', {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  database: process.env.MYSQL_DATABASE || 'absen_apel_kejati',
  isAiven: process.env.MYSQL_HOST?.includes('aivencloud.com') || false
});

const db = drizzle(connection);

// Helper function to convert timestamp to GMT+7 date string
function timestampToGMT7DateString(timestamp: number): string {
  const date = new Date(timestamp);
  // Convert to GMT+7 (UTC+7)
  const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const year = gmt7Date.getUTCFullYear();
  const month = String(gmt7Date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(gmt7Date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to convert GMT+7 date to UTC timestamp range
function gmt7DateToUTCRange(date: Date): { start: number; end: number } {
  // Since this app is only used in Indonesia (GMT+7), let's simplify this
  // The date picker sends us a UTC date that represents the start of the selected day in GMT+7
  // For example: clicking Aug 4th sends "2025-08-03T17:00:00.000Z" (which is Aug 4th 00:00 GMT+7)
  
  console.log('🔍 Verifikasi date range calculation (SIMPLIFIED):');
  console.log('   Input date object:', date);
  console.log('   Input date toISOString():', date.toISOString());
  console.log('   Input date toDateString():', date.toDateString());
  
  // Convert the UTC timestamp to GMT+7 to get the actual selected date
  const gmt7Date = new Date(date.getTime() + (7 * 60 * 60 * 1000));
  const year = gmt7Date.getUTCFullYear();
  const month = gmt7Date.getUTCMonth();
  const day = gmt7Date.getUTCDate();
  
  console.log('   Converted to GMT+7:', gmt7Date.toISOString());
  console.log('   Extracted GMT+7 components: year=', year, 'month=', month, 'day=', day);
  
  // Create start and end of day in GMT+7 timezone
  // Start: YYYY-MM-DD 00:00:00 GMT+7 = YYYY-MM-DD 17:00:00 UTC (previous day)
  // End: YYYY-MM-DD 23:59:59 GMT+7 = YYYY-MM-DD 16:59:59 UTC (same day)
  const startUTC = Date.UTC(year, month, day, 0, 0, 0, 0) - (7 * 60 * 60 * 1000);
  const endUTC = Date.UTC(year, month, day, 23, 59, 59, 999) - (7 * 60 * 60 * 1000);
  
  console.log('   Target GMT+7 date: ', `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  console.log('   GMT+7 start (00:00:00):', new Date(Date.UTC(year, month, day, 0, 0, 0, 0)).toISOString().replace('T', ' ').substring(0, 19), 'GMT+7');
  console.log('   GMT+7 end (23:59:59):', new Date(Date.UTC(year, month, day, 23, 59, 59, 999)).toISOString().replace('T', ' ').substring(0, 19), 'GMT+7');
  console.log('   UTC start timestamp:', startUTC, '→', new Date(startUTC).toISOString());
  console.log('   UTC end timestamp:', endUTC, '→', new Date(endUTC).toISOString());
  
  return { start: startUTC, end: endUTC };
}

export interface AttendanceRecord {
  id: string;
  nama: string;
  nip: string;
  timestamp: number;
  status: string;
  verified_status: string;
  photo: string | null;
  employeePhoto: string | null;
}

export interface PaginatedAttendanceResult {
  records: AttendanceRecord[];
  total: number;
  totalPages: number;
  currentPage: number;
}

// Cache configuration (for future use)
// const CACHE_TAGS = {
//   ATTENDANCE: 'attendance',
//   STATS: 'stats',
//   DATES: 'dates',
// } as const;

// Helper function to convert blob to base64 only when needed
function blobToBase64(blob: string | ArrayBuffer | null): string | null {
  if (!blob) return null;
  try {
    // For MySQL, photos are stored as LONGTEXT (base64 strings)
    if (typeof blob === 'string') {
      // If it's already a base64 string with data URI, return as is
      if (blob.startsWith('data:')) {
        return blob;
      }
      // If it's just base64 without data URI prefix, add it
      return `data:image/jpeg;base64,${blob}`;
    }
    // For ArrayBuffer (legacy support)
    return `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}`;
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    return null;
  }
}

// Optimized function with caching and improved query performance
export async function getAttendanceForVerification(
  date?: Date,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedAttendanceResult> {
  try {
    console.log('🔍 Fetching attendance for verification from MySQL...');
    const offset = (page - 1) * limit;
    
    // Build the where conditions
    const conditions = [];
    
    if (date) {
      // Use the GMT+7 helper function to get proper UTC timestamp range
      const { start, end } = gmt7DateToUTCRange(date);
      
      conditions.push(
        and(
          sql`${attendanceTable.timestamp} >= ${start}`,
          sql`${attendanceTable.timestamp} <= ${end}`
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get records with employee data
    const [attendanceRecords, totalCountResult] = await Promise.all([
      db
        .select({
          id: attendanceTable.id,
          nama: employeesTable.nama,
          nip: employeesTable.nip,
          timestamp: attendanceTable.timestamp,
          status: attendanceTable.status,
          verified_status: attendanceTable.verified_status,
          hasPhoto: sql<number>`CASE WHEN ${attendanceTable.photo} IS NOT NULL AND ${attendanceTable.photo} != '' THEN 1 ELSE 0 END`,
          hasEmployeePhoto: sql<number>`CASE WHEN ${employeesTable.foto} IS NOT NULL AND ${employeesTable.foto} != '' THEN 1 ELSE 0 END`,
        })
        .from(attendanceTable)
        .leftJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip))
        .where(whereClause)
        .orderBy(desc(attendanceTable.timestamp))
        .limit(limit)
        .offset(offset),
      
      db
        .select({ count: count() })
        .from(attendanceTable)
        .where(whereClause)
    ]);

    const totalRecords = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    // Format the records
    const records: AttendanceRecord[] = attendanceRecords.map((record: {
      id: number;
      nama: string | null;
      nip: string | null;
      timestamp: number;
      status: string;
      verified_status: string;
      hasPhoto: number;
      hasEmployeePhoto: number;
    }) => ({
      id: String(record.id) || '',
      nama: record.nama || '',
      nip: record.nip || '',
      timestamp: record.timestamp || 0,
      status: record.status || '',
      verified_status: record.verified_status || 'pending',
      photo: record.hasPhoto ? 'lazy-load' : null,
      employeePhoto: record.hasEmployeePhoto ? 'lazy-load' : null,
    }));

    console.log(`✅ Found ${records.length} attendance records`);

    return {
      records,
      total: totalRecords,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('❌ Error fetching attendance records from MySQL:', error);
    return {
      records: [],
      total: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

// Function to fetch photos only when needed
export async function getAttendancePhotos(recordId: string): Promise<{
  photo: string | null;
  employeePhoto: string | null;
}> {
  try {
    console.log('📷 Fetching photos for record:', recordId);
    
    const result = await db
      .select({
        photo: attendanceTable.photo,
        employeePhoto: employeesTable.foto,
      })
      .from(attendanceTable)
      .leftJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip))
      .where(eq(attendanceTable.id, parseInt(recordId)))
      .limit(1);

    if (!result[0]) {
      return { photo: null, employeePhoto: null };
    }

    return {
      photo: blobToBase64(result[0].photo as string | null),
      employeePhoto: result[0].employeePhoto 
        ? (result[0].employeePhoto.startsWith('data:') || result[0].employeePhoto.startsWith('/') || result[0].employeePhoto.startsWith('http')
            ? result[0].employeePhoto
            : `/${result[0].employeePhoto}`)
        : null,
    };
  } catch (error) {
    console.error('❌ Error fetching attendance photos:', error);
    return { photo: null, employeePhoto: null };
  }
}

// Helper function to ensure user exists or create a default one
async function ensureUserExists(userId: string): Promise<boolean> {
  try {
    // Check if user exists
    const userExists = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userExists.length > 0) {
      return true;
    }

    // If user doesn't exist, create a default admin user with this ID
    console.log(`🔧 Creating default user with ID: ${userId}`);
    
    await db
      .insert(usersTable)
      .values({
        id: userId,
        name: 'Admin User',
        email: `admin-${userId.substring(0, 8)}@system.local`,
        password: 'temp-password', // This should be properly hashed in production
        role: 'admin'
      });

    console.log('✅ Default user created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    return false;
  }
}

export async function updateVerificationStatus(
  recordId: string,
  status: 'approved' | 'rejected',
  verifiedBy: string
) {
  try {
    console.log(`🔄 Updating verification status for record ${recordId} to ${status}`);
    
    // Ensure the user exists or create a default one
    const userValid = await ensureUserExists(verifiedBy);
    
    if (userValid) {
      // Update with verified_by if user exists/was created
      await db
        .update(attendanceTable)
        .set({
          verified_status: status,
          verified_by: verifiedBy,
        })
        .where(eq(attendanceTable.id, parseInt(recordId)));
    } else {
      // Fallback: Update without verified_by if user creation failed
      console.warn(`⚠️ Could not ensure user ${verifiedBy} exists. Updating without verified_by.`);
      
      await db
        .update(attendanceTable)
        .set({
          verified_status: status,
        })
        .where(eq(attendanceTable.id, parseInt(recordId)));
    }

    console.log('✅ Verification status updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating verification status:', error);
    return { success: false, error: 'Failed to update verification status' };
  }
}

export async function getAttendanceStats() {
  try {
    console.log('📊 Fetching attendance stats from MySQL...');
    
    const result = await db
      .select({
        total: count(),
        approved: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'approved' THEN 1 END)`,
        pending: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'pending' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'rejected' THEN 1 END)`,
      })
      .from(attendanceTable);

    const stats = result[0];
    const finalStats = {
      total: Number(stats?.total || 0),
      approved: Number(stats?.approved || 0),
      pending: Number(stats?.pending || 0),
      rejected: Number(stats?.rejected || 0),
    };
    
    console.log('📊 Stats:', finalStats);
    return finalStats;
  } catch (error) {
    console.error('❌ Error fetching attendance stats:', error);
    return { total: 0, approved: 0, pending: 0, rejected: 0 };
  }
}

export async function getDatesWithPendingRequests(): Promise<string[]> {
  try {
    console.log('📅 Fetching dates with pending requests...');
    
    const records = await db
      .select({
        timestamp: attendanceTable.timestamp,
      })
      .from(attendanceTable)
      .where(eq(attendanceTable.verified_status, 'pending'));

    const dates: string[] = records.map((record: { timestamp: number }) => {
      // Use the helper function to convert timestamp to GMT+7 date string
      return timestampToGMT7DateString(record.timestamp);
    });

    return [...new Set(dates)];
  } catch (error) {
    console.error('❌ Error fetching dates with pending requests:', error);
    return [];
  }
}

export async function getDatesWithAttendanceRecords(): Promise<string[]> {
  try {
    console.log('📅 Fetching dates with attendance records...');
    
    const records = await db
      .select({
        timestamp: attendanceTable.timestamp,
      })
      .from(attendanceTable);

    const datesWithRecords: string[] = records.map((record: { timestamp: number }) => {
      // Use the helper function to convert timestamp to GMT+7 date string
      return timestampToGMT7DateString(record.timestamp);
    });

    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('❌ Error fetching dates with attendance records:', error);
    return [];
  }
}
