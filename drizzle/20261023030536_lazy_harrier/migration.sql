CREATE TABLE `user` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`emailVerified` integer DEFAULT 0 NOT NULL,
	`image` text,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text,
	`banned` integer DEFAULT 0,
	`banReason` text,
	`banExpires` integer
);
--> statement-breakpoint
CREATE TABLE `styles` (
	`id` text PRIMARY KEY,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`prompt_template` text NOT NULL,
	`details_hint` text NOT NULL,
	`requires_celebrity` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL UNIQUE,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	`impersonatedBy` text,
	CONSTRAINT `fk_session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updatedAt` integer NOT NULL,
	CONSTRAINT `fk_account_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `generations` (
	`id` text PRIMARY KEY,
	`style_id` text NOT NULL,
	`user_id` text,
	`prompt_used` text NOT NULL,
	`extra_details` text DEFAULT '' NOT NULL,
	`celebrity_name` text,
	`quality` text NOT NULL,
	`model` text NOT NULL,
	`output_file` text NOT NULL,
	`thumb_file` text NOT NULL,
	`person_file` text,
	`celebrity_file` text,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`bytes` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_generations_style_id_styles_id_fk` FOREIGN KEY (`style_id`) REFERENCES `styles`(`id`),
	CONSTRAINT `fk_generations_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`userId`);
--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`userId`);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);
