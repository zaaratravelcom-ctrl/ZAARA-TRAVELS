import { Router, Response } from 'express';
import {
  authenticateAdminJWT,
  AuthenticatedAdminRequest,
} from '../middleware/authMiddleware';
import { memoryStore, executeQuery, isMySQLConnected } from '../db';

const router = Router();

// Protect all data routes below with JWT authentication
router.use(authenticateAdminJWT);

/**
 * 1. DASHBOARD OVERVIEW STATS
 * GET /api/admin/dashboard/stats
 */
router.get('/dashboard/stats', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let bookings = memoryStore.bookings;
    let cabBookings = memoryStore.cabBookings;
    let customers = memoryStore.customers;
    let logs = memoryStore.logs;

    if (isMySQLConnected()) {
      try {
        const dbBookings = await executeQuery('SELECT * FROM bookings ORDER BY created_at DESC');
        if (dbBookings && dbBookings.length > 0) bookings = dbBookings;

        const dbCabs = await executeQuery('SELECT * FROM cab_bookings ORDER BY created_at DESC');
        if (dbCabs && dbCabs.length > 0) cabBookings = dbCabs;

        const dbCusts = await executeQuery('SELECT * FROM customers ORDER BY created_at DESC');
        if (dbCusts && dbCusts.length > 0) customers = dbCusts;
      } catch (e: any) {
        console.warn('Dashboard DB query fallback:', e.message);
      }
    }

    const totalBookings = bookings.length;
    const totalCabBookings = cabBookings.length;
    const totalCustomers = customers.length;
    const totalRevenueINR = bookings.reduce((sum, b) => sum + Number(b.total_amount_inr || b.totalAmountINR || 0), 0);
    const totalRevenueUSD = bookings.reduce((sum, b) => sum + Number(b.total_amount_usd || b.totalAmountUSD || 0), 0);
    const totalGSTINR = Math.round(totalRevenueINR * 0.05);

    return res.json({
      success: true,
      stats: {
        totalBookings,
        totalCabBookings,
        totalCustomers,
        totalRevenueINR,
        totalRevenueUSD,
        totalGSTINR,
        recentBookings: bookings.slice(0, 5),
        recentLogs: logs.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to load dashboard statistics.' });
  }
});

/**
 * 2. TOUR BOOKINGS MANAGEMENT
 * GET /api/admin/bookings
 * PUT /api/admin/bookings/:bookingId/status
 * DELETE /api/admin/bookings/:bookingId
 */
router.get('/bookings', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let list = memoryStore.bookings;
    if (isMySQLConnected()) {
      const dbRows = await executeQuery('SELECT * FROM bookings ORDER BY created_at DESC');
      if (dbRows && dbRows.length > 0) list = dbRows;
    }
    return res.json({ success: true, bookings: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load bookings.' });
  }
});

router.put('/bookings/:bookingId/status', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { paymentStatus, bookingStatus } = req.body;

    const idx = memoryStore.bookings.findIndex((b) => b.bookingId === bookingId);
    if (idx >= 0) {
      if (paymentStatus) memoryStore.bookings[idx].paymentStatus = paymentStatus;
      if (bookingStatus) memoryStore.bookings[idx].bookingStatus = bookingStatus;
    }

    if (isMySQLConnected()) {
      await executeQuery(
        `UPDATE bookings SET payment_status = ?, booking_status = ? WHERE booking_id = ?`,
        [paymentStatus || 'CONFIRMED', bookingStatus || 'CONFIRMED', bookingId]
      );
    }

    return res.json({ success: true, message: `Booking #${bookingId} status updated.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update booking status.' });
  }
});

router.delete('/bookings/:bookingId', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { bookingId } = req.params;
    memoryStore.bookings = memoryStore.bookings.filter((b) => b.bookingId !== bookingId);

    if (isMySQLConnected()) {
      await executeQuery(`DELETE FROM bookings WHERE booking_id = ?`, [bookingId]);
    }

    return res.json({ success: true, message: `Booking #${bookingId} deleted.` });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete booking.' });
  }
});

/**
 * 3. CAB RENTAL BOOKINGS MANAGEMENT
 * GET /api/admin/cab-bookings
 * POST /api/admin/cab-bookings
 * PUT /api/admin/cab-bookings/:id
 */
router.get('/cab-bookings', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let list = memoryStore.cabBookings;
    if (isMySQLConnected()) {
      const dbRows = await executeQuery('SELECT * FROM cab_bookings ORDER BY created_at DESC');
      if (dbRows && dbRows.length > 0) list = dbRows;
    }
    return res.json({ success: true, cabBookings: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load cab bookings.' });
  }
});

router.post('/cab-bookings', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const newCabBooking = {
      id: memoryStore.cabBookings.length + 1,
      cabBookingId: 'CAB-' + Math.floor(1000 + Math.random() * 9000),
      ...req.body,
      status: req.body.status || 'CONFIRMED',
      created_at: new Date().toISOString(),
    };
    memoryStore.cabBookings.unshift(newCabBooking);
    return res.status(201).json({ success: true, cabBooking: newCabBooking });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to create cab booking.' });
  }
});

router.put('/cab-bookings/:id', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);
    const idx = memoryStore.cabBookings.findIndex((c) => c.id === numericId);
    if (idx >= 0) {
      memoryStore.cabBookings[idx] = { ...memoryStore.cabBookings[idx], ...req.body };
    }
    return res.json({ success: true, message: 'Cab booking updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update cab booking.' });
  }
});

/**
 * 4. CUSTOMERS DIRECTORY
 * GET /api/admin/customers
 */
router.get('/customers', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let list = memoryStore.customers;
    if (isMySQLConnected()) {
      const dbRows = await executeQuery('SELECT * FROM customers ORDER BY created_at DESC');
      if (dbRows && dbRows.length > 0) list = dbRows;
    }
    return res.json({ success: true, customers: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load customers.' });
  }
});

/**
 * 5. PAYMENT TRANSACTIONS LOGS
 * GET /api/admin/payments
 */
router.get('/payments', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let list = memoryStore.payments;
    if (isMySQLConnected()) {
      const dbRows = await executeQuery('SELECT * FROM payments ORDER BY created_at DESC');
      if (dbRows && dbRows.length > 0) list = dbRows;
    }
    return res.json({ success: true, payments: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load payment logs.' });
  }
});

/**
 * 6. EMAIL & WHATSAPP AUDIT LOGS
 * GET /api/admin/logs
 */
router.get('/logs', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    let list = memoryStore.logs;
    if (isMySQLConnected()) {
      const dbRows = await executeQuery('SELECT * FROM audit_logs ORDER BY created_at DESC');
      if (dbRows && dbRows.length > 0) list = dbRows;
    }
    return res.json({ success: true, logs: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to load logs.' });
  }
});

/**
 * 7. WEBSITE SETTINGS
 * GET /api/admin/settings
 * POST /api/admin/settings
 */
router.get('/settings', async (req: AuthenticatedAdminRequest, res: Response) => {
  return res.json({ success: true, settings: memoryStore.settings });
});

router.post('/settings', async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    memoryStore.settings = { ...memoryStore.settings, ...req.body };
    return res.json({ success: true, settings: memoryStore.settings, message: 'Website settings updated successfully.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

export default router;
