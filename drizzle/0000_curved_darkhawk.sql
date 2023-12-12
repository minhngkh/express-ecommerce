CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`full_name` text,
	`avatar` text,
	`created_at` text DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`category` text NOT NULL,
	`brand` text NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laptop_products` (
	`id` integer PRIMARY KEY NOT NULL,
	`subcategory` text,
	`cpu` text,
	`resolution` text,
	`ram` text,
	`storage` text,
	FOREIGN KEY (`id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_reviews` (
	`product_id` integer,
	`user_id` integer,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` text DEFAULT current_timestamp,
	PRIMARY KEY(`product_id`, `user_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `temp_product_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`date` text DEFAULT current_date,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);