CREATE TABLE `attendance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nip` integer,
	`timestamp` integer NOT NULL,
	`photo_url` text,
	`status` text NOT NULL,
	`verified_by` integer,
	FOREIGN KEY (`nip`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nip` text NOT NULL,
	`nama` text NOT NULL,
	`jabatan` text,
	`pangkat` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employees_nip_unique` ON `employees` (`nip`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
DROP TABLE `todos`;