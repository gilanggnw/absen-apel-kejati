'use server';

import { db } from '@/db';
import { attendanceTable, employeesTable } from '@/db/schema';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';

export interface RekapAttendanceRecord {
  id: number;
  nip: string;
  nama: string;
  timestamp: number;
  status: string;
}

export interface RekapStats {
  total: number;
  present: number;
  absent: number;
  onTime: number;
  late: number;
}

export async function getAttendanceForRekap(selectedDate?: Date): Promise<RekapAttendanceRecord[]> {
  try {
    // Build base query
    const baseQuery = db
      .select({
        id: attendanceTable.id,
        nip: attendanceTable.nip,
        nama: employeesTable.nama,
        timestamp: attendanceTable.timestamp,
        status: attendanceTable.status,
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
    }));
  } catch (error) {
    console.error('Error fetching attendance records for rekap:', error);
    return [];
  }
}

export async function getRekapStats(selectedDate?: Date): Promise<RekapStats> {
  try {
    // Get total employees count
    const [totalEmployeesResult] = await db
      .select({ count: count() })
      .from(employeesTable);
    
    const totalEmployees = totalEmployeesResult?.count || 0;

    // Get attendance records based on date filter
    let attendanceRecords;
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      attendanceRecords = await db
        .select({
          status: attendanceTable.status,
        })
        .from(attendanceTable)
        .where(
          and(
            gte(attendanceTable.timestamp, startOfDay.getTime()),
            lte(attendanceTable.timestamp, endOfDay.getTime())
          )
        );
    } else {
      attendanceRecords = await db
        .select({
          status: attendanceTable.status,
        })
        .from(attendanceTable);
    }

    const present = attendanceRecords.length;
    const absent = totalEmployees - present;
    const onTime = attendanceRecords.filter(r => 
      r.status?.toLowerCase().includes('tepat waktu') || 
      (!r.status?.toLowerCase().includes('telat') && !r.status?.toLowerCase().includes('terlambat'))
    ).length;
    const late = attendanceRecords.filter(r => 
      r.status?.toLowerCase().includes('telat') || 
      r.status?.toLowerCase().includes('terlambat')
    ).length;

    return {
      total: totalEmployees,
      present,
      absent,
      onTime,
      late,
    };
  } catch (error) {
    console.error('Error fetching rekap stats:', error);
    return {
      total: 0,
      present: 0,
      absent: 0,
      onTime: 0,
      late: 0,
    };
  }
}

export async function getDatesWithAttendanceRecordsForRekap(): Promise<string[]> {
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
