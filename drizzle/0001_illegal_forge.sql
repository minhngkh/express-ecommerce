CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`type` text NOT NULL,
	`brand` text NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `laptops` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text,
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
	PRIMARY KEY(`product_id`, `user_id`)
);
