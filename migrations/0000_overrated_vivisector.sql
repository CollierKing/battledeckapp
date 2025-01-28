CREATE TABLE `decks` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`hero_image_url` text,
	`ai_prompt` text,
	`wf_status` text,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `slides` (
	`id` text PRIMARY KEY NOT NULL,
	`deck_id` text NOT NULL,
	`deck_order` integer NOT NULL,
	`caption` text,
	`image_url` text,
	`wf_status` text,
	`createdAt` integer,
	`updatedAt` integer
);
