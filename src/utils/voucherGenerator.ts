export interface BookingVoucherData {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  travelers: {
    adults: number;
    children: number;
  };
  vehicleType: string;
  hotelOption?: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod: string;
  paymentStatus: 'PAID IN FULL' | 'DEPOSIT CONFIRMED' | 'PAY ON ARRIVAL';
  bookingDate: string;
  specialRequests?: string;
}

export function openPrintableVoucher(data: BookingVoucherData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to open and print your Zaara Travels Voucher.');
    return;
  }

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Booking Voucher - ${data.bookingId} - Zaara Travels</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 30px;
      color: #1a202c;
      background-color: #f7fafc;
    }
    .voucher-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      padding: 32px;
      position: relative;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #edf2f7;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 28px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .brand-sub {
      font-size: 13px;
      color: #0284c7;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    .gst-badge {
      font-size: 11px;
      background: #e0f2fe;
      color: #0369a1;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 6px;
      font-weight: 600;
    }
    .voucher-status {
      text-align: right;
    }
    .ref-no {
      font-size: 20px;
      font-weight: 700;
      color: #0369a1;
      margin: 0;
    }
    .status-pill {
      display: inline-block;
      margin-top: 6px;
      padding: 6px 14px;
      background-color: #dcfce7;
      color: #15803d;
      font-size: 12px;
      font-weight: 700;
      border-radius: 20px;
      text-transform: uppercase;
    }
    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 8px;
    }
    .box-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .box-content {
      font-size: 14px;
      color: #0f172a;
      line-height: 1.6;
    }
    .tour-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .tour-title {
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #38bdf8;
    }
    .tour-meta {
      display: flex;
      gap: 20px;
      font-size: 13px;
      color: #cbd5e1;
    }
    .price-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .price-table th, .price-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .price-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 700;
    }
    .footer-notes {
      border-top: 1px dashed #cbd5e1;
      padding-top: 20px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .owner-sign {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #edf2f7;
    }
    .btn-print {
      background: #0284c7;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      margin-bottom: 20px;
    }
    @media print {
      .btn-print { display: none; }
      body { background: white; padding: 0; }
      .voucher-card { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <button class="btn-print" onclick="window.print()">🖨️ Print / Save as PDF Voucher</button>
  </div>

  <div class="voucher-card">
    <div class="header">
      <div>
        <h1 class="brand-title">ZAARA TRAVELS</h1>
        <div class="brand-sub">Your Journey, Our Passion.</div>
        <div class="gst-badge">GSTIN: 19ACUPH2897Q2ZA | Govt Reg. Tour Operator</div>
      </div>
      <div class="voucher-status">
        <div class="ref-no">${data.bookingId}</div>
        <div class="status-pill">${data.paymentStatus}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Booked on ${data.bookingDate}</div>
      </div>
    </div>

    <div class="tour-banner">
      <h2 class="tour-title">${data.tourTitle}</h2>
      <div class="tour-meta">
        <div>📅 <strong>Travel Date:</strong> ${data.travelDate}</div>
        ${data.pickupTime ? `<div>⏰ <strong>Pickup Time:</strong> ${data.pickupTime}</div>` : ''}
        <div>👥 <strong>Travelers:</strong> ${data.travelers.adults} Adults, ${data.travelers.children} Children</div>
        <div>🚗 <strong>Vehicle:</strong> ${data.vehicleType}</div>
      </div>
    </div>

    <div class="section-grid">
      <div class="box">
        <div class="box-title">Guest & Pickup Details</div>
        <div class="box-content">
          <strong>${data.guestName}</strong><br>
          📞 Phone: ${data.guestPhone}<br>
          ✉️ Email: ${data.guestEmail}<br>
          ${data.pickupLocation ? `📍 <strong>Pickup Point:</strong> ${data.pickupLocation}<br>` : ''}
          ${data.specialRequests ? `📝 Note: ${data.specialRequests}` : ''}
        </div>
      </div>

      <div class="box">
        <div class="box-title">Managing Director & Helpline</div>
        <div class="box-content">
          <strong>Zaara Travels Head Office</strong><br>
          Managing Director: <strong>Jahangir Khan</strong><br>
          📱 WhatsApp / Phone: <strong>+91 99339 92786</strong><br>
          🌐 Website: www.zaaratravel.com | info@zaaratravel.com
        </div>
      </div>
    </div>

    <table class="price-table">
      <thead>
        <tr>
          <th>Service Item</th>
          <th>Details</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Private Tour Package</td>
          <td>${data.tourTitle} (${data.travelers.adults} Adults)</td>
          <td style="text-align: right;">₹${data.totalAmountINR.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Private Transport & Driver</td>
          <td>${data.vehicleType} (Fuel, Tolls, Permits & Driver Allowance Included)</td>
          <td style="text-align: right;">Included</td>
        </tr>
        ${data.hotelOption ? `
        <tr>
          <td>Hotel Accommodation</td>
          <td>${data.hotelOption}</td>
          <td style="text-align: right;">Included</td>
        </tr>` : ''}
        <tr style="font-weight: 700; font-size: 16px; background: #f8fafc;">
          <td colspan="2">Total Paid / Payable (${data.paymentMethod}):</td>
          <td style="text-align: right; color: #0369a1;">₹${data.totalAmountINR.toLocaleString('en-IN')} (~$${data.totalAmountUSD} USD)</td>
        </tr>
      </tbody>
    </table>

    <div class="section-grid">
      <div class="box">
        <div class="box-title">Important Driver Instructions</div>
        <div class="box-content" style="font-size: 12px;">
          • Driver details & vehicle number will be dispatched via WhatsApp 12 hours before pickup.<br>
          • Punctual hotel / airport pickup at your requested time.<br>
          • All parking, interstate taxes & toll fees are prepaid by Zaara Travels.
        </div>
      </div>
      <div class="box">
        <div class="box-title">Emergency Contact 24/7</div>
        <div class="box-content" style="font-size: 12px;">
          Direct Line: <strong>+91 99339 92786</strong><br>
          Official Email: <strong>info@zaaratravel.com</strong><br>
          In Case of Flight Delay: Message WhatsApp immediately with flight number.
        </div>
      </div>
    </div>

    <div class="owner-sign">
      <div>
        <div style="font-size: 12px; color: #64748b;">Authorized Signatory</div>
        <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">Jahangir Khan</div>
        <div style="font-size: 12px; color: #0284c7;">Managing Director, Zaara Travels</div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: monospace; font-size: 10px; background: #f1f5f9; padding: 6px 12px; border-radius: 4px;">
          VERIFIED OFFICIAL VOUCHER | GSTIN: 19ACUPH2897Q2ZA
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
