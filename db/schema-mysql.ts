import { mysqlTable, varchar, int, longtext, timestamp, primaryKey, bigint } from "drizzle-orm/mysql-core";
import type { AdapterAccount } from "@auth/core/adapters";

// NextAuth.js required tables
export const usersTable = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date", fsp: 3 }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("user"),
});

export const accountsTable = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 2048 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessionsTable = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokensTable = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// Your existing tables adapted for MySQL
export const employeesTable = mysqlTable("employees", {
  id: int("id").primaryKey().autoincrement(),
  nip: varchar("nip", { length: 50 }).notNull().unique(),
  nama: varchar("nama", { length: 255 }).notNull(),
  foto: longtext("foto"),
  jabatan: varchar("jabatan", { length: 255 }),
  pangkat: varchar("pangkat", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("aktif")
});

export const attendanceTable = mysqlTable("attendance", {
  id: int("id").primaryKey().autoincrement(),
  nip: varchar("nip", { length: 50 }).references(() => employeesTable.nip),
  timestamp: bigint("timestamp", { mode: "number" }).notNull(),
  photo: longtext("photo"),
  status: varchar("status", { length: 100 }).notNull(),
  verified_by: varchar("verified_by", { length: 255 }).references(() => usersTable.id),
  verified_status: varchar("verified_status", { length: 50 }).notNull().default("pending"),
});
