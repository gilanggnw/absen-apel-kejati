'use server';

import { db, employeesTable, attendanceTable } from '../../db/switch';
import { eq, sql, and, gte, lte, SQL } from 'drizzle-orm';

export type DatabaseEmployee = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string | null;
  pangkat: string | null;
  foto: string | null; // Changed from unknown to string (base64)
  status: string; // Add status field
};

export async function getEmployees(): Promise<DatabaseEmployee[]> {
  try {
    const employees = await db.select().from(employeesTable);
    // Convert binary foto to base64 string
    return employees.map(employee => ({
      ...employee,
      foto: employee.foto ? `data:image/jpeg;base64,${Buffer.from(employee.foto as Uint8Array).toString('base64')}` : null,
      status: employee.status || 'aktif' // Ensure status has a default value
    }));
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
}

export async function getEmployeeById(id: number): Promise<DatabaseEmployee | null> {
  try {
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
    if (employees[0]) {
      return {
        ...employees[0],
        foto: employees[0].foto ? `data:image/jpeg;base64,${Buffer.from(employees[0].foto as Uint8Array).toString('base64')}` : null,
        status: employees[0].status || 'aktif' // Ensure status has a default value
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return null;
  }
}

export type UpdateEmployeeData = {
  nama: string;
  jabatan?: string;
  pangkat?: string;
  foto?: string | null; // base64 string or null
  status?: string; // Add status field
};

export async function updateEmployee(id: number, data: UpdateEmployeeData): Promise<boolean> {
  try {
    console.log('🔄 Starting updateEmployee function with data:', {
      id,
      nama: data.nama,
      jabatan: data.jabatan,
      pangkat: data.pangkat,
      hasPhoto: !!data.foto,
      photoSize: data.foto ? data.foto.length : 0
    });

    const updateData: {
      nama: string;
      jabatan: string | null;
      pangkat: string | null;
      status: string;
      foto?: Buffer | null;
    } = {
      nama: data.nama,
      jabatan: data.jabatan || null,
      pangkat: data.pangkat || null,
      status: data.status || 'aktif',
    };

    // Only update photo if it's explicitly provided (including null for deletion)
    if (data.foto !== undefined) {
      if (data.foto === null) {
        updateData.foto = null;
        console.log('📷 Photo deleted');
      } else if (typeof data.foto === 'string') {
        // Convert base64 string to Buffer
        const base64Data = data.foto.split(',')[1] || data.foto; // Remove data:image/...;base64, prefix if present
        updateData.foto = Buffer.from(base64Data, 'base64');
        console.log('📷 Photo updated:', `Buffer(${updateData.foto.length} bytes)`);
      }
    }

    console.log('💾 Updating database with:', {
      ...updateData,
      foto: updateData.foto ? `Buffer(${updateData.foto.length} bytes)` : updateData.foto
    });

    await db.update(employeesTable)
      .set(updateData)
      .where(eq(employeesTable.id, id));
    
    console.log('✅ Employee updated successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to update employee:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      id,
      data
    });
    return false;
  }
}

export async function deleteEmployeePhoto(id: number): Promise<boolean> {
  try {
    console.log('🗑️ Deleting photo for employee ID:', id);
    
    await db.update(employeesTable)
      .set({ foto: null })
      .where(eq(employeesTable.id, id));
    
    console.log('✅ Photo deleted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete photo:', error);
    return false;
  }
}

export async function deleteEmployee(id: number): Promise<boolean> {
  try {
    console.log('🗑️ Deleting employee with ID:', id);
    
    await db.delete(employeesTable).where(eq(employeesTable.id, id));
    
    console.log('✅ Employee deleted successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to delete employee:', error);
    return false;
  }
}

export async function addEmployee(data: {
  nama: string;
  nip: string;
  jabatan?: string;
  pangkat?: string;
  foto?: string; // Base64 string instead of File
}): Promise<boolean> {
  try {
    console.log('🚀 Starting addEmployee function with data:', {
      nama: data.nama,
      nip: data.nip,
      jabatan: data.jabatan,
      pangkat: data.pangkat,
      hasPhoto: !!data.foto,
      photoLength: data.foto?.length
    });

    let fotoBuffer = null;
    if (data.foto) {
      console.log('📷 Processing photo...');
      // Convert base64 to buffer
      const base64Data = data.foto.split(',')[1]; // Remove data:image/...;base64, prefix
      fotoBuffer = Buffer.from(base64Data, 'base64');
      console.log('✅ Photo converted to buffer, size:', fotoBuffer.length, 'bytes');
    } else {
      console.log('ℹ️ No photo provided');
    }

    const insertData = {
      nama: data.nama,
      nip: data.nip,
      jabatan: data.jabatan || null,
      pangkat: data.pangkat || null,
      foto: fotoBuffer,
    };

    console.log('💾 Inserting data to database:', {
      ...insertData,
      foto: fotoBuffer ? `Buffer(${fotoBuffer.length} bytes)` : null
    });

    const result = await db.insert(employeesTable).values(insertData);
    
    console.log('✅ Database insertion successful:', result);
    console.log('🎉 Employee added successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to add employee:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: data
    });
    return false;
  }
}

export async function searchEmployees(searchTerm: string): Promise<DatabaseEmployee[]> {
  try {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      return [];
    }

    const cleanTerm = searchTerm.trim().toLowerCase();
    
    const employees = await db
      .select({
        id: employeesTable.id,
        nama: employeesTable.nama,
        nip: employeesTable.nip,
        jabatan: employeesTable.jabatan,
        pangkat: employeesTable.pangkat,
        foto: employeesTable.foto,
        status: employeesTable.status
      })
      .from(employeesTable)
      .where(
        // Optimized search: exact NIP match first, then name contains
        sql`${employeesTable.nip} LIKE ${cleanTerm + '%'} OR LOWER(${employeesTable.nama}) LIKE ${'%' + cleanTerm + '%'}`
      )
      .orderBy(
        // Prioritize exact NIP matches, then exact name matches, then partial matches
        sql`CASE 
          WHEN ${employeesTable.nip} = ${cleanTerm} THEN 1
          WHEN ${employeesTable.nip} LIKE ${cleanTerm + '%'} THEN 2
          WHEN LOWER(${employeesTable.nama}) LIKE ${cleanTerm + '%'} THEN 3
          ELSE 4
        END`
      )
      .limit(8); // Reduced limit for faster results

    // Convert binary foto to base64 string
    return employees.map(employee => ({
      ...employee,
      foto: employee.foto ? `data:image/jpeg;base64,${Buffer.from(employee.foto as Uint8Array).toString('base64')}` : null,
      status: employee.status || 'aktif'
    }));
  } catch (error) {
    console.error('Failed to search employees:', error);
    return [];
  }
}

// Attendance related functions
export type AttendanceData = {
  nip: string;
  photo: string; // base64 string
  status: string;
  verified_by?: string;
};

export type AttendanceRecord = {
  id: number;
  nip: string | null;
  timestamp: number;
  photo: unknown;
  status: string;
  verified_by: string | null;
};

export async function saveAttendance(data: AttendanceData): Promise<boolean> {
  try {
    console.log('🚀 Starting saveAttendance function with data:', {
      nip: data.nip,
      status: data.status,
      verified_by: data.verified_by,
      hasPhoto: !!data.photo,
      photoLength: data.photo?.length
    });

    // Convert base64 photo to buffer
    let photoBuffer = null;
    if (data.photo) {
      console.log('📷 Processing photo...');
      // Remove data:image/...;base64, prefix if present
      const base64Data = data.photo.includes(',') ? data.photo.split(',')[1] : data.photo;
      photoBuffer = Buffer.from(base64Data, 'base64');
      console.log('✅ Photo converted to buffer, size:', photoBuffer.length, 'bytes');
    }

    const insertData = {
      nip: data.nip,
      timestamp: Date.now(), // Current timestamp in milliseconds
      photo: photoBuffer,
      status: data.status,
      verified_by: data.verified_by || null,
    };

    console.log('💾 Inserting attendance data to database:', {
      ...insertData,
      photo: photoBuffer ? `Buffer(${photoBuffer.length} bytes)` : null
    });

    const result = await db.insert(attendanceTable).values(insertData);
    
    console.log('✅ Database insertion successful:', result);
    console.log('🎉 Attendance record saved successfully!');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to save attendance:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      data: {
        ...data,
        photo: data.photo ? `[${data.photo.length} chars]` : null
      }
    });
    return false;
  }
}

export type AttendanceHistoryRecord = {
  id: number;
  timestamp: number;
  status: string;
  verified_status: string;
  verified_by: string | null;
  photo: string | null; // Base64 string
  date: string; // Formatted date string
  time: string; // Formatted time string
};

export async function getAttendanceHistoryByNip(nip: string, startDate?: Date, endDate?: Date): Promise<AttendanceHistoryRecord[]> {
  try {
    console.log('📅 Fetching attendance history for NIP:', nip);
    
    // Build the query with all conditions
    let whereConditions: SQL | undefined = eq(attendanceTable.nip, nip);

    // Apply date filtering if provided
    if (startDate && endDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereConditions = and(
        whereConditions,
        gte(attendanceTable.timestamp, startOfDay.getTime()),
        lte(attendanceTable.timestamp, endOfDay.getTime())
      );
    }

    const records = await db
      .select()
      .from(attendanceTable)
      .where(whereConditions)
      .orderBy(sql`${attendanceTable.timestamp} DESC`);

    // Format the records for display
    return records.map(record => {
      const date = new Date(record.timestamp);
      return {
        id: record.id,
        timestamp: record.timestamp,
        status: record.status,
        verified_status: record.verified_status || 'pending',
        verified_by: record.verified_by,
        photo: record.photo ? `data:image/jpeg;base64,${Buffer.from(record.photo as Uint8Array).toString('base64')}` : null,
        date: date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      };
    });
  } catch (error) {
    console.error('❌ Failed to fetch attendance history:', error);
    return [];
  }
}

export async function getAttendanceByNip(nip: string, date?: Date): Promise<AttendanceRecord[]> {
  try {
    const startOfDay = date ? new Date(date).setHours(0, 0, 0, 0) : new Date().setHours(0, 0, 0, 0);
    const endOfDay = date ? new Date(date).setHours(23, 59, 59, 999) : new Date().setHours(23, 59, 59, 999);

    const records = await db
      .select()
      .from(attendanceTable)
      .where(
        // Filter by NIP and date range
        sql`${attendanceTable.nip} = ${nip} AND ${attendanceTable.timestamp} >= ${startOfDay} AND ${attendanceTable.timestamp} <= ${endOfDay}`
      );

    return records;
  } catch (error) {
    console.error('Failed to fetch attendance records:', error);
    return [];
  }
}

// ================================
// STORAGE MANAGEMENT FUNCTIONS
// ================================
// "Time Bomb" system for automated cleanup of old photos

export async function getAttendancePhotoStats(testMode = false) {
  try {
    // Get total records with photos
    const totalWithPhotos = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceTable)
      .where(sql`${attendanceTable.photo} IS NOT NULL AND ${attendanceTable.photo} != ''`);

    // Get old records with photos - use different time periods for testing
    const cutoffDate = new Date();
    if (testMode) {
      // Test mode: 1 day ago
      cutoffDate.setDate(cutoffDate.getDate() - 1);
    } else {
      // Production mode: 3 months ago
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
    }
    const cutoffTimestamp = cutoffDate.getTime();
    
    const oldWithPhotos = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceTable)
      .where(sql`${attendanceTable.photo} IS NOT NULL AND ${attendanceTable.photo} != '' AND ${attendanceTable.timestamp} < ${cutoffTimestamp}`);

    // Estimate storage size (rough calculation)
    const avgPhotoSizeKB = 750; // Average photo size in KB
    const totalStorageKB = (totalWithPhotos[0]?.count || 0) * avgPhotoSizeKB;
    const oldStorageKB = (oldWithPhotos[0]?.count || 0) * avgPhotoSizeKB;

    const timeLabel = testMode ? '1 hari' : '3 bulan';

    return {
      totalRecordsWithPhotos: totalWithPhotos[0]?.count || 0,
      oldRecordsWithPhotos: oldWithPhotos[0]?.count || 0,
      totalStorageKB,
      oldStorageKB,
      potentialSavingsKB: oldStorageKB,
      cutoffDate: cutoffDate.toLocaleDateString('id-ID'),
      testMode,
      timeLabel
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    throw error;
  }
}

export async function cleanupOldAttendancePhotos(testMode = false) {
  try {
    // Calculate cutoff date - different for testing vs production
    const cutoffDate = new Date();
    if (testMode) {
      // Test mode: 1 day ago
      cutoffDate.setDate(cutoffDate.getDate() - 1);
    } else {
      // Production mode: 3 months ago
      cutoffDate.setMonth(cutoffDate.getMonth() - 3);
    }
    const cutoffTimestamp = cutoffDate.getTime();
    
    const timeLabel = testMode ? '1 hari' : '3 bulan';
    
    console.log('🕐 Starting storage cleanup...');
    console.log('📅 Cutoff date:', cutoffDate.toLocaleDateString('id-ID'));
    console.log('⚙️ Mode:', testMode ? 'TEST (1 week)' : 'PRODUCTION (3 months)');

    // Get count of records that will be affected
    const oldRecords = await db
      .select({ count: sql<number>`count(*)` })
      .from(attendanceTable)
      .where(sql`${attendanceTable.photo} IS NOT NULL AND ${attendanceTable.photo} != '' AND ${attendanceTable.timestamp} < ${cutoffTimestamp}`);

    const recordsToClean = oldRecords[0]?.count || 0;
    console.log('📊 Found', recordsToClean, 'old records with photos');

    if (recordsToClean === 0) {
      console.log('✅ No old photos to clean');
      return {
        success: true,
        recordsCleaned: 0,
        message: `Tidak ada foto lama (${timeLabel}) yang perlu dibersihkan`
      };
    }

    // Calculate estimated space savings
    const avgPhotoSizeKB = 750;
    const estimatedSavingsKB = recordsToClean * avgPhotoSizeKB;
    const estimatedSavingsMB = (estimatedSavingsKB / 1024).toFixed(2);
    
    console.log('💾 Estimated space to be saved:', estimatedSavingsMB, 'MB');

    // Update old records to remove photo blobs
    // This keeps the attendance record but removes the photo data
    await db
      .update(attendanceTable)
      .set({ photo: null })
      .where(sql`${attendanceTable.photo} IS NOT NULL AND ${attendanceTable.photo} != '' AND ${attendanceTable.timestamp} < ${cutoffTimestamp}`);

    console.log('🗑️ Successfully removed photos from', recordsToClean, 'records');
    console.log('💾 Estimated space saved:', estimatedSavingsMB, 'MB');
    console.log('✅ Storage cleanup completed successfully');

    return {
      success: true,
      recordsCleaned: recordsToClean,
      estimatedSavingsMB: parseFloat(estimatedSavingsMB),
      message: `Berhasil membersihkan ${recordsToClean.toLocaleString()} foto lama (${timeLabel}) dan menghemat sekitar ${estimatedSavingsMB} MB`
    };
  } catch (error) {
    console.error('❌ Storage cleanup failed:', error);
    throw error;
  }
}