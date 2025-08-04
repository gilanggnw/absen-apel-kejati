'use server';

import { db } from '@/db';
import { attendanceTable, employeesTable } from '@/db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

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

// Cache configuration
const CACHE_TAGS = {
  ATTENDANCE: 'attendance',
  STATS: 'stats',
  DATES: 'dates',
} as const;

// Helper function to convert blob to base64 only when needed
function blobToBase64(blob: ArrayBuffer | null): string | null {
  if (!blob) return null;
  try {
    return `data:image/jpeg;base64,${Buffer.from(blob).toString('base64')}`;
  } catch (error) {
    console.error('Error converting blob to base64:', error);
    return null;
  }
}

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
  // Get the date in GMT+7
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Create start of day in GMT+7 (subtract 7 hours to get UTC)
  const startGMT7 = new Date(year, month, day, 0, 0, 0, 0);
  const startUTC = startGMT7.getTime() - (7 * 60 * 60 * 1000);
  
  // Create end of day in GMT+7 (subtract 7 hours to get UTC)
  const endGMT7 = new Date(year, month, day, 23, 59, 59, 999);
  const endUTC = endGMT7.getTime() - (7 * 60 * 60 * 1000);
  
  return { start: startUTC, end: endUTC };
}

// Optimized function with caching and improved query performance
export async function getAttendanceForVerification(
  date?: Date,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedAttendanceResult> {
  // Create cache key based on parameters
  const cacheKey = `attendance-verification-${date?.toISOString()}-${page}-${limit}`;
  
  return unstable_cache(
    async () => {
      try {
        const offset = (page - 1) * limit;
        
        // Build the where conditions
        const conditions = [];
        
        if (date) {
          // Convert selected date to GMT+7 timestamp range
          const { start, end } = gmt7DateToUTCRange(date);
          
          conditions.push(
            and(
              sql`${attendanceTable.timestamp} >= ${start}`,
              sql`${attendanceTable.timestamp} <= ${end}`
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Optimized query: Get records without BLOB data first for better performance
        const [attendanceRecords, totalCountResult] = await Promise.all([
          // Get paginated records with minimal data first
          db
            .select({
              id: attendanceTable.id,
              nama: employeesTable.nama,
              nip: employeesTable.nip,
              timestamp: attendanceTable.timestamp,
              status: attendanceTable.status,
              verified_status: attendanceTable.verified_status,
              hasPhoto: sql<number>`CASE WHEN ${attendanceTable.photo} IS NOT NULL THEN 1 ELSE 0 END`,
              hasEmployeePhoto: sql<number>`CASE WHEN ${employeesTable.foto} IS NOT NULL THEN 1 ELSE 0 END`,
            })
            .from(attendanceTable)
            .leftJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip))
            .where(whereClause)
            .orderBy(desc(attendanceTable.timestamp))
            .limit(limit)
            .offset(offset),
          
          // Get total count with a simpler query
          db
            .select({ count: count() })
            .from(attendanceTable)
            .where(whereClause)
        ]);

        const totalRecords = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalRecords / limit);

        // Only fetch BLOB data when specifically needed (lazy loading)
        const records: AttendanceRecord[] = attendanceRecords.map((record) => ({
          id: String(record.id) || '',
          nama: record.nama || '',
          nip: record.nip || '',
          timestamp: record.timestamp || 0,
          status: record.status || '',
          verified_status: record.verified_status || 'pending',
          photo: record.hasPhoto ? 'lazy-load' : null, // Placeholder for lazy loading
          employeePhoto: record.hasEmployeePhoto ? 'lazy-load' : null, // Placeholder for lazy loading
        }));

        return {
          records,
          total: totalRecords,
          totalPages,
          currentPage: page,
        };
      } catch (error) {
        console.error('Error fetching attendance records:', error);
        return {
          records: [],
          total: 0,
          totalPages: 0,
          currentPage: page,
        };
      }
    },
    [cacheKey],
    {
      tags: [CACHE_TAGS.ATTENDANCE],
      revalidate: 10, // Reduced to 10 seconds for faster development
    }
  )();
}

// New function to fetch photos only when needed (lazy loading)
export async function getAttendancePhotos(recordId: string): Promise<{
  photo: string | null;
  employeePhoto: string | null;
}> {
  const cacheKey = `attendance-photos-${recordId}`;
  
  return unstable_cache(
    async () => {
      try {
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
          photo: blobToBase64(result[0].photo as ArrayBuffer | null),
          employeePhoto: blobToBase64(result[0].employeePhoto as ArrayBuffer | null),
        };
      } catch (error) {
        console.error('Error fetching attendance photos:', error);
        return { photo: null, employeePhoto: null };
      }
    },
    [cacheKey],
    {
      tags: [CACHE_TAGS.ATTENDANCE],
      revalidate: 3600, // 1 hour cache for photos
    }
  )();
}

export async function updateVerificationStatus(
  recordId: string,
  status: 'approved' | 'rejected',
  verifiedBy: string
) {
  try {
    await db
      .update(attendanceTable)
      .set({
        verified_status: status,
        verified_by: verifiedBy,
      })
      .where(eq(attendanceTable.id, parseInt(recordId)));

    // Invalidate relevant caches
    await Promise.all([
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: [CACHE_TAGS.ATTENDANCE, CACHE_TAGS.STATS, CACHE_TAGS.DATES] })
      }).catch(() => {}) // Ignore errors for cache invalidation
    ]);

    return { success: true };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { success: false, error: 'Failed to update verification status' };
  }
}

export async function getAttendanceStats() {
  return unstable_cache(
    async () => {
      try {
        // Use a single query with conditional aggregation for better performance
        const result = await db
          .select({
            total: count(),
            approved: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'approved' THEN 1 END)`,
            pending: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'pending' THEN 1 END)`,
            rejected: sql<number>`COUNT(CASE WHEN ${attendanceTable.verified_status} = 'rejected' THEN 1 END)`,
          })
          .from(attendanceTable);

        const stats = result[0];
        return {
          total: Number(stats?.total || 0),
          approved: Number(stats?.approved || 0),
          pending: Number(stats?.pending || 0),
          rejected: Number(stats?.rejected || 0),
        };
      } catch (error) {
        console.error('Error fetching attendance stats:', error);
        return { total: 0, approved: 0, pending: 0, rejected: 0 };
      }
    },
    ['attendance-stats'],
    {
      tags: [CACHE_TAGS.STATS],
      revalidate: 10, // Reduced to 10 seconds for faster development
    }
  )();
}

export async function getDatesWithPendingRequests(): Promise<string[]> {
  return unstable_cache(
    async () => {
      try {
        const records = await db
          .select({
            timestamp: attendanceTable.timestamp,
          })
          .from(attendanceTable)
          .where(eq(attendanceTable.verified_status, 'pending'))
          .groupBy(sql`DATE(${attendanceTable.timestamp} / 1000, 'unixepoch')`); // Group by date for efficiency

        const dates = records.map((record) => {
          const date = new Date(record.timestamp);
          return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        });

        return [...new Set(dates)]; // Remove duplicates
      } catch (error) {
        console.error('Error fetching dates with pending requests:', error);
        return [];
      }
    },
    ['dates-pending'],
    {
      tags: [CACHE_TAGS.DATES],
      revalidate: 10, // Reduced to 10 seconds for faster development
    }
  )();
}

export async function getDatesWithAttendanceRecords(): Promise<string[]> {
  return unstable_cache(
    async () => {
      try {
        const records = await db
          .select({
            timestamp: attendanceTable.timestamp,
          })
          .from(attendanceTable);

        // Convert timestamps to date strings in GMT+7 timezone
        const datesWithRecords = records.map(record => {
          const dateString = timestampToGMT7DateString(record.timestamp);
          console.log('📅 Timestamp:', record.timestamp, '→ GMT+7 Date:', dateString);
          return dateString;
        });

        // Remove duplicates and return unique dates
        return [...new Set(datesWithRecords)];
      } catch (error) {
        console.error('Error fetching dates with attendance records:', error);
        return [];
      }
    },
    ['dates-attendance'],
    {
      tags: [CACHE_TAGS.DATES],
      revalidate: 30, // 30 seconds cache for dates
    }
  )();
}

// Helper function to clear all caches manually (for development)
export async function clearAllCaches() {
  try {
    await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: ['attendance', 'stats', 'dates'] })
    });
    console.log('🔄 All caches cleared successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
    return { success: false };
  }
}
