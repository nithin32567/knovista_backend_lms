CREATE TABLE `revoked_sessions` (
    `token_digest` CHAR(64) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    PRIMARY KEY (`token_digest`),
    INDEX `revoked_sessions_expires_at_idx` (`expires_at`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
