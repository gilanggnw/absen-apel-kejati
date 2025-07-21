'use server';

import { db } from '../../db';
import { employeesTable } from '../../db/schema';

export type DatabaseEmployee = {
  id: number;
  nama: string;
  nip: string;
  jabatan: string | null;
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