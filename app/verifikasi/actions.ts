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
          // Use UTC to avoid timezone issues between localhost and Vercel
          const startOfDay = new Date(date);
          startOfDay.setUTCHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setUTCHours(23, 59, 59, 999);
          
          conditions.push(
            and(
              sql`${attendanceTable.timestamp} >= ${startOfDay.getTime()}`,
              sql`${attendanceTable.timestamp} <= ${endOfDay.getTime()}`
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
      revalidate: 300, // 5 minutes cache
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
      revalidate: 600, // 10 minutes cache
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
      revalidate: 300, // 5 minutes cache
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

        // Convert timestamps to date strings (YYYY-MM-DD format) using UTC to avoid timezone issues
        const datesWithRecords = records.map(record => {
          const date = new Date(record.timestamp);
          // Use UTC methods to ensure consistent behavior between localhost and Vercel
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(date.getUTCDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
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
      revalidate: 3600, // 1 hour cache (dates don't change often)
    }
  )();
}
