'use server';

import { db } from '@/db';
import { attendanceTable, employeesTable } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export interface AttendanceRecord {
  id: number;
  nip: string;
  nama: string;
  timestamp: number;
  status: string;
  verified_status: string;
  verified_by: string | null;
  photo: string | null; // Change to base64 string
  employeePhoto: string | null; // Add employee photo
}

export async function getAttendanceForVerification(selectedDate?: Date): Promise<AttendanceRecord[]> {
  try {
    // Build base query
    const baseQuery = db
      .select({
        id: attendanceTable.id,
        nip: attendanceTable.nip,
        nama: employeesTable.nama,
        timestamp: attendanceTable.timestamp,
        status: attendanceTable.status,
        verified_status: attendanceTable.verified_status,
        verified_by: attendanceTable.verified_by,
        photo: attendanceTable.photo,
        employeePhoto: employeesTable.foto, // Add employee photo
      })
      .from(attendanceTable)
      .innerJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip));

    // Execute query with or without date filter
    let records;
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      records = await baseQuery
        .where(
          and(
            gte(attendanceTable.timestamp, startOfDay.getTime()),
            lte(attendanceTable.timestamp, endOfDay.getTime())
          )
        )
        .orderBy(desc(attendanceTable.timestamp));
    } else {
      records = await baseQuery.orderBy(desc(attendanceTable.timestamp));
    }

    return records.map(record => ({
      ...record,
      nip: record.nip || '',
      nama: record.nama || '',
      status: record.status || '',
      verified_status: record.verified_status || 'pending',
      photo: record.photo ? `data:image/jpeg;base64,${Buffer.from(record.photo as string).toString('base64')}` : null,
      employeePhoto: record.employeePhoto ? `data:image/jpeg;base64,${Buffer.from(record.employeePhoto as Uint8Array).toString('base64')}` : null,
    }));
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return [];
  }
}

export async function updateVerificationStatus(
  attendanceId: number,
  verifiedStatus: 'approved' | 'rejected',
  verifiedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(attendanceTable)
      .set({
        verified_status: verifiedStatus,
        verified_by: verifiedBy,
      })
      .where(eq(attendanceTable.id, attendanceId));

    return { success: true };
  } catch (error) {
    console.error('Error updating verification status:', error);
    return { success: false, error: 'Failed to update verification status' };
  }
}

export async function getAttendanceStats() {
  try {
    const records = await db
      .select({
        verified_status: attendanceTable.verified_status,
      })
      .from(attendanceTable);

    const total = records.length;
    const approved = records.filter(r => r.verified_status === 'approved').length;
    const pending = records.filter(r => r.verified_status === 'pending').length;
    const rejected = records.filter(r => r.verified_status === 'rejected').length;

    return {
      total,
      approved,
      pending,
      rejected,
    };
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
    };
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

    // Convert timestamps to date strings (YYYY-MM-DD format) considering local timezone
    const datesWithPending = records.map(record => {
      const date = new Date(record.timestamp);
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    // Remove duplicates and return unique dates
    return [...new Set(datesWithPending)];
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

    // Convert timestamps to date strings (YYYY-MM-DD format) considering local timezone
    const datesWithRecords = records.map(record => {
      const date = new Date(record.timestamp);
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    });

    // Remove duplicates and return unique dates
    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('Error fetching dates with attendance records:', error);
    return [];
  }
}
