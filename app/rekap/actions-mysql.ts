'use server';

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eq, desc, and, gte, lte, count } from 'drizzle-orm';
import {
  employeesTable,
  attendanceTable 
} from '../../db/schema-mysql';

// Direct MySQL connection for rekap actions
const connection = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'absen_apel_kejati',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
  
  console.log('🔍 Rekap date range calculation (SIMPLIFIED):');
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

      console.log('🔎 Rekap MySQL query filtering with UTC range:', start, 'to', end);

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
    console.error('Error fetching attendance records for rekap from MySQL:', error);
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
    console.error('Error fetching rekap stats from MySQL:', error);
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
      console.log('📅 Rekap MySQL Timestamp:', record.timestamp, '→ GMT+7 Date:', dateString);
      return dateString;
    });

    // Remove duplicates and return unique dates
    return [...new Set(datesWithRecords)];
  } catch (error) {
    console.error('Error fetching dates with attendance records from MySQL:', error);
    return [];
  }
}
