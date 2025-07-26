'use server';

import { db } from '@/db';
import { attendanceTable, employeesTable } from '@/db/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';

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

export async function getAttendanceForVerification(
  date?: Date,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedAttendanceResult> {
  try {
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

    // Execute both queries in parallel for better performance
    const [attendanceRecords, totalCountResult] = await Promise.all([
      // Get paginated records
      db
        .select({
          id: attendanceTable.id,
          nama: employeesTable.nama,
          nip: employeesTable.nip,
          timestamp: attendanceTable.timestamp,
          status: attendanceTable.status,
          verified_status: attendanceTable.verified_status,
          photo: attendanceTable.photo,
          employeePhoto: employeesTable.foto,
        })
        .from(attendanceTable)
        .leftJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip))
        .where(whereClause)
        .orderBy(desc(attendanceTable.timestamp))
        .limit(limit)
        .offset(offset),
      
      // Get total count
      db
        .select({ count: count() })
        .from(attendanceTable)
        .leftJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip))
        .where(whereClause)
    ]);

    const totalRecords = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      records: attendanceRecords.map((record) => ({
        id: String(record.id) || '',
        nama: record.nama || '',
        nip: record.nip || '',
        timestamp: record.timestamp || 0,
        status: record.status || '',
        verified_status: record.verified_status || 'pending',
        photo: record.photo ? `data:image/jpeg;base64,${Buffer.from(record.photo as ArrayBuffer).toString('base64')}` : null,
        employeePhoto: record.employeePhoto ? `data:image/jpeg;base64,${Buffer.from(record.employeePhoto as ArrayBuffer).toString('base64')}` : null,
      })),
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

    return { success: true };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { success: false, error: 'Failed to update verification status' };
  }
}

export async function getAttendanceStats() {
  try {
    const [totalResult, approvedResult, pendingResult, rejectedResult] = await Promise.all([
      db.select({ count: count() }).from(attendanceTable),
      db.select({ count: count() }).from(attendanceTable).where(eq(attendanceTable.verified_status, 'approved')),
      db.select({ count: count() }).from(attendanceTable).where(eq(attendanceTable.verified_status, 'pending')),
      db.select({ count: count() }).from(attendanceTable).where(eq(attendanceTable.verified_status, 'rejected')),
    ]);

    return {
      total: totalResult[0]?.count || 0,
      approved: approvedResult[0]?.count || 0,
      pending: pendingResult[0]?.count || 0,
      rejected: rejectedResult[0]?.count || 0,
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return { total: 0, approved: 0, pending: 0, rejected: 0 };
  }
}

export async function getDatesWithPendingRequests(): Promise<string[]> {
  try {
    const records = await db
      .select({
        timestamp: attendanceTable.timestamp,
      })
      .from(attendanceTable)
      .where(eq(attendanceTable.verified_status, 'pending'));

    const dates = records.map((record) => {
      const date = new Date(record.timestamp);
      return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    });

    return [...new Set(dates)]; // Remove duplicates
  } catch (error) {
    console.error('Error fetching dates with pending requests:', error);
    return [];
  }
}

export async function getDatesWithAttendanceRecords(): Promise<string[]> {
  try {
    const records = await db
      .select({
        timestamp: attendanceTable.timestamp,
      })
      .from(attendanceTable);

    const dates = records.map((record) => {
      const date = new Date(record.timestamp);
      return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    });

    return [...new Set(dates)]; // Remove duplicates
  } catch (error) {
    console.error('Error fetching dates with attendance records:', error);
    return [];
  }
}
