import { mysqlTable, mysqlSchema, AnyMySqlColumn, foreignKey, primaryKey, varchar, int, bigint, longtext, unique, timestamp } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	userId: varchar({ length: 255 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	type: varchar({ length: 255 }).notNull(),
	provider: varchar({ length: 255 }).notNull(),
	providerAccountId: varchar({ length: 255 }).notNull(),
	refreshToken: varchar("refresh_token", { length: 255 }),
	accessToken: varchar("access_token", { length: 255 }),
	expiresAt: int("expires_at"),
	tokenType: varchar("token_type", { length: 255 }),
	scope: varchar({ length: 255 }),
	idToken: varchar("id_token", { length: 2048 }),
	sessionState: varchar("session_state", { length: 255 }),
},
(table) => [
	primaryKey({ columns: [table.provider, table.providerAccountId], name: "account_provider_providerAccountId"}),
]);

export const attendance = mysqlTable("attendance", {
	id: int().autoincrement().notNull(),
	nip: varchar({ length: 50 }).references(() => employees.nip),
	timestamp: bigint({ mode: "number" }).notNull(),
	photo: longtext(),
	status: varchar({ length: 100 }).notNull(),
	verifiedBy: varchar("verified_by", { length: 255 }).references(() => user.id),
	verifiedStatus: varchar("verified_status", { length: 50 }).default('pending').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "attendance_id"}),
]);

export const employees = mysqlTable("employees", {
	id: int().autoincrement().notNull(),
	nip: varchar({ length: 50 }).notNull(),
	nama: varchar({ length: 255 }).notNull(),
	foto: longtext(),
	jabatan: varchar({ length: 255 }),
	pangkat: varchar({ length: 255 }),
	status: varchar({ length: 50 }).default('aktif').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "employees_id"}),
	unique("employees_nip_unique").on(table.nip),
]);

export const session = mysqlTable("session", {
	sessionToken: varchar({ length: 255 }).notNull(),
	userId: varchar({ length: 255 }).notNull().references(() => user.id, { onDelete: "cascade" } ),
	expires: timestamp({ mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.sessionToken], name: "session_sessionToken"}),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	emailVerified: timestamp({ fsp: 3, mode: 'string' }),
	image: varchar({ length: 255 }),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('user').notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
]);

export const verificationToken = mysqlTable("verificationToken", {
	identifier: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.identifier, table.token], name: "verificationToken_identifier_token"}),
]);
