CREATE TABLE `student_tickets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `attachment1` VARCHAR(255) NULL,
    `attachment2` VARCHAR(255) NULL,
    `attachment3` VARCHAR(255) NULL,
    `attachment4` VARCHAR(255) NULL,
    `attachment5` VARCHAR(255) NULL,
    `assigned_to` VARCHAR(255) NULL,
    `assigned_by` BIGINT NULL,
    `forwarded_to` BIGINT NULL,
    `status` VARCHAR(255) NOT NULL DEFAULT 'Open',
    `replied_comment` TEXT NULL,
    `replied_by` BIGINT NULL,
    `closed_by` BIGINT NULL,
    `closed_on` DATETIME(3) NULL,
    `replied_on` DATETIME(3) NULL,
    `reply_attachment1` VARCHAR(255) NULL,
    `reply_attachment2` VARCHAR(255) NULL,
    `reply_attachment3` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `student_tickets_student_created_idx`(`student_id`, `created_at`, `id`),
    INDEX `student_tickets_forwarded_to_idx`(`forwarded_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `student_tickets` ADD CONSTRAINT `student_tickets_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `student_tickets` ADD CONSTRAINT `student_tickets_forwarded_to_fkey` FOREIGN KEY (`forwarded_to`) REFERENCES `institution_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
