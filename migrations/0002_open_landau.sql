ALTER TABLE `attendance` RENAME COLUMN "photo_url" TO "photo";--> statement-breakpoint
DROP INDEX "employees_nip_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE `attendance` ALTER COLUMN "photo" TO "photo" blob;--> statement-breakpoint
CREATE UNIQUE INDEX `employees_nip_unique` ON `employees` (`nip`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `employees` ADD `foto` blob;