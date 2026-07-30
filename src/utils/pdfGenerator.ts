import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface BookingPDFData {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  vehicleType: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod: string;
  paymentStatus: string;
  specialRequests?: string;
  travelers?: {
    adults: number;
    children?: number;
  };
  hotelOption?: string;
  inclusions?: string[];
  exclusions?: string[];
}

/**
 * Creates MD Jahangir Khan's handwritten digital signature on an in-memory canvas
 * matching his actual signature (Jahangir in cursive with top dot, swooping J, and underline flourish).
 */
export function createDigitalSignatureDataUri(): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, 320, 140);
    ctx.strokeStyle = '#0b1329'; // Dark navy ink
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Top Dot above J
    ctx.beginPath();
    ctx.arc(68, 22, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1329';
    ctx.fill();

    // 2. Swooping 'J' stem and bottom loop
    ctx.beginPath();
    ctx.moveTo(38, 48);
    ctx.lineTo(65, 28);
    ctx.lineTo(65, 108);
    ctx.quadraticCurveTo(63, 130, 32, 118);
    ctx.quadraticCurveTo(12, 106, 28, 90);
    ctx.quadraticCurveTo(40, 78, 85, 84);
    ctx.stroke();

    // 3. 'a'
    ctx.beginPath();
    ctx.arc(98, 80, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(106, 72);
    ctx.lineTo(106, 88);
    ctx.stroke();

    // 4. 'h'
    ctx.beginPath();
    ctx.moveTo(112, 52);
    ctx.lineTo(112, 88);
    ctx.quadraticCurveTo(124, 66, 132, 88);
    ctx.stroke();

    // 5. 'a'
    ctx.beginPath();
    ctx.arc(142, 80, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(150, 72);
    ctx.lineTo(150, 88);
    ctx.stroke();

    // 6. 'n'
    ctx.beginPath();
    ctx.moveTo(156, 72);
    ctx.lineTo(156, 88);
    ctx.quadraticCurveTo(166, 66, 174, 88);
    ctx.stroke();

    // 7. 'g' with deep loop
    ctx.beginPath();
    ctx.arc(184, 80, 8.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(192, 72);
    ctx.lineTo(192, 108);
    ctx.quadraticCurveTo(188, 130, 162, 118);
    ctx.quadraticCurveTo(152, 110, 168, 100);
    ctx.stroke();

    // 8. 'i' stem & dot
    ctx.beginPath();
    ctx.moveTo(200, 72);
    ctx.lineTo(200, 88);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(200, 60, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 9. 'r' stem and long sweeping loop to right
    ctx.beginPath();
    ctx.moveTo(208, 72);
    ctx.lineTo(208, 88);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(208, 72);
    ctx.quadraticCurveTo(220, 58, 230, 68);
    ctx.quadraticCurveTo(258, 22, 288, 50);
    ctx.quadraticCurveTo(310, 66, 248, 78);
    ctx.lineTo(120, 96);
    ctx.stroke();

    // 10. Underline stroke
    ctx.beginPath();
    ctx.moveTo(148, 102);
    ctx.lineTo(228, 90);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Signature canvas creation error:', err);
    return '';
  }
}

/**
 * Creates Zaara Travels Official Seal Badge as a high-definition transparent PNG
 */
export function createOfficialSealDataUri(): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, 180, 180);
    ctx.strokeStyle = '#0284c7'; // Sky / Gold blue seal
    ctx.lineWidth = 3.5;

    // Outer circle
    ctx.beginPath();
    ctx.arc(90, 90, 82, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(90, 90, 74, 0, Math.PI * 2);
    ctx.stroke();

    // Text content inside seal
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ZAARA TRAVELS', 90, 64);

    ctx.fillStyle = '#d97706';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★ OFFICIAL SEAL ★', 90, 84);

    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('GOVT. REG. OPERATOR', 90, 102);

    ctx.fillStyle = '#64748b';
    ctx.font = '9px monospace';
    ctx.fillText('GSTIN: 19ACUPH2897Q2ZA', 90, 120);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Seal canvas creation error:', err);
    return '';
  }
}

/**
 * Generates an ultra-premium, SINGLE-PAGE A4 PDF booking confirmation voucher document using jsPDF & jspdf-autotable.
 * Fits header, booking details, payment breakdown, inclusions/exclusions,
 * 24/7 helpline, official seal, and MD Jahangir Khan's digital signature seamlessly on Page 1.
 */
export function generateBookingPDF(data: BookingPDFData): {
  doc: jsPDF;
  pdfBase64: string;
  pdfDataUri: string;
  fileName: string;
} {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // slate-900 (#0f172a)
  const goldColor = [217, 119, 6]; // amber-600 (#d97706)
  const emeraldColor = [5, 150, 105]; // emerald-600 (#059669)

  // --------------------------------------------------------------------------
  // 1. TOP HEADER BANNER (Height: 27mm)
  // --------------------------------------------------------------------------
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 27, 'F');

  // Gold Accent line below header
  doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.rect(0, 27, 210, 2, 'F');

  // Header Title & Branding
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ZAARA TRAVELS', 12, 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Govt. Registered Tour Operator • www.zaaratravel.com', 12, 17);
  doc.text('Email: info@zaaratravel.com • Tel/WhatsApp: +91 99339 92786 • GSTIN: 19ACUPH2897Q2ZA', 12, 22);

  // Confirmed Voucher Badge
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.roundedRect(132, 4, 66, 19, 2.5, 2.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONFIRMED TOUR VOUCHER', 135, 10);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`REF ID: ${data.bookingId}`, 135, 15);
  doc.text(`Zaara Travels Management`, 135, 19);

  // --------------------------------------------------------------------------
  // 2. VOUCHER SUBHEADER (y: 32mm)
  // --------------------------------------------------------------------------
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Official Booking Confirmation & Tour Voucher`, 12, 33);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}  |  Status: ${data.paymentStatus.toUpperCase()}`, 132, 33);

  // --------------------------------------------------------------------------
  // 3. TABLE 1: GUEST & BOOKING DETAILS (y: 36mm)
  // --------------------------------------------------------------------------
  autoTable(doc, {
    startY: 36,
    head: [['BOOKING & GUEST DETAILS', 'CONFIRMED RESERVATION INFORMATION']],
    body: [
      ['Booking Reference ID', data.bookingId],
      ['Tour Package Selected', data.tourTitle],
      ['Primary Guest Name', data.guestName],
      ['Contact Phone / WhatsApp', data.guestPhone],
      ['Guest Email Address', data.guestEmail || 'info@zaaratravel.com'],
      ['Travel Date', data.travelDate],
      ['Pickup Time & Location', `${data.pickupTime || '06:00 AM'} @ ${data.pickupLocation || 'Hotel / Airport in Delhi'}`],
      ['Vehicle & Transport', `${data.vehicleType} (Air-Conditioned Private Transport)`],
      ['Special Requests', data.specialRequests || 'None specified'],
    ],
    theme: 'grid',
    styles: { cellPadding: 1.3 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 52, fillColor: [248, 250, 252] },
      1: { cellWidth: 134 },
    },
    margin: { left: 12, right: 12 },
  });

  // --------------------------------------------------------------------------
  // 4. TABLE 2: PAYMENT & FINANCIAL SUMMARY
  // --------------------------------------------------------------------------
  const table1Y = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: table1Y,
    head: [['PAYMENT SUMMARY', 'METHOD', 'TOTAL AMOUNT PAYABLE']],
    body: [
      ['Tour Base Cost', data.paymentMethod, `₹${data.totalAmountINR.toLocaleString('en-IN')}  ($${data.totalAmountUSD} USD)`],
      ['Payment Status', 'Booking Confirmation', `${data.paymentStatus.toUpperCase()} ✓`],
    ],
    theme: 'grid',
    styles: { cellPadding: 1.3 },
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 62 },
      1: { cellWidth: 54 },
      2: { fontStyle: 'bold', cellWidth: 70, textColor: [5, 150, 105] },
    },
    margin: { left: 12, right: 12 },
  });

  // --------------------------------------------------------------------------
  // 5. TABLE 3: INCLUSIONS & EXCLUSIONS SUMMARY
  // --------------------------------------------------------------------------
  const table2Y = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: table2Y,
    head: [['INCLUDED SERVICES & AMENITIES', 'EXCLUDED ITEMS']],
    body: [
      ['✓ Private AC Chauffeur Vehicle for entire duration', '✗ Monument Entrance Tickets & Passes'],
      ['✓ Fuel, Toll Taxes, Interstate Permits & Parking Fees', '✗ Personal Meals, Drinks & Shopping'],
      ['✓ Door-to-Door Hotel / Airport Pick-up & Drop-off', '✗ Driver & Guide Tips / Gratuities'],
      ['✓ Govt Approved Professional Local Tour Guide', '✗ Travel Insurance & Personal Expenses'],
      ['✓ Complimentary Chilled Bottled Mineral Water', ''],
      ['✓ 24/7 Helpline & Support by Zaara Travels', ''],
    ],
    theme: 'grid',
    styles: { cellPadding: 1.2 },
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 104, textColor: [5, 150, 105] },
      1: { cellWidth: 82, textColor: [100, 116, 139] },
    },
    margin: { left: 12, right: 12 },
  });

  // --------------------------------------------------------------------------
  // 6. 24/7 HELPLINE & EMERGENCY SUPPORT BANNER
  // --------------------------------------------------------------------------
  const helplineY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(0.4);
  doc.roundedRect(12, helplineY, 186, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('24/7 HELPLINE & EMERGENCY ASSISTANCE', 16, helplineY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  doc.text('Phone & WhatsApp: +91 99339 92786  |  Email: info@zaaratravel.com  |  www.zaaratravel.com', 16, helplineY + 12);

  // --------------------------------------------------------------------------
  // 7. AUTHORIZATION & DIGITAL SIGNATURE SECTION
  // --------------------------------------------------------------------------
  const signY = helplineY + 22;

  // Outer container box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, signY, 186, 36, 2, 2, 'FD');

  // Official Seal Image on Left
  const sealUri = createOfficialSealDataUri();
  if (sealUri) {
    try {
      doc.addImage(sealUri, 'PNG', 16, signY + 3, 30, 30);
    } catch (e) {
      console.warn('Seal embed notice:', e);
    }
  }

  // Office Address & Reg details in Center
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ZAARA TRAVELS HEAD OFFICE', 50, signY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.2);
  doc.text('Address: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031.', 50, signY + 14);
  doc.text('Government Registered Tour Operator (India) • GSTIN: 19ACUPH2897Q2ZA', 50, signY + 19);
  doc.text('Website: www.zaaratravel.com | Email: info@zaaratravel.com', 50, signY + 24);

  // Digital Signature Image on Right side above "Authorized Signature"
  const signatureUri = createDigitalSignatureDataUri();
  if (signatureUri) {
    try {
      doc.addImage(signatureUri, 'PNG', 135, signY + 2, 48, 18);
    } catch (e) {
      console.warn('Signature embed notice:', e);
    }
  }

  // Signature Line & Title with MD Jahangir Khan name
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.4);
  doc.line(135, signY + 21, 188, signY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('MD Jahangir Khan', 135, signY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(2, 132, 199);
  doc.text('Managing Director & Authorized Signatory', 135, signY + 29);

  // --------------------------------------------------------------------------
  // 8. FOOTER & PAGE NUMBER
  // --------------------------------------------------------------------------
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(12, 282, 198, 282);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(148, 163, 184);
  doc.text('This is an official computer-generated single-page tour voucher issued by Zaara Travels.', 12, 287);
  doc.text('GSTIN: 19ACUPH2897Q2ZA • Zaara Travels • www.zaaratravel.com', 12, 290);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Page 1 of 1', 182, 288);

  const fileName = `ZaaraTravels_Voucher_${data.bookingId}.pdf`;
  const pdfDataUri = doc.output('datauristring');
  const pdfBase64 = pdfDataUri.split(',')[1] || '';

  return {
    doc,
    pdfBase64,
    pdfDataUri,
    fileName,
  };
}

/**
 * Trigger immediate browser download of the PDF voucher.
 */
export function downloadBookingPDF(data: BookingPDFData) {
  const { doc, fileName } = generateBookingPDF(data);
  doc.save(fileName);
}
