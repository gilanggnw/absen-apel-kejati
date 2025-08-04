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

export async function getAttendanceForRekap(
  selectedDate?: Date, 
  page: number = 1, 
  limit: number = 10
): Promise<{ records: RekapAttendanceRecord[], total: number }> {
  try {
    const offset = (page - 1) * limit;

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

    // Build count query
    const countQuery = db
      .select({ count: count() })
      .from(attendanceTable)
      .innerJoin(employeesTable, eq(attendanceTable.nip, employeesTable.nip));

    // Execute queries with or without date filter
    let records, totalResult;
    if (selectedDate) {
      // Use UTC to avoid timezone issues between localhost and Vercel
      const startOfDay = new Date(selectedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const dateFilter = and(
        gte(attendanceTable.timestamp, startOfDay.getTime()),
        lte(attendanceTable.timestamp, endOfDay.getTime())
      );

      [records, totalResult] = await Promise.all([
        baseQuery
          .where(dateFilter)
          .orderBy(desc(attendanceTable.timestamp))
          .limit(limit)
          .offset(offset),
        countQuery.where(dateFilter)
      ]);
    } else {
      [records, totalResult] = await Promise.all([
        baseQuery
          .orderBy(desc(attendanceTable.timestamp))
          .limit(limit)
          .offset(offset),
        countQuery
      ]);
    }

    const total = totalResult[0]?.count || 0;

    return {
      records: records.map(record => ({
        ...record,
        nip: record.nip || '',
        nama: record.nama || '',
        status: record.status || '',
      })),
      total
    };
  } catch (error) {
    console.error('Error fetching attendance records for rekap:', error);
    return { records: [], total: 0 };
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
      // Use UTC to avoid timezone issues between localhost and Vercel
      const startOfDay = new Date(selectedDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

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

    // Convert timestamps to date strings (YYYY-MM-DD format)
    // Since Date.now() stores local time as UTC milliseconds, use local methods for consistency
    const datesWithRecords = records.map(record => {
      const date = new Date(record.timestamp);
      // Use local methods to match how the data was originally stored
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      console.log('📅 Rekap Timestamp:', record.timestamp, '→ Date:', dateString);
      return dateString;
    });

    // Remove duplicates and return unique dates
    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('Error fetching dates with attendance records:', error);
    return [];
  }
}
