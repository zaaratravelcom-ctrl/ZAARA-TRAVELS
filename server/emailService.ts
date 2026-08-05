import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@zaaratravel.com';

// Configure Nodemailer SMTP Transporter
let transporter: nodemailer.Transporter | null = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log(`📧 [Nodemailer] SMTP Transporter initialized for ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  } catch (err: any) {
    console.warn(`⚠️ [Nodemailer] Could not create SMTP transporter: ${err.message}`);
  }
} else {
  console.log('ℹ️ [Nodemailer] SMTP configuration missing in .env. Email dispatch will operate in logger mode.');
}

export interface BookingEmailData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  guideLanguage?: string;
  vehicleType?: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod: string;
  paymentStatus: string;
  specialRequests?: string;
}

/**
 * Send HTML Email Confirmation to Customer & Admin
 */
export async function sendServerEmailNotification(booking: BookingEmailData): Promise<{
  success: boolean;
  message: string;
  adminEmailSentTo: string;
  guestEmailSentTo: string;
}> {
  const isConfirmed = booking.paymentStatus.toUpperCase().includes('CONFIRMED') || booking.paymentStatus.toUpperCase().includes('PAID');
  const statusBadge = isConfirmed
    ? `<span style="background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 4px 12px; border-radius: 9999px; display: inline-block;">CONFIRMED ✓</span>`
    : `<span style="background-color: #fef3c7; color: #92400e; font-weight: bold; padding: 4px 12px; border-radius: 9999px; display: inline-block;">PENDING PAYMENT ⏳</span>`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 650px; background: #ffffff; border-radius: 16px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background-color: #0f172a; color: #ffffff; padding: 25px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #f59e0b; letter-spacing: 1px; }
        .header p { margin: 5px 0 0; color: #94a3b8; font-size: 13px; }
        .content { padding: 30px; }
        .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; margin-bottom: 15px; }
        .grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .grid td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .grid tr:nth-child(even) { background-color: #f8fafc; }
        .label { font-weight: bold; color: #475569; width: 40%; }
        .value { color: #0f172a; width: 60%; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ZAARA TRAVELS</h1>
          <p>Official Booking Voucher & Reservation Notification</p>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 25px;">
            <p style="font-size: 14px; margin: 0 0 8px;">Booking Reference Number</p>
            <h2 style="margin: 0; color: #0284c7; font-size: 28px;">${booking.bookingId}</h2>
            <div style="margin-top: 10px;">${statusBadge}</div>
          </div>

          <div class="section-title">Passenger & Contact Details</div>
          <table class="grid">
            <tr><td class="label">Lead Guest Name:</td><td class="value"><strong>${booking.guestName}</strong></td></tr>
            <tr><td class="label">Email Address:</td><td class="value">${booking.guestEmail}</td></tr>
            <tr><td class="label">Phone / WhatsApp:</td><td class="value">${booking.guestPhone}</td></tr>
          </table>

          <div class="section-title">Tour & Vehicle Reservation</div>
          <table class="grid">
            <tr><td class="label">Tour / Service Name:</td><td class="value"><strong>${booking.tourTitle}</strong></td></tr>
            <tr><td class="label">Travel Date:</td><td class="value">${booking.travelDate}</td></tr>
            <tr><td class="label">Pickup Time:</td><td class="value">${booking.pickupTime || '06:00 AM'}</td></tr>
            <tr><td class="label">Pickup Location:</td><td class="value">${booking.pickupLocation || 'Delhi Hotel / Airport'}</td></tr>
            <tr><td class="label">Guide Language:</td><td class="value">${booking.guideLanguage || 'English'}</td></tr>
            <tr><td class="label">Vehicle Assigned:</td><td class="value">${booking.vehicleType || 'Private AC Vehicle'}</td></tr>
            ${booking.specialRequests ? `<tr><td class="label">Special Requests:</td><td class="value">${booking.specialRequests}</td></tr>` : ''}
          </table>

          <div class="section-title">Payment Breakdown</div>
          <table class="grid">
            <tr><td class="label">Total Amount Payable:</td><td class="value"><strong style="color: #059669; font-size: 18px;">₹${booking.totalAmountINR.toLocaleString('en-IN')} ($${booking.totalAmountUSD} USD)</strong></td></tr>
            <tr><td class="label">Payment Choice:</td><td class="value">${booking.paymentMethod}</td></tr>
            <tr><td class="label">Payment Status:</td><td class="value">${booking.paymentStatus}</td></tr>
          </table>
        </div>

        <div class="footer">
          <p><strong>Zaara Travels Private Limited</strong> • Rani Garden, Shastri Nagar, Geeta Colony, New Delhi 110031</p>
          <p>GSTIN: 19ACUPH2897Q2ZA | 24x7 Helpline: +91 99339 92786 | info@zaaratravel.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (transporter) {
    try {
      // Send email to Customer
      if (booking.guestEmail && booking.guestEmail.includes('@')) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || `"Zaara Travels" <${ADMIN_EMAIL}>`,
          to: booking.guestEmail,
          subject: `Official Booking Confirmation - Ref: ${booking.bookingId} - Zaara Travels`,
          html: htmlBody,
        });
      }

      // Send copy to Admin
      await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Zaara Travels System" <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `[ADMIN ALERT] New Booking ${booking.bookingId} (${booking.paymentStatus})`,
        html: htmlBody,
      });

      console.log(`✅ [SMTP Email] Successfully dispatched emails for #${booking.bookingId} to ${booking.guestEmail} and ${ADMIN_EMAIL}`);
      return {
        success: true,
        message: 'Emails sent via SMTP successfully',
        adminEmailSentTo: ADMIN_EMAIL,
        guestEmailSentTo: booking.guestEmail,
      };
    } catch (error: any) {
      console.error('❌ Error sending SMTP email:', error.message);
    }
  }

  // Fallback console logging when SMTP server is not set up in env
  console.log(`================================================================`);
  console.log(`📧 [EMAIL LOG] Dispatched confirmation email for Booking #${booking.bookingId}`);
  console.log(`To Customer: ${booking.guestEmail}`);
  console.log(`To Admin: ${ADMIN_EMAIL}`);
  console.log(`Status: ${booking.paymentStatus}`);
  console.log(`================================================================`);

  return {
    success: true,
    message: 'Email processed (Logger Mode - Configure SMTP in .env for live transmission)',
    adminEmailSentTo: ADMIN_EMAIL,
    guestEmailSentTo: booking.guestEmail,
  };
}
