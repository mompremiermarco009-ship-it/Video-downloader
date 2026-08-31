CREATE TABLE `downloadHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`url` text NOT NULL,
	`platform` varchar(50) NOT NULL,
	`videoTitle` text,
	`videoDuration` int,
	`thumbnail` text,
	`downloadedFormat` varchar(50),
	`downloadedAt` timestamp NOT NULL DEFAULT (now()),
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`fileSize` int,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `downloadHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `downloadHistory` ADD CONSTRAINT `downloadHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;