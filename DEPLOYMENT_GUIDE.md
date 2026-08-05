# Zaara Travels - Complete Production Payment Gateway & Hostinger Deployment Guide

This document provides complete instructions for deploying the **Zaara Travels** React + Vite + Node.js + Express payment system with MySQL and PayU, PayPal, and UPI payment gateways on Hostinger Business Hosting.

---

## 📁 Complete Directory & File Structure

```
├── .env.example                      # Production environment template
├── database.sql                      # MySQL DDL schema for Hostinger phpMyAdmin
├── DEPLOYMENT_GUIDE.md               # This deployment documentation
├── package.json                      # Scripts & dependencies
├── server.ts                         # Main Express app & Vite middleware
├── server/
│   ├── db.ts                         # MySQL pool connection with fallback store
│   ├── emailService.ts               # Nodemailer SMTP email engine
│   ├── paymentController.ts          # Payment API routes controller
│   ├── paymentService.ts             # PayU SHA-512, PayPal REST, UPI QR generators
│   └── twilioService.ts              # WhatsApp notification dispatcher
└── src/
    ├── components/
    │   ├── DeploymentGuideModal.tsx  # In-app deployment guide & SQL copy modal
    │   ├── PaymentGatewayModal.tsx   # Production Payment Gateway Checkout Modal
    │   ├── PaymentVerificationModal.tsx # Legacy verification modal fallback
    │   └── TourDetailsModal.tsx      # Main Tour detail & booking modal
    ├── services/
    │   └── paymentApi.ts             # Frontend Payment API client
    └── utils/
        ├── pdfGenerator.ts           # PDF Voucher generator (jsPDF)
        └── voucherGenerator.ts       # HTML Voucher window printer
```

---

## 🗄️ 1. MySQL Database Setup (Hostinger phpMyAdmin)

1. Log in to **Hostinger hPanel**.
2. Go to **Databases** > **MySQL Databases**.
3. Create a new database named `u123456789_zaara_db` and a MySQL user with full privileges.
4. Click **Enter phpMyAdmin**.
5. Select `u123456789_zaara_db`, click the **SQL** tab, and execute the SQL script from `database.sql`:

```sql
CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_uuid` VARCHAR(64) UNIQUE NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` VARCHAR(50) UNIQUE NOT NULL,
  `guest_name` VARCHAR(150) NOT NULL,
  `guest_email` VARCHAR(150) NOT NULL,
  `guest_phone` VARCHAR(30) NOT NULL,
  `tour_title` VARCHAR(255) NOT NULL,
  `travel_date` VARCHAR(50) NOT NULL,
  `total_amount_inr` DECIMAL(10, 2) NOT NULL,
  `total_amount_usd` DECIMAL(10, 2) NOT NULL,
  `booking_status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED') DEFAULT 'PENDING',
  `payment_status` VARCHAR(80) DEFAULT 'PENDING PAYMENT',
  `payment_method` VARCHAR(150) DEFAULT 'Online Gateway',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payment_id` VARCHAR(64) UNIQUE NOT NULL,
  `booking_id` VARCHAR(50) NOT NULL,
  `gateway_name` ENUM('payu', 'paypal', 'upi', 'pay_on_arrival') NOT NULL,
  `amount_inr` DECIMAL(10, 2) NOT NULL,
  `amount_usd` DECIMAL(10, 2) NOT NULL,
  `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## ⚙️ 2. Environment Configuration (.env)

Create a `.env` file in the root directory on your Hostinger Node.js server:

```env
PORT=3000
NODE_ENV=production
APP_URL=https://www.zaaratravel.com

# Hostinger MySQL Database
DB_HOST=localhost
DB_USER=u123456789_zaara
DB_PASSWORD=YourDatabasePassword123!
DB_NAME=u123456789_zaara_db
DB_PORT=3306

# PayU Gateway Credentials
PAYU_MERCHANT_KEY=JP2V9q
PAYU_MERCHANT_SALT=qwerty12345
PAYU_ENV=LIVE
PAYU_PAYMENT_URL=https://secure.payu.in/_payment

# PayPal Credentials
PAYPAL_CLIENT_ID=YourPayPalClientId
PAYPAL_CLIENT_SECRET=YourPayPalClientSecret
PAYPAL_MODE=live
PAYPAL_API_BASE=https://api-m.paypal.com

# UPI Details
UPI_VPA=zaaratravels@icici
UPI_PAYEE_NAME=Zaara Travels Private Limited

# SMTP Webmail
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@zaaratravel.com
SMTP_PASS=YourEmailPassword123!
SMTP_FROM="Zaara Travels" <info@zaaratravel.com>
ADMIN_EMAIL=info@zaaratravel.com
```

---

## 🚀 3. Building & Deploying to Hostinger Node.js

1. On your local terminal, run the build command:
   ```bash
   npm run build
   ```
   This generates `dist/` containing compiled static frontend assets and `dist/server.cjs`.

2. Upload `dist/`, `package.json`, and `.env` to your Hostinger website directory (e.g., `public_html`).

3. In Hostinger hPanel:
   - Go to **Advanced** > **Node.js Application**.
   - Set **Application Root**: `public_html`
   - Set **Application Startup File**: `dist/server.cjs`
   - Click **Save** and **Restart Application**.

---

## 💳 4. Payment Gateway Logic Summary

- **Pay on Arrival**: Confirms booking immediately with status `CONFIRMED (PAY ON ARRIVAL)`. Triggers PDF generation, email to `info@zaaratravel.com`, and WhatsApp message.
- **PayU Gateway**: Generates SHA-512 hash on backend (`sha512(key|txnid|amount|productinfo|firstname|email||||||SALT)`). Verifies response reverse hash before changing booking status to `CONFIRMED`.
- **PayPal Gateway**: Communicates with PayPal REST API v2 (`/v2/checkout/orders`). Captures order on backend before setting booking status to `CONFIRMED`.
- **UPI Instant Pay**: Displays NPCI UPI URI (`upi://pay?pa=zaaratravels@icici...`) and QR Code. Verifies UTR / Reference ID before confirming booking.
