export interface BookingVoucherData {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
  guideLanguage?: string;
  travelers: {
    adults: number;
    children: number;
  };
  vehicleType: string;
  hotelOption?: string;
  baseAmountINR?: number;
  gstAmountINR?: number;
  baseAmountUSD?: number;
  gstAmountUSD?: number;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod: string;
  paymentStatus: string;
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
  <title>Official Booking Voucher - ${data.bookingId} - Zaara Travels</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      color: #0f172a;
      background-color: #f1f5f9;
    }
    .voucher-card {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border: 1px solid #cbd5e1;
      overflow: hidden;
      position: relative;
    }
    /* Official Letterhead Header Styling */
    .top-wave-bar {
      height: 6px;
      background: #0b1736;
      border-bottom: 2px solid #d97706;
    }
    .letterhead-header {
      padding: 16px 24px 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #ffffff;
    }
    .brand-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-title-group {
      line-height: 1.1;
    }
    .brand-zaara {
      font-size: 26px;
      font-weight: 900;
      color: #1d4ed8;
      letter-spacing: -0.5px;
    }
    .brand-travels {
      font-size: 18px;
      font-weight: 800;
      color: #dc2626;
      margin-left: 2px;
    }
    .brand-url {
      font-size: 11px;
      font-weight: 700;
      color: #1d4ed8;
      margin-top: 3px;
    }
    .brand-center {
      text-align: left;
      border-left: 2px solid #cbd5e1;
      padding-left: 16px;
    }
    .company-title {
      font-size: 15px;
      font-weight: 900;
      color: #1d4ed8;
    }
    .company-title span {
      color: #dc2626;
    }
    .md-name {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2px;
    }
    .gstin-no {
      font-size: 11px;
      font-weight: 800;
      color: #d97706;
      margin-top: 2px;
    }
    .brand-right {
      text-align: right;
      font-size: 11px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.5;
    }
    /* Dark Navy Address Ribbon Bar */
    .address-bar {
      background: #0b1736;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      padding: 6px 12px;
      margin: 0 24px 16px 24px;
      border-radius: 4px;
    }

    .doc-banner {
      margin: 0 24px 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 12px;
    }
    .doc-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .doc-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    .ref-no {
      font-size: 18px;
      font-weight: 800;
      color: #0284c7;
    }
    .status-pill {
      display: inline-block;
      margin-top: 4px;
      padding: 4px 12px;
      background-color: #dcfce7;
      color: #15803d;
      font-size: 11px;
      font-weight: 800;
      border-radius: 20px;
      text-transform: uppercase;
    }

    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 0 24px 16px 24px;
    }
    .box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 14px;
      border-radius: 6px;
    }
    .box-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0b1736;
      font-weight: 800;
      margin-bottom: 6px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    .box-content {
      font-size: 12.5px;
      color: #0f172a;
      line-height: 1.5;
    }

    .price-table {
      width: calc(100% - 48px);
      margin: 0 24px 16px 24px;
      border-collapse: collapse;
    }
    .price-table th, .price-table td {
      padding: 10px 12px;
      text-align: left;
      border: 1px solid #cbd5e1;
      font-size: 12px;
    }
    .price-table th {
      background: #0b1736;
      color: #ffffff;
      font-weight: 700;
    }

    .letterhead-footer {
      margin: 16px 24px 20px 24px;
      border: 1px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .seal-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seal-circle {
      width: 60px;
      height: 60px;
      border: 3px double #0284c7;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      font-weight: 800;
      color: #0f172a;
      text-align: center;
      line-height: 1.1;
      background: #ffffff;
    }
    .office-info {
      font-size: 10.5px;
      color: #334155;
      line-height: 1.4;
    }

    .sign-block {
      text-align: right;
    }
    .sign-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      border-top: 1px solid #0f172a;
      padding-top: 4px;
      margin-top: 20px;
    }
    .sign-sub {
      font-size: 10px;
      font-weight: 700;
      color: #0284c7;
    }

    .bottom-tagline {
      text-align: center;
      font-style: italic;
      color: #d97706;
      font-weight: 700;
      font-size: 12px;
      padding: 8px 0;
      border-top: 1px solid #cbd5e1;
    }

    .btn-print {
      background: #0b1736;
      color: #fbbf24;
      border: 1px solid #d97706;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    @media print {
      .btn-print { display: none; }
      body { background: white; padding: 0; }
      .voucher-card { box-shadow: none; border: none; width: 100%; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div style="text-align: center;">
    <button class="btn-print" onclick="window.print()">🖨️ Print/Save</button>
  </div>

  <div class="voucher-card">
    <!-- Top Sweeping Wave Bar -->
    <div class="top-wave-bar"></div>

    <!-- Official Letterhead Header -->
    <div class="letterhead-header">
      <div class="brand-left">
        <div class="brand-title-group">
          <div><span class="brand-zaara">Zaara</span> <span class="brand-travels">Travels® 🚘</span></div>
          <div class="brand-url">www.zaaratravel.com</div>
        </div>
      </div>

      <div class="brand-center">
        <div class="company-title">ZAARA <span>TRAVELS</span></div>
        <div class="md-name">MD Jahangir Khan</div>
        <div class="gstin-no">GSTIN No. 19ACUPH2897Q2ZA</div>
      </div>

      <div class="brand-right">
        <div>📱 Mobile: +91 9933992786</div>
        <div>🌐 Website: www.zaaratravel.com</div>
        <div>✉️ Email: info@zaaratravel.com</div>
      </div>
    </div>

    <!-- Dark Navy Address Ribbon Bar -->
    <div class="address-bar">
      📍 Address: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi, 110031
    </div>

    <!-- Document Title & Status Banner -->
    <div class="doc-banner">
      <div>
        <h2 class="doc-title">BOOKING CONFIRMATION VOUCHER</h2>
        <div class="doc-sub">Official Private Transport & Travel Access Document</div>
      </div>
      <div style="text-align: right;">
        <div class="ref-no">${data.bookingId}</div>
        <div class="status-pill">Status: ${data.paymentStatus} ✓</div>
      </div>
    </div>

    <div class="section-grid">
      <div class="box">
        <div class="box-title">Booking & Customer Details</div>
        <div class="box-content">
          <strong>Ref No:</strong> ${data.bookingId}<br>
          📅 <strong>Booking Date:</strong> ${data.bookingDate || 'Recent Confirmation'}<br>
          👤 <strong>Customer Name:</strong> ${data.guestName}<br>
          📱 <strong>Contact Details:</strong> ${data.guestPhone} | ${data.guestEmail}<br>
          👥 <strong>Guests:</strong> ${data.travelers.adults} Adults, ${data.travelers.children} Children
        </div>
      </div>

      <div class="box">
        <div class="box-title">Service & Route Details</div>
        <div class="box-content">
          🏷️ <strong>Service / Tour:</strong> ${data.tourTitle}<br>
          📅 <strong>Travel Date:</strong> ${data.travelDate}<br>
          📍 <strong>Pickup Details:</strong> ${data.pickupLocation || 'Hotel / Airport'} (${data.pickupTime || '06:00 AM'})<br>
          🚩 <strong>Drop Details:</strong> ${data.dropLocation || 'Hotel / Airport Destination'}<br>
          🚘 <strong>Vehicle Allocated:</strong> ${data.vehicleType}
        </div>
      </div>
    </div>

    <table class="price-table">
      <thead>
        <tr>
          <th>Payment Component</th>
          <th>Details & GST Rate</th>
          <th style="text-align: right;">Amount (INR / USD)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Base Amount</strong></td>
          <td>${data.tourTitle} • ${data.vehicleType} Base Fare</td>
          <td style="text-align: right;"><strong>₹${(data.baseAmountINR ?? Math.round(data.totalAmountINR / 1.05)).toLocaleString('en-IN')}</strong> (~$${data.baseAmountUSD ?? Math.round(data.totalAmountUSD / 1.05)})</td>
        </tr>
        <tr>
          <td><strong>Goods & Services Tax (GST @ 5%)</strong></td>
          <td>Govt Goods & Services Tax (GSTIN: 19ACUPH2897Q2ZA)</td>
          <td style="text-align: right; color: #b45309;"><strong>₹${(data.gstAmountINR ?? (data.totalAmountINR - Math.round(data.totalAmountINR / 1.05))).toLocaleString('en-IN')}</strong> (~$${data.gstAmountUSD ?? (data.totalAmountUSD - Math.round(data.totalAmountUSD / 1.05))})</td>
        </tr>
        <tr style="font-weight: 800; background: #f8fafc; font-size: 13px;">
          <td colspan="2" style="color: #0f172a;">Total Amount Payable (${data.paymentMethod}):</td>
          <td style="text-align: right; color: #0284c7; font-size: 14px;">₹${data.totalAmountINR.toLocaleString('en-IN')} (~$${data.totalAmountUSD} USD)</td>
        </tr>
      </tbody>
    </table>

    <div class="section-grid">
      <div class="box">
        <div class="box-title">Important Driver Instructions</div>
        <div class="box-content" style="font-size: 11.5px;">
          • Driver details & vehicle registration number dispatched via WhatsApp 12h prior.<br>
          • Punctual hotel / airport pickup guaranteed.<br>
          • All parking fees, interstate toll taxes & state permits are 100% prepaid.
        </div>
      </div>
      <div class="box">
        <div class="box-title">24/7 Helpline & Dispatch Desk</div>
        <div class="box-content" style="font-size: 11.5px;">
          WhatsApp / Primary: <strong>+91 99339 92786</strong> | Secondary: <strong>+91 99329 99786</strong><br>
          Office Landline: <strong>+011 69296175</strong> | Email: <strong>info@zaaratravel.com</strong>
        </div>
      </div>
    </div>

    <!-- Letterhead Footer Authorization Block -->
    <div class="letterhead-footer">
      <div class="seal-block">
        <div class="seal-circle">
          <div>ZAARA</div>
          <div style="color: #d97706;">★ SEAL ★</div>
          <div style="font-size: 6px;">GOVT REG.</div>
        </div>
        <div class="office-info">
          <strong>ZAARA TRAVELS HEAD OFFICE</strong><br>
          Address: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi 110031.<br>
          Govt. Registered Tour Operator • GSTIN: 19ACUPH2897Q2ZA
        </div>
      </div>

      <div class="sign-block">
        <div class="sign-title">MD Jahangir Khan</div>
        <div class="sign-sub">Managing Director & Authorized Signatory</div>
      </div>
    </div>

    <!-- Bottom Tagline -->
    <div class="bottom-tagline">
      — Your Journey, Our Passion. —
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
