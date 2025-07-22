import { sqliteTable, text, integer, blob, primaryKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "@auth/core/adapters";

// NextAuth.js required tables
export const usersTable = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }), // Add but leave null
  image: text("image"), // Add but leave null
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const accountsTable = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessionsTable = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokensTable = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Your existing tables
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
  nip: text().references(() => employeesTable.nip),
  timestamp: integer().notNull(),
  photo: blob(),
  status: text().notNull(),
  verified_by: text().references(() => usersTable.id),
  verified_status: text().notNull().default("pending"),
});