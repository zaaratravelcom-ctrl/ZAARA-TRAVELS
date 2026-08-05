-- =============================================================================
-- ZAARA TRAVELS - PRODUCTION MYSQL DATABASE SCHEMA
-- Compatible with Hostinger Business Hosting MySQL & Node.js Backend
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `zaara_travels_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `zaara_travels_db`;

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_uuid` VARCHAR(64) UNIQUE NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_customer_email` (`email`),
  INDEX `idx_customer_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) UNIQUE NOT NULL,
  `customer_id` INT NULL,
  `guest_name` VARCHAR(150) NOT NULL,
  `guest_email` VARCHAR(150) NOT NULL,
  `guest_phone` VARCHAR(30) NOT NULL,
  `tour_title` VARCHAR(255) NOT NULL,
  `booking_type` ENUM('tour', 'cab', 'custom') DEFAULT 'tour',
  `travel_date` VARCHAR(50) NOT NULL,
  `pickup_time` VARCHAR(50) DEFAULT '06:00 AM',
  `pickup_location` TEXT,
  `drop_location` TEXT,
  `guide_language` VARCHAR(50) DEFAULT 'English',
  `vehicle_type` VARCHAR(100) DEFAULT 'Private AC Vehicle',
  `hotel_option` VARCHAR(100) DEFAULT 'Standard',
  `travelers_adults` INT DEFAULT 1,
  `travelers_children` INT DEFAULT 0,
  `total_amount_inr` DECIMAL(10, 2) NOT NULL,
  `total_amount_usd` DECIMAL(10, 2) NOT NULL,
  `booking_status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED') DEFAULT 'PENDING',
  `payment_status` VARCHAR(80) DEFAULT 'PENDING PAYMENT',
  `payment_method` VARCHAR(150) DEFAULT 'Online Gateway',
  `special_requests` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
  INDEX `idx_booking_ref` (`booking_id`),
  INDEX `idx_guest_email` (`guest_email`),
  INDEX `idx_booking_status` (`booking_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` VARCHAR(64) UNIQUE NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `gateway_name` ENUM('payu', 'paypal', 'upi', 'pay_on_arrival') NOT NULL,
  `payment_choice` VARCHAR(50) DEFAULT 'full', -- full / advance_25
  `amount_inr` DECIMAL(10, 2) NOT NULL,
  `amount_usd` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'INR',
  `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',
  `gateway_order_id` VARCHAR(150) NULL,
  `gateway_payment_id` VARCHAR(150) NULL,
  `gateway_signature` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  INDEX `idx_payment_booking` (`booking_id`),
  INDEX `idx_gateway_order` (`gateway_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TRANSACTIONS LOG TABLE
CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaction_ref` VARCHAR(64) UNIQUE NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `payment_id` VARCHAR(64) NULL,
  `gateway_name` VARCHAR(50) NOT NULL,
  `raw_request` LONGTEXT NULL,
  `raw_response` LONGTEXT NULL,
  `status` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  INDEX `idx_tx_booking` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
