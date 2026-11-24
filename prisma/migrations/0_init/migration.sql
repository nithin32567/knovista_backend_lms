-- CreateTable
CREATE TABLE `students` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `date_of_birth` DATE NULL,
    `mobile_no` VARCHAR(15) NOT NULL,
    `alternate_mobile_no` VARCHAR(15) NULL,
    `parent_mobile_no` VARCHAR(15) NULL,
    `parent_name` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `location` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `state` VARCHAR(50) NULL,
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_pic` VARCHAR(150) NULL,
    `cv_file_path` VARCHAR(255) NULL,
    `qualification` VARCHAR(100) NULL,
    `last_login_on` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Pending',
    `forgot_pass_token` VARCHAR(255) NULL,
    `forgot_pass_expiry` DATETIME(3) NULL,
    `forgot_pass_token_expiry` DATETIME(3) NULL,
    `login_token` VARCHAR(255) NULL,
    `login_status` VARCHAR(191) NOT NULL DEFAULT 'inactive',
    `login_status_updated_at` DATETIME(3) NULL,
    `sales_person_name` VARCHAR(150) NULL,
    `sales_person_phone` VARCHAR(20) NULL,
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `special_category_id` BIGINT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `students_email_key`(`email`),
    UNIQUE INDEX `students_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institution_roles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(100) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `guard` VARCHAR(30) NOT NULL DEFAULT 'student',
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_key`(`token`),
    INDEX `password_reset_tokens_email_guard_idx`(`email`, `guard`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `programs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sections` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `program_id` BIGINT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `duration_in_months` INTEGER NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `section_id` BIGINT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topics` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `module_id` BIGINT NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(30) NOT NULL DEFAULT 'video',
    `content_url` VARCHAR(500) NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_files` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `topic_id` BIGINT NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_path` VARCHAR(500) NOT NULL,
    `file_type` VARCHAR(50) NULL,
    `created_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `topic_assessments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `topic_id` BIGINT NOT NULL,
    `question` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `answer` JSON NULL,
    `correct_answer` VARCHAR(10) NULL,
    `marks` INTEGER NOT NULL DEFAULT 1,
    `priority` INTEGER NULL DEFAULT 1,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_topic_assessment_answers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `student_topic_id` BIGINT NOT NULL,
    `topic_id` BIGINT NOT NULL,
    `topic_assessment_id` BIGINT NOT NULL,
    `answer` TEXT NULL,
    `marks` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `special_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_section_batches` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `section_id` BIGINT NOT NULL,
    `batch_name` VARCHAR(150) NOT NULL,
    `tutor_id` BIGINT NULL,
    `qa_id` BIGINT NULL,
    `placement_officer_id` BIGINT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_sections` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `batch_id` BIGINT NOT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Active',
    `progress_percent` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `self_placed` VARCHAR(10) NULL,
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `student_sections_student_id_batch_id_key`(`student_id`, `batch_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_section_modules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NULL,
    `student_section_id` BIGINT NOT NULL,
    `module_id` BIGINT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Locked',
    `unlock_requested` BOOLEAN NOT NULL DEFAULT false,
    `unlock_requested_by` BIGINT NULL,
    `unlock_requested_at` DATETIME(3) NULL,
    `unlocked_by` BIGINT NULL,
    `unlocked_at` DATETIME(3) NULL,
    `marks_scored` INTEGER NULL,
    `total_marks` INTEGER NULL,
    `percentage` DECIMAL(5, 2) NULL,
    `remarks` TEXT NULL,
    `evaluated_by` BIGINT NULL,
    `evaluated_at` DATETIME(3) NULL,
    `performance` VARCHAR(30) NULL,
    `performance_description` TEXT NULL,
    `performance_created_by` BIGINT NULL,
    `performance_created_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `student_section_modules_student_section_id_module_id_key`(`student_section_id`, `module_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_section_module_topics` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `student_section_module_id` BIGINT NOT NULL,
    `topic_id` BIGINT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'new',
    `created_by` BIGINT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `topic_started_by` BIGINT NULL,
    `topic_started_at` DATETIME(3) NULL,
    `topic_last_accessed_at` DATETIME(3) NULL,
    `topic_completed_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `program_extensions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_section_id` BIGINT NOT NULL,
    `requested_by` BIGINT NOT NULL,
    `reason` TEXT NOT NULL,
    `extension_months` INTEGER NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'Pending',
    `reviewed_by` BIGINT NULL,
    `reviewed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `institution_users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `date_of_birth` DATE NULL,
    `mobile_no` VARCHAR(15) NULL,
    `address` TEXT NULL,
    `location` VARCHAR(100) NULL,
    `pincode` VARCHAR(10) NULL,
    `state` VARCHAR(50) NULL,
    `email` VARCHAR(100) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `profile_pic` VARCHAR(150) NULL,
    `qualification` VARCHAR(100) NULL,
    `last_login_on` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `forgot_pass_token` VARCHAR(255) NULL,
    `forgot_pass_token_expiry` DATETIME(3) NULL,
    `created_by` BIGINT NOT NULL,
    `updated_by` BIGINT NOT NULL,
    `created_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NULL,

    UNIQUE INDEX `institution_users_email_key`(`email`),
    UNIQUE INDEX `institution_users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_notifications` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'new',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_collections` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `student_section_id` BIGINT NULL,
    `installment_no` INTEGER NOT NULL,
    `fee_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `balance_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `due_date` DATE NOT NULL,
    `fee_status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `approval_status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    `created_by` BIGINT NULL,
    `updated_by` BIGINT NULL,
    `collected_by` BIGINT NULL,
    `collected_at` DATETIME(3) NULL,
    `auth_by` BIGINT NULL,
    `auth_at` DATETIME(3) NULL,
    `auth_remark` TEXT NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `fee_collections_student_id_idx`(`student_id`),
    INDEX `fee_collections_student_section_id_idx`(`student_section_id`),
    INDEX `fee_collections_fee_status_idx`(`fee_status`),
    INDEX `fee_collections_approval_status_idx`(`approval_status`),
    INDEX `fee_collections_due_date_idx`(`due_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fee_collection_histories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `fee_collection_id` BIGINT NOT NULL,
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `collected_by` BIGINT NULL,
    `collected_at` DATETIME(3) NULL,
    `record_status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `fee_collection_histories_fee_collection_id_idx`(`fee_collection_id`),
    INDEX `fee_collection_histories_collected_at_idx`(`collected_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sections` ADD CONSTRAINT `sections_program_id_fkey` FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modules` ADD CONSTRAINT `modules_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topics` ADD CONSTRAINT `topics_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_files` ADD CONSTRAINT `topic_files_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `topic_assessments` ADD CONSTRAINT `topic_assessments_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_topic_assessment_answers` ADD CONSTRAINT `student_topic_assessment_answers_topic_assessment_id_fkey` FOREIGN KEY (`topic_assessment_id`) REFERENCES `topic_assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `program_section_batches` ADD CONSTRAINT `program_section_batches_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_sections` ADD CONSTRAINT `student_sections_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `program_section_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_section_modules` ADD CONSTRAINT `student_section_modules_student_section_id_fkey` FOREIGN KEY (`student_section_id`) REFERENCES `student_sections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_section_modules` ADD CONSTRAINT `student_section_modules_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_section_module_topics` ADD CONSTRAINT `student_section_module_topics_student_section_module_id_fkey` FOREIGN KEY (`student_section_module_id`) REFERENCES `student_section_modules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_section_module_topics` ADD CONSTRAINT `student_section_module_topics_topic_id_fkey` FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `institution_users` ADD CONSTRAINT `institution_users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `institution_roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_notifications` ADD CONSTRAINT `admin_notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `institution_users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fee_collection_histories` ADD CONSTRAINT `fee_collection_histories_fee_collection_id_fkey` FOREIGN KEY (`fee_collection_id`) REFERENCES `fee_collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

