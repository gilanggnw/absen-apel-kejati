'use server';

import { db } from '../../db';
import { employeesTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

export type DatabaseEmployee = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string | null;
  pangkat: string | null;
  foto: string | null; // Changed from unknown to string (base64)
};

export async function getEmployees(): Promise<DatabaseEmployee[]> {
  try {
    const employees = await db.select().from(employeesTable);
    // Convert binary foto to base64 string
    return employees.map(employee => ({
      ...employee,
      foto: employee.foto ? `data:image/jpeg;base64,${Buffer.from(employee.foto as Uint8Array).toString('base64')}` : null
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
        foto: employees[0].foto ? `data:image/jpeg;base64,${Buffer.from(employees[0].foto as Uint8Array).toString('base64')}` : null
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
      foto?: Buffer | null;
    } = {
      nama: data.nama,
      jabatan: data.jabatan || null,
      pangkat: data.pangkat || null,
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