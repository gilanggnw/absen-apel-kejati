'use server';

import { db } from '@/db';
import { attendanceTable, employeesTable } from '@/db/schema';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';

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
      // Convert selected date to GMT+7 timestamp range
      const { start, end } = gmt7DateToUTCRange(selectedDate);

      const dateFilter = and(
        gte(attendanceTable.timestamp, start),
        lte(attendanceTable.timestamp, end)
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
      // Convert selected date to GMT+7 timestamp range  
      const { start, end } = gmt7DateToUTCRange(selectedDate);

      attendanceRecords = await db
        .select({
          status: attendanceTable.status,
        })
        .from(attendanceTable)
        .where(
          and(
            gte(attendanceTable.timestamp, start),
            lte(attendanceTable.timestamp, end)
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

    // Convert timestamps to date strings in GMT+7 timezone
    const datesWithRecords = records.map(record => {
      const dateString = timestampToGMT7DateString(record.timestamp);
      console.log('📅 Rekap Timestamp:', record.timestamp, '→ GMT+7 Date:', dateString);
      return dateString;
    });

    // Remove duplicates and return unique dates
    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('Error fetching dates with attendance records:', error);
    return [];
  }
}
