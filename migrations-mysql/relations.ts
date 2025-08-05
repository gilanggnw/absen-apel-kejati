import { relations } from "drizzle-orm/relations";
import { user, account, employees, attendance, session } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	attendances: many(attendance),
	sessions: many(session),
}));

export const attendanceRelations = relations(attendance, ({one}) => ({
	employee: one(employees, {
		fields: [attendance.nip],
		references: [employees.nip]
	}),
	user: one(user, {
		fields: [attendance.verifiedBy],
		references: [user.id]
	}),
}));

export const employeesRelations = relations(employees, ({many}) => ({
	attendances: many(attendance),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));