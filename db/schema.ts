import { not } from "drizzle-orm";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: text().notNull(),
});

export const employeesTable = sqliteTable("employees", {
  id: integer().primaryKey({ autoIncrement: true }),
  nip: text().notNull().unique(),
  nama: text().notNull(),
  foto: blob(),
  jabatan: text(),
  pangkat: text()
});

export const attendanceTable = sqliteTable("attendance", {
  id: integer().primaryKey({ autoIncrement: true }),
  nip: integer().references(() => employeesTable.id),
  timestamp: integer().notNull(),
  photo: blob(),
  status: text().notNull(),
  verified_by: integer().references(() => usersTable.id),
});