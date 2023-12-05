CREATE TABLE `temp_product_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`product_id` integer NOT NULL,
	`rating` integer NOT NULL,
	`comment` text,
	`date` text DEFAULT current_date,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
