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
  foto: unknown;
};

export async function getEmployees(): Promise<DatabaseEmployee[]> {
  try {
    const employees = await db.select().from(employeesTable);
    return employees;
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return [];
  }
}

export async function getEmployeeById(id: number): Promise<DatabaseEmployee | null> {
  try {
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
    return employees[0] || null;
  } catch (error) {
    console.error('Failed to fetch employee:', error);
    return null;
  }
}