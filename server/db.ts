import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { validateServerPhoneNumber } from './phoneValidator';

dotenv.config();

// Default seed admin credentials
const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_PASS = 'zaara2026';
const DEFAULT_ADMIN_EMAIL = 'admin@zaaratravels.com';

// In-memory fallback database store for dev sandbox when live MySQL server is disconnected
export const memoryStore = {
  admins: [] as any[],
  customers: [] as any[],
  bookings: [] as any[],
  cabBookings: [] as any[],
  payments: [] as any[],
  transactions: [] as any[],
  tours: [] as any[],
  vehicles: [] as any[],
  offers: [] as any[],
  logs: [] as any[],
  settings: {
    companyName: 'Zaara Travels',
    gstin: '19ACUPH2897Q2ZA',
    primaryPhone: '+91 99339 92786',
    secondaryPhone: '+91 99329 99786',
    officePhone: '+011 69296175',
    whatsappNumber: '+919933992786',
    primaryEmail: 'info@zaaratravel.com',
    address: 'Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031',
    maintenanceMode: false,
  } as Record<string, any>,
  resetTokens: [] as any[],
};

let pool: mysql.Pool | null = null;
let isDbConnected = false;

// Initialize Seed Admin in memory store
async function initSeedAdminInMemory() {
  const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10);
  memoryStore.admins = [
    {
      id: 1,
      username: DEFAULT_ADMIN_USERNAME,
      password_hash,
      full_name: 'Zaara Travels Administrator',
      email: DEFAULT_ADMIN_EMAIL,
      role: 'Admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}
initSeedAdminInMemory();

// Populate initial sample bookings in memory store if empty
if (memoryStore.bookings.length === 0) {
  memoryStore.bookings = [
    {
      id: 1,
      bookingId: 'ZT-892410',
      guestName: 'Sarah Thompson',
      guestPhone: '+1 555-0199',
      guestEmail: 'sarah.t@example.com',
      tourTitle: '6-Day Golden Triangle Tour with Ranthambore Tiger Safari',
      travelDate: '2026-08-15',
      travelers: { adults: 2, children: 0 },
      vehicleType: 'Toyota Innova Crysta (6+1 Seater)',
      hotelOption: '4-Star Boutique & Heritage Haveli',
      totalAmountINR: 68000,
      totalAmountUSD: 820,
      paymentMethod: 'RAZORPAY (Paid in Full)',
      paymentStatus: 'PAID IN FULL',
      bookingDate: 'Jul 28, 2026',
      specialRequests: 'Taj Mahal sunrise tour guide requested',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      bookingId: 'ZT-431092',
      guestName: 'Rajesh Kumar',
      guestPhone: '+91 98112 34567',
      guestEmail: 'rajesh.k@gmail.com',
      tourTitle: 'Same Day Taj Mahal & Agra Fort Luxury Car Tour',
      travelDate: '2026-08-10',
      travelers: { adults: 4, children: 1 },
      vehicleType: 'Maruti Suzuki Dzire (AC Sedan)',
      hotelOption: 'Day Excursion',
      totalAmountINR: 14500,
      totalAmountUSD: 175,
      paymentMethod: 'Pay on Arrival to Driver',
      paymentStatus: 'CONFIRMED',
      bookingDate: 'Aug 02, 2026',
      specialRequests: 'Pickup from Delhi IGI Airport Terminal 3',
      created_at: new Date().toISOString(),
    },
  ];
}

if (memoryStore.cabBookings.length === 0) {
  memoryStore.cabBookings = [
    {
      id: 1,
      cabBookingId: 'CAB-9012',
      guestName: 'David Miller',
      guestPhone: '+44 7700 900077',
      guestEmail: 'david.miller@ukmail.com',
      pickupCity: 'Delhi IGI Airport',
      dropCity: 'Agra City',
      pickupDate: '2026-08-12',
      pickupTime: '08:00 AM',
      vehicleName: 'Toyota Innova Crysta',
      perKmRate: 18,
      estimatedKm: 240,
      estimatedFareINR: 4320,
      driverAssigned: 'Ramesh Singh',
      driverPhone: '+91 98765 12345',
      vehicleNumber: 'DL 01 YZ 8900',
      status: 'ASSIGNED',
      created_at: new Date().toISOString(),
    },
  ];
}

if (memoryStore.customers.length === 0) {
  memoryStore.customers = [
    {
      id: 1,
      customer_uuid: 'CUST-881920',
      full_name: 'Sarah Thompson',
      email: 'sarah.t@example.com',
      phone: '+1 555-0199',
      total_bookings: 1,
      created_at: '2026-07-28',
    },
    {
      id: 2,
      customer_uuid: 'CUST-331209',
      full_name: 'Rajesh Kumar',
      email: 'rajesh.k@gmail.com',
      phone: '+91 98112 34567',
      total_bookings: 1,
      created_at: '2026-08-02',
    },
  ];
}

if (memoryStore.logs.length === 0) {
  memoryStore.logs = [
    {
      id: 1,
      log_type: 'EMAIL',
      recipient: 'sarah.t@example.com',
      subject_or_template: 'Booking Voucher Confirmation ZT-892410',
      status: 'DELIVERED',
      details: 'Sent official PDF voucher with Taj Mahal guide instructions.',
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      log_type: 'WHATSAPP',
      recipient: '+919933992786',
      subject_or_template: 'Twilio WhatsApp Dispatch ZT-892410',
      status: 'SENT',
      details: 'Automatic notification sent to dispatch helpline.',
      created_at: new Date().toISOString(),
    },
  ];
}

// Connect to MySQL and initialize tables if configured
if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    pool.getConnection()
      .then(async (conn) => {
        isDbConnected = true;
        console.log(`✅ [MySQL Database] Connected successfully to ${process.env.DB_NAME}@${process.env.DB_HOST}`);
        conn.release();
        await initializeTablesAndSeed();
      })
      .catch((err) => {
        console.warn(`⚠️ [MySQL Database] Connection failed (${err.message}). Operating in memory fallback mode.`);
        isDbConnected = false;
      });
  } catch (e: any) {
    console.warn(`⚠️ [MySQL Database] Pool creation error: ${e.message}`);
    isDbConnected = false;
  }
} else {
  console.log('ℹ️ [MySQL Database] Credentials not specified in .env. Running in memory fallback mode.');
}

// Initialize tables and seed admin in live MySQL DB
async function initializeTablesAndSeed() {
  if (!pool || !isDbConnected) return;

  try {
    // 1. Create Admins Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        role ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Seed default admin if table is empty
    const [rows]: any = await pool.execute('SELECT id FROM admins WHERE username = ? LIMIT 1', [DEFAULT_ADMIN_USERNAME]);
    if (rows.length === 0) {
      const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASS, 10);
      await pool.execute(
        `INSERT INTO admins (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)`,
        [DEFAULT_ADMIN_USERNAME, password_hash, 'Zaara Travels Administrator', DEFAULT_ADMIN_EMAIL, 'Admin']
      );
      console.log(`🔑 [MySQL] Seed Admin created: "${DEFAULT_ADMIN_USERNAME}"`);
    }

    // 2. Create Reset Tokens Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Create Customers Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_uuid VARCHAR(50) NOT NULL UNIQUE,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Create Bookings Table
    await pool.execute(`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create Payments Table
    await pool.execute(`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Audit Logs Table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_type ENUM('EMAIL', 'WHATSAPP', 'ADMIN_ACTION') NOT NULL,
        recipient VARCHAR(150) NOT NULL,
        subject_or_template VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ [MySQL Database] All schema tables initialized.');
  } catch (err: any) {
    console.error('❌ Table initialization error:', err.message);
  }
}

export function isMySQLConnected(): boolean {
  return isDbConnected && pool !== null;
}

export async function executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (pool && isDbConnected) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T[];
    } catch (error: any) {
      console.error('MySQL query execution error:', error.message);
      throw error;
    }
  } else {
    return [] as T[];
  }
}

// ADMIN AUTH DATABASE QUERIES

export async function getAdminByUsernameOrEmail(identifier: string) {
  const clean = identifier.trim().toLowerCase();

  if (pool && isDbConnected) {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1`,
        [clean, clean]
      );
      if (rows.length > 0) return rows[0];
    } catch (e: any) {
      console.error('MySQL Admin Fetch Error:', e.message);
    }
  }

  return memoryStore.admins.find(
    (a) => a.username.toLowerCase() === clean || a.email.toLowerCase() === clean
  ) || null;
}

export async function getAdminById(id: number) {
  if (pool && isDbConnected) {
    try {
      const [rows]: any = await pool.execute(`SELECT * FROM admins WHERE id = ? LIMIT 1`, [id]);
      if (rows.length > 0) return rows[0];
    } catch (e: any) {
      console.error('MySQL Admin By ID Error:', e.message);
    }
  }

  return memoryStore.admins.find((a) => a.id === id) || null;
}

export async function createAdminRecord(adminData: {
  username: string;
  password_hash: string;
  full_name: string;
  email: string;
  role: 'Admin' | 'Staff';
}) {
  if (pool && isDbConnected) {
    try {
      const [result]: any = await pool.execute(
        `INSERT INTO admins (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)`,
        [adminData.username, adminData.password_hash, adminData.full_name, adminData.email, adminData.role]
      );
      return { id: result.insertId, ...adminData };
    } catch (e: any) {
      console.error('MySQL Admin Creation Error:', e.message);
      throw e;
    }
  }

  const newAdmin = {
    id: memoryStore.admins.length + 1,
    ...adminData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  memoryStore.admins.push(newAdmin);
  return newAdmin;
}

export async function updateAdminPassword(adminId: number, newPasswordHash: string) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(`UPDATE admins SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
        newPasswordHash,
        adminId,
      ]);
      return true;
    } catch (e: any) {
      console.error('MySQL Update Admin Password Error:', e.message);
      throw e;
    }
  }

  const admin = memoryStore.admins.find((a) => a.id === adminId);
  if (admin) {
    admin.password_hash = newPasswordHash;
    admin.updated_at = new Date().toISOString();
    return true;
  }
  return false;
}

export async function createPasswordResetToken(adminId: number, token: string, expiresAt: Date) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(
        `INSERT INTO reset_tokens (admin_id, token, expires_at) VALUES (?, ?, ?)`,
        [adminId, token, expiresAt]
      );
      return true;
    } catch (e: any) {
      console.error('MySQL Reset Token Error:', e.message);
    }
  }

  memoryStore.resetTokens.push({
    admin_id: adminId,
    token,
    expires_at: expiresAt,
    used: false,
  });
  return true;
}

export async function getResetTokenRecord(token: string) {
  if (pool && isDbConnected) {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM reset_tokens WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1`,
        [token]
      );
      if (rows.length > 0) return rows[0];
    } catch (e: any) {
      console.error('MySQL Get Reset Token Error:', e.message);
    }
  }

  return (
    memoryStore.resetTokens.find(
      (t) => t.token === token && !t.used && new Date(t.expires_at) > new Date()
    ) || null
  );
}

export async function markResetTokenUsed(tokenId: number) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(`UPDATE reset_tokens SET used = 1 WHERE id = ?`, [tokenId]);
    } catch (e: any) {
      console.error('MySQL Mark Token Used Error:', e.message);
    }
  }

  const tok = memoryStore.resetTokens.find((t) => t.id === tokenId);
  if (tok) tok.used = true;
}

// LOGGING UTILITIES FOR AUDIT LOGS

export async function logAudit(log_type: 'EMAIL' | 'WHATSAPP' | 'ADMIN_ACTION', recipient: string, subject_or_template: string, status: string, details: string) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(
        `INSERT INTO audit_logs (log_type, recipient, subject_or_template, status, details) VALUES (?, ?, ?, ?, ?)`,
        [log_type, recipient, subject_or_template, status, details]
      );
    } catch (e: any) {
      console.error('MySQL Audit Log Error:', e.message);
    }
  }

  memoryStore.logs.unshift({
    id: memoryStore.logs.length + 1,
    log_type,
    recipient,
    subject_or_template,
    status,
    details,
    created_at: new Date().toISOString(),
  });
}

/**
 * Save or Update Booking in DB / Memory Store
 */
export async function saveBookingToDb(booking: any) {
  const customerUuid = 'CUST-' + Math.floor(100000 + Math.random() * 900000);

  const phoneValidation = validateServerPhoneNumber(booking.guestPhone);
  if (!phoneValidation.isValid) {
    const errorMsg = `[MySQL Validation Failed] Customer phone number "${booking.guestPhone}" is invalid: ${phoneValidation.error}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const cleanPhone = phoneValidation.cleaned;
  booking.guestPhone = cleanPhone;
  
  if (pool && isDbConnected) {
    try {
      const [custRows]: any = await pool.execute(
        `SELECT id FROM customers WHERE email = ? OR phone = ? LIMIT 1`,
        [booking.guestEmail, cleanPhone]
      );
      
      let customerId: number | null = null;
      if (custRows.length > 0) {
        customerId = custRows[0].id;
      } else {
        const [insertCust]: any = await pool.execute(
          `INSERT INTO customers (customer_uuid, full_name, email, phone) VALUES (?, ?, ?, ?)`,
          [customerUuid, booking.guestName, booking.guestEmail, cleanPhone]
        );
        customerId = insertCust.insertId;
      }

      await pool.execute(
        `INSERT INTO bookings (
          booking_id, customer_id, guest_name, guest_email, guest_phone, tour_title,
          booking_type, travel_date, pickup_time, pickup_location, drop_location,
          guide_language, vehicle_type, hotel_option, travelers_adults, travelers_children,
          total_amount_inr, total_amount_usd, booking_status, payment_status, payment_method, special_requests
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          booking_status = VALUES(booking_status),
          payment_status = VALUES(payment_status),
          payment_method = VALUES(payment_method),
          updated_at = CURRENT_TIMESTAMP`,
        [
          booking.bookingId,
          customerId,
          booking.guestName,
          booking.guestEmail,
          cleanPhone,
          booking.tourTitle,
          booking.tourTitle?.toLowerCase().includes('cab') ? 'cab' : 'tour',
          booking.travelDate,
          booking.pickupTime || '06:00 AM',
          booking.pickupLocation || '',
          booking.dropLocation || '',
          booking.guideLanguage || 'English',
          booking.vehicleType || 'Private AC Vehicle',
          booking.hotelOption || 'Standard',
          booking.travelers?.adults || 1,
          booking.travelers?.children || 0,
          booking.totalAmountINR || 0,
          booking.totalAmountUSD || 0,
          booking.bookingStatus || (booking.paymentStatus?.toUpperCase().includes('CONFIRMED') ? 'CONFIRMED' : 'PENDING'),
          booking.paymentStatus || 'PENDING PAYMENT',
          booking.paymentMethod || 'Online Payment',
          booking.specialRequests || '',
        ]
      );

      console.log(`✅ [MySQL] Booking #${booking.bookingId} persisted in MySQL database.`);
    } catch (err: any) {
      console.error('❌ Failed to persist booking in MySQL:', err.message);
    }
  }

  const existingIndex = memoryStore.bookings.findIndex(b => b.bookingId === booking.bookingId);
  if (existingIndex >= 0) {
    memoryStore.bookings[existingIndex] = { ...memoryStore.bookings[existingIndex], ...booking };
  } else {
    memoryStore.bookings.unshift(booking);
  }
}

export async function savePaymentToDb(payment: any) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(
        `INSERT INTO payments (
          payment_id, booking_id, gateway_name, payment_choice, amount_inr, amount_usd,
          currency, payment_status, gateway_order_id, gateway_payment_id, gateway_signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          payment_status = VALUES(payment_status),
          gateway_payment_id = VALUES(gateway_payment_id),
          gateway_signature = VALUES(gateway_signature),
          updated_at = CURRENT_TIMESTAMP`,
        [
          payment.paymentId || 'PAY-' + Math.floor(100000 + Math.random() * 900000),
          payment.bookingId,
          payment.gatewayName,
          payment.paymentChoice || 'full',
          payment.amountINR || 0,
          payment.amountUSD || 0,
          payment.currency || 'INR',
          payment.paymentStatus || 'PENDING',
          payment.gatewayOrderId || null,
          payment.gatewayPaymentId || null,
          payment.gatewaySignature || null,
        ]
      );
    } catch (err: any) {
      console.error('❌ Failed to save payment in MySQL:', err.message);
    }
  }

  memoryStore.payments.push(payment);
}

export async function logTransactionToDb(tx: any) {
  if (pool && isDbConnected) {
    try {
      await pool.execute(
        `INSERT INTO transactions (
          transaction_ref, booking_id, payment_id, gateway_name, raw_request, raw_response, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          tx.transactionRef || 'TXN-' + Math.floor(100000 + Math.random() * 900000),
          tx.bookingId,
          tx.paymentId || null,
          tx.gatewayName,
          JSON.stringify(tx.rawRequest || {}),
          JSON.stringify(tx.rawResponse || {}),
          tx.status,
        ]
      );
    } catch (err: any) {
      console.error('❌ Failed to log transaction in MySQL:', err.message);
    }
  }

  memoryStore.transactions.push(tx);
}

export async function getBookingById(bookingId: string) {
  if (pool && isDbConnected) {
    try {
      const [rows]: any = await pool.execute(
        `SELECT * FROM bookings WHERE booking_id = ? LIMIT 1`,
        [bookingId]
      );
      if (rows.length > 0) return rows[0];
    } catch (err: any) {
      console.error('Error fetching booking from MySQL:', err.message);
    }
  }

  return memoryStore.bookings.find(b => b.bookingId === bookingId) || null;
}
