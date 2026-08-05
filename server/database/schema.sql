-- =============================================================================
-- ZAARA TRAVELS MYSQL DATABASE SCHEMA
-- Production Database Setup for Admin Auth, Bookings, Fleet, Logs & Settings
-- =============================================================================

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  role ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_uuid VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_email (email),
  INDEX idx_customer_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT NULL,
  guest_name VARCHAR(150) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  tour_title VARCHAR(255) NOT NULL,
  booking_type ENUM('tour', 'cab') DEFAULT 'tour',
  travel_date VARCHAR(50) NOT NULL,
  pickup_time VARCHAR(50) DEFAULT '06:00 AM',
  pickup_location VARCHAR(255) DEFAULT '',
  drop_location VARCHAR(255) DEFAULT '',
  guide_language VARCHAR(50) DEFAULT 'English',
  vehicle_type VARCHAR(100) DEFAULT 'Private AC Vehicle',
  hotel_option VARCHAR(100) DEFAULT 'Standard',
  travelers_adults INT DEFAULT 1,
  travelers_children INT DEFAULT 0,
  total_amount_inr DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  total_amount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  booking_status VARCHAR(50) DEFAULT 'PENDING',
  payment_status VARCHAR(50) DEFAULT 'PAYMENT PENDING',
  payment_method VARCHAR(100) DEFAULT 'Online Payment',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_booking_status (booking_status),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cab_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cab_booking_id VARCHAR(50) NOT NULL UNIQUE,
  guest_name VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  guest_email VARCHAR(150),
  pickup_city VARCHAR(100) NOT NULL,
  drop_city VARCHAR(100) NOT NULL,
  pickup_date VARCHAR(50) NOT NULL,
  pickup_time VARCHAR(50) NOT NULL,
  vehicle_name VARCHAR(100) NOT NULL,
  per_km_rate DECIMAL(8, 2) DEFAULT 0.00,
  estimated_km INT DEFAULT 250,
  estimated_fare_inr DECIMAL(10, 2) NOT NULL,
  driver_assigned VARCHAR(150) DEFAULT 'Pending Assignment',
  driver_phone VARCHAR(50) DEFAULT '',
  vehicle_number VARCHAR(50) DEFAULT '',
  status ENUM('CONFIRMED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id VARCHAR(100) NOT NULL UNIQUE,
  booking_id VARCHAR(50) NOT NULL,
  gateway_name VARCHAR(50) NOT NULL,
  payment_choice VARCHAR(50) DEFAULT 'full',
  amount_inr DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  amount_usd DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'INR',
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  gateway_order_id VARCHAR(150),
  gateway_payment_id VARCHAR(150),
  gateway_signature VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pay_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_ref VARCHAR(100) NOT NULL UNIQUE,
  booking_id VARCHAR(50) NOT NULL,
  payment_id VARCHAR(100),
  gateway_name VARCHAR(50) NOT NULL,
  raw_request JSON,
  raw_response JSON,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tours (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  price_inr DECIMAL(12,2) NOT NULL,
  image TEXT,
  highlights TEXT,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 5.0,
  reviews_count INT DEFAULT 1,
  tag VARCHAR(50) DEFAULT 'Popular',
  is_featured TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(100) NOT NULL,
  seating_capacity VARCHAR(50) NOT NULL,
  rate_per_km DECIMAL(8,2) NOT NULL,
  base_daily_fare DECIMAL(10,2) NOT NULL,
  features TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(150) NOT NULL,
  discount_type ENUM('PERCENT', 'FLAT') DEFAULT 'PERCENT',
  discount_value DECIMAL(10,2) NOT NULL,
  valid_until VARCHAR(50) NOT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_type ENUM('EMAIL', 'WHATSAPP', 'ADMIN_ACTION') NOT NULL,
  recipient VARCHAR(150) NOT NULL,
  subject_or_template VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS website_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
