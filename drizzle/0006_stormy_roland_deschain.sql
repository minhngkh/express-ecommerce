DROP INDEX IF EXISTS `users_username_unique`;--> statement-breakpoint
ALTER TABLE users ADD `avatar` text;--> statement-breakpoint
ALTER TABLE users ADD `registration_time` text DEFAULT current_timestamp;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `username`;