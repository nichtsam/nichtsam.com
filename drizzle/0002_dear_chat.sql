ALTER TABLE `user_image` ADD `object_key` text DEFAULT 'migration_needed' NOT NULL;--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `session` (`user_id`);