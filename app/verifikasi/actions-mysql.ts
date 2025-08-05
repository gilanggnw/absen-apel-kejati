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

const db = drizzle(connection);

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
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      conditions.push(
        and(
          sql`${attendanceTable.timestamp} >= ${startOfDay.getTime()}`,
          sql`${attendanceTable.timestamp} <= ${endOfDay.getTime()}`
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
      employeePhoto: blobToBase64(result[0].employeePhoto as string | null),
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
      const date = new Date(record.timestamp);
      return date.toISOString().split('T')[0];
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
      const date = new Date(record.timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('❌ Error fetching dates with attendance records:', error);
    return [];
  }
}
