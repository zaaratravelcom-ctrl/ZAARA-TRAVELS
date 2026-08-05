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
  dropLocation?: string;
  bookingDate?: string;
  guideLanguage?: string;
  vehicleType: string;
  baseAmountINR?: number;
  gstAmountINR?: number;
  baseAmountUSD?: number;
  gstAmountUSD?: number;
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
 * Creates Zaara Travels Brand Logo as a high-definition transparent PNG
 */
export function createZaaraLogoDataUri(): string {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, 200, 200);

    // 1. Outer Gold Ring
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(100, 100, 92, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Navy Background Circle
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(100, 100, 87, 0, Math.PI * 2);
    ctx.fill();

    // 3. Inner Thin Gold Circle
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(100, 100, 82, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Stylized Taj Mahal Emblem in Gold
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(100, 85, 22, Math.PI, Math.PI * 2);
    ctx.lineTo(122, 105);
    ctx.lineTo(78, 105);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(98, 52, 4, 12);
    ctx.beginPath();
    ctx.arc(100, 50, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillRect(66, 75, 4, 30);
    ctx.fillRect(130, 75, 4, 30);
    ctx.fillRect(64, 70, 8, 5);
    ctx.fillRect(128, 70, 8, 5);

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(100, 105, 12, Math.PI, Math.PI * 2);
    ctx.fill();

    // 5. "ZAARA TRAVELS" Brand Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ZAARA', 100, 138);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('TRAVELS', 100, 156);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('★ INDIA ★', 100, 172);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Logo canvas creation error:', err);
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
    ctx.strokeStyle = '#0284c7';
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
    ctx.font = 'bold 9px monospace';
    ctx.fillText('GSTIN: 19ACUPH2897Q2ZA', 90, 120);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('Seal canvas creation error:', err);
    return '';
  }
}

let masterLetterheadCache: string = '';

/**
 * Renders the exact master letterhead background matching Zaara_Travels_Official_Letterhead.pdf
 * onto an in-memory high-res A4 canvas (1240 x 1754 px) and returns a PNG Data URI.
 */
export function generateMasterLetterheadBackgroundDataUri(): string {
  masterLetterheadCache = ''; // Clear cache to guarantee fresh background canvas rendering
  if (typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 0. White Canvas Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 1240, 1754);

    // Note: Top Letterhead Header section removed as requested for a clean, full-width document start.

    // 3. CENTER WATERMARK (Y: 820 to 1020)
    ctx.save();
    ctx.translate(620, 920);
    ctx.globalAlpha = 0.08;

    ctx.font = '900 115px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f52ba';
    ctx.textAlign = 'center';
    ctx.fillText('Zaara® Travels', 0, -20);

    ctx.font = 'bold 44px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f52ba';
    ctx.fillText('www.zaaratravel.com', 0, 48);

    ctx.restore();

    // 4. BOTTOM FOOTER SECTION (Y: 1440 to 1754)
    // Official Seal Badge on Left (X: 220, Y: 1490)
    const sealX = 220;
    const sealY = 1490;

    // Outer seal circle
    ctx.strokeStyle = '#0b1736';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#0f52ba';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sealX, sealY, 70, 0, Math.PI * 2);
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillStyle = '#0b1736';
    ctx.fillText('★ ZAARA TRAVELS ★', sealX, sealY - 42);

    // Blue banner inside seal
    ctx.fillStyle = '#0f52ba';
    ctx.fillRect(sealX - 60, sealY - 26, 120, 26);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Official Seal', sealX, sealY - 8);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Govt. Reg. Company', sealX, sealY + 12);
    ctx.font = 'bold 11px monospace';
    ctx.fillText('GSTIN-19ACUPH2897Q2ZA', sealX, sealY + 30);

    // Signature on Right (X: 1020, Y: 1480)
    const sigX = 1020;
    const sigY = 1480;

    // Handwritten Signature in Navy Blue Ink
    ctx.strokeStyle = '#0f52ba';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // J dot
    ctx.arc(sigX - 90, sigY - 45, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#0f52ba';
    ctx.fill();
    // J stem
    ctx.moveTo(sigX - 110, sigY - 25);
    ctx.lineTo(sigX - 90, sigY - 45);
    ctx.lineTo(sigX - 90, sigY + 30);
    ctx.quadraticCurveTo(sigX - 92, sigY + 50, sigX - 120, sigY + 38);
    ctx.quadraticCurveTo(sigX - 140, sigY + 25, sigX - 120, sigY + 10);
    ctx.quadraticCurveTo(sigX - 100, sigY, sigX - 50, sigY + 8);
    // a-h-a-n-g-i-r loops
    ctx.quadraticCurveTo(sigX - 20, sigY - 15, sigX, sigY + 8);
    ctx.quadraticCurveTo(sigX + 20, sigY - 25, sigX + 40, sigY + 10);
    ctx.quadraticCurveTo(sigX + 70, sigY - 40, sigX + 90, sigY + 5);
    ctx.stroke();

    // Text below signature
    ctx.textAlign = 'center';
    ctx.font = 'bold 24px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('Jahangir Khan', sigX, sigY + 45);
    ctx.font = 'bold 19px "Helvetica Neue", Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Zaara Travels', sigX, sigY + 70);

    // SWEEPING BOTTOM NAVY & GOLD WAVE BANDS (Y: 1580 to 1720)
    ctx.fillStyle = '#0b1736';
    ctx.beginPath();
    ctx.moveTo(0, 1680);
    ctx.bezierCurveTo(350, 1540, 850, 1620, 1240, 1530);
    ctx.lineTo(1240, 1720);
    ctx.lineTo(0, 1720);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(0, 1705);
    ctx.bezierCurveTo(400, 1585, 800, 1655, 1240, 1575);
    ctx.lineTo(1240, 1720);
    ctx.lineTo(0, 1720);
    ctx.closePath();
    ctx.fill();

    // White gap at bottom for tagline bar
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 1718, 1240, 36);

    // TAGLINE AT VERY BOTTOM CENTER
    ctx.font = 'bolditalic 24px Georgia, serif';
    ctx.fillStyle = '#d97706';
    ctx.textAlign = 'center';
    ctx.fillText('—  Your Journey, Our Passion.  —', 620, 1744);

    masterLetterheadCache = canvas.toDataURL('image/png');
    return masterLetterheadCache;
  } catch (err) {
    console.warn('Master letterhead background creation error:', err);
    return '';
  }
}

/**
 * Common reusable function to render the OFFICIAL ZAARA TRAVELS LETTERHEAD HEADER.
 * Embeds the master letterhead background image and places document banner/titles.
 */
export function applyCommonLetterheadHeader(
  doc: jsPDF,
  options?: {
    documentTitle?: string;
    documentSubtitle?: string;
    badgeText?: string;
    badgeColor?: [number, number, number];
  }
): number {
  // 1. EMBED THE MASTER LETTERHEAD BACKGROUND IMAGE ON PAGE
  const masterBg = generateMasterLetterheadBackgroundDataUri();
  if (masterBg) {
    try {
      doc.addImage(masterBg, 'PNG', 0, 0, 210, 297);
    } catch (e) {
      console.warn('Background letterhead embed error:', e);
    }
  }

  // 2. DOCUMENT TITLE / SUBTITLE / BADGE BANNER (Clean top alignment at Y = 12mm)
  let nextY = 12;

  if (options?.documentTitle) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(options.documentTitle, 12, 16);

    if (options.documentSubtitle) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(options.documentSubtitle, 12, 20.5);
    }

    if (options.badgeText) {
      const bColor = options.badgeColor || [5, 150, 105];
      doc.setFillColor(bColor[0], bColor[1], bColor[2]);
      doc.roundedRect(132, 12, 66, 8, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(options.badgeText, 165, 17.5, { align: 'center' });
    }

    nextY = options.documentSubtitle ? 23 : 20;
  }

  return nextY;
}

/**
 * Subtle background watermark on every letterhead page
 */
export function applyLetterheadWatermark(doc: jsPDF) {
  // Handled inside generateMasterLetterheadBackgroundDataUri
}

/**
 * Common reusable function to render page numbering & master background across pages.
 */
export function applyCommonLetterheadFooter(
  doc: jsPDF,
  currentPage: number,
  totalPages: number,
  docTypeStr: string = 'Official Document'
) {
  // For page 2+, ensure background is drawn
  if (currentPage > 1) {
    const masterBg = generateMasterLetterheadBackgroundDataUri();
    if (masterBg) {
      try {
        doc.addImage(masterBg, 'PNG', 0, 0, 210, 297);
      } catch (e) {
        console.warn('Page background embed error:', e);
      }
    }
  }

  // Page numbering on bottom right margin
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`Page ${currentPage} of ${totalPages}`, 198, 286, { align: 'right' });
}

/**
 * Generates an ultra-premium A4 PDF BOOKING CONFIRMATION document with common letterhead.
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

  const bookingDateStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // 1. APPLY COMMON ZAARA TRAVELS LETTERHEAD HEADER
  const startY = applyCommonLetterheadHeader(doc, {
    documentTitle: 'BOOKING CONFIRMATION VOUCHER',
    documentSubtitle: 'Official Driver Assignment & Travel Access Voucher',
    badgeText: 'Booking Status: CONFIRMED ✓',
    badgeColor: [5, 150, 105],
  });

  // 2. BOOKING & TRAVEL DETAILS TABLE
  const adults = data.travelers?.adults || 1;
  const children = data.travelers?.children || 0;
  const guestCountStr = `${adults} Adult(s)${children > 0 ? `, ${children} Child(ren)` : ''}`;
  const effectiveBookingDate = data.bookingDate || bookingDateStr;

  autoTable(doc, {
    startY: startY + 2,
    head: [['BOOKING & CUSTOMER DETAILS', '', 'SERVICE & VEHICLE DETAILS', '']],
    body: [
      ['Booking Reference No:', data.bookingId, 'Service / Tour Name:', data.tourTitle],
      ['Booking Date:', effectiveBookingDate, 'Travel Date:', data.travelDate],
      ['Customer Name:', data.guestName, 'Vehicle Allocated:', data.vehicleType],
      ['Contact Details:', `${data.guestPhone} | ${data.guestEmail || 'info@zaaratravel.com'}`, 'Pickup Details:', `${data.pickupLocation || 'Hotel / Airport'} (${data.pickupTime || '06:00 AM'})`],
      ['Number of Guests:', guestCountStr, 'Drop Details:', data.dropLocation || 'Hotel / Airport Destination'],
      ['Guide Language:', data.guideLanguage || 'English / Multi', 'Special Requests:', data.specialRequests || 'None'],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 1.6,
      fontSize: 7.8,
      fontStyle: 'bold',
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [11, 23, 54],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
      3: { fontStyle: 'bold', cellWidth: 55 },
    },
    margin: { left: 12, right: 12 },
  });

  // 3. PAYMENT DETAILS & GST BREAKDOWN TABLE
  const table1Y = (doc as any).lastAutoTable.finalY + 3;

  const baseAmountINR = data.baseAmountINR ?? Math.round(data.totalAmountINR / 1.05);
  const gstAmountINR = data.gstAmountINR ?? (data.totalAmountINR - baseAmountINR);
  const baseAmountUSD = data.baseAmountUSD ?? Math.round(data.totalAmountUSD / 1.05);
  const gstAmountUSD = data.gstAmountUSD ?? (data.totalAmountUSD - baseAmountUSD);

  autoTable(doc, {
    startY: table1Y,
    head: [['PAYMENT COMPONENT', 'TAX & CHARGES RATE', 'AMOUNT (INR / USD)']],
    body: [
      [
        'Base Amount:',
        'Net Fare / Service Base',
        `₹${baseAmountINR.toLocaleString('en-IN')} (~$${baseAmountUSD} USD)`,
      ],
      [
        'Goods & Services Tax (GST @ 5%):',
        '5.0% CGST+SGST (GSTIN: 19ACUPH2897Q2ZA)',
        `₹${gstAmountINR.toLocaleString('en-IN')} (~$${gstAmountUSD} USD)`,
      ],
      [
        'Total Amount Payable:',
        `Payment Method: ${data.paymentMethod} (${data.paymentStatus.toUpperCase()})`,
        `₹${data.totalAmountINR.toLocaleString('en-IN')} (~$${data.totalAmountUSD} USD)`,
      ],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 1.8,
      fontSize: 8,
      fontStyle: 'bold',
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 56, fontStyle: 'bold' },
      2: { cellWidth: 60, fontStyle: 'bold', textColor: [5, 150, 105] },
    },
    margin: { left: 12, right: 12 },
  });

  // 4. PACKAGE INCLUDES & EXCLUDES TABLE
  const table2Y = (doc as any).lastAutoTable.finalY + 3;

  const defaultIncludes = [
    '✓ Private AC Vehicle & Professional Driver for entire duration',
    '✓ Fuel, Toll Taxes, Interstate Permits & Parking Fees',
    '✓ Door-to-Door Hotel / Airport Pick-up & Drop-off',
    '✓ Govt Approved Professional Local Tour Guide',
    '✓ Complimentary Chilled Bottled Mineral Water',
    '✓ 24/7 Helpline & Support by Zaara Travels',
  ];

  const defaultExcludes = [
    '✗ Monument Entrance Tickets & Passes',
    '✗ Personal Meals, Drinks & Shopping',
    '✗ Driver & Guide Tips / Gratuities',
    '✗ Travel Insurance & Personal Expenses',
    '',
    '',
  ];

  const incList = (data.inclusions && data.inclusions.length > 0)
    ? data.inclusions.map((i) => `✓ ${i}`).join('\n')
    : defaultIncludes.join('\n');

  const excList = (data.exclusions && data.exclusions.length > 0)
    ? data.exclusions.map((e) => `✗ ${e}`).join('\n')
    : defaultExcludes.join('\n');

  autoTable(doc, {
    startY: table2Y,
    head: [['PACKAGE INCLUDES', 'PACKAGE EXCLUDES']],
    body: [[incList, excList]],
    theme: 'grid',
    styles: {
      cellPadding: 2,
      valign: 'top',
      fontSize: 7.2,
      fontStyle: 'bold',
    },
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 100, textColor: [5, 150, 105], fontStyle: 'bold' },
      1: { cellWidth: 86, textColor: [100, 116, 139], fontStyle: 'bold' },
    },
    margin: { left: 12, right: 12 },
  });

  // 5. IMPORTANT TERMS & CONDITIONS
  const termsY = (doc as any).lastAutoTable.finalY + 3;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, termsY, 186, 24, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Important Terms & Driver Instructions', 15, termsY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);

  const terms = [
    '• Driver details & vehicle number will be transmitted via WhatsApp 12 hours before pickup.',
    '• All interstate toll taxes, state permits, driver fees and parking charges are prepaid by Zaara Travels.',
    '• Guests must carry a valid photo ID/Passport for monument check-ins.',
    '• 24/7 Helpline & Dispatch support available at +91 99339 92786.',
  ];

  terms.forEach((term, index) => {
    doc.text(term, 15, termsY + 8.5 + (index * 3.5));
  });

  // 6. APPLY COMMON ZAARA TRAVELS LETTERHEAD FOOTER
  applyCommonLetterheadFooter(doc, 1, 1, 'Booking Confirmation');

  const fileName = `ZaaraTravels_Booking_${data.bookingId}.pdf`;
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
 * Generates an official GST TAX INVOICE PDF document with common letterhead.
 */
export function generateBookingInvoicePDF(data: BookingPDFData): {
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

  const invoiceDateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // 1. APPLY COMMON ZAARA TRAVELS LETTERHEAD HEADER
  const startY = applyCommonLetterheadHeader(doc, {
    documentTitle: 'OFFICIAL GST TAX INVOICE',
    documentSubtitle: 'Tax Invoice under Rule 46 of CGST Rules, 2017',
    badgeText: 'INVOICE STATUS: PAID ✓',
    badgeColor: [5, 150, 105],
  });

  // 2. INVOICE META & BILLED TO DETAILS TABLE
  autoTable(doc, {
    startY: startY + 2,
    head: [['INVOICE & TAX DETAILS', '', 'CUSTOMER / BILLED TO DETAILS', '']],
    body: [
      ['Invoice Number:', `INV-ZT-${data.bookingId}`, 'Customer Name:', data.guestName],
      ['Invoice Date:', invoiceDateStr, 'Mobile / Phone:', data.guestPhone],
      ['GSTIN (Supplier):', '19ACUPH2897Q2ZA', 'Customer Email:', data.guestEmail || 'info@zaaratravel.com'],
      ['SAC Code:', '9985 (Tour Operator Services)', 'Place of Supply:', 'Delhi (DL / 07)'],
      ['Booking Reference:', data.bookingId, 'Service Category:', 'Passenger Transport & Tour Services'],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 1.8,
      fontSize: 7.8,
      fontStyle: 'bold',
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [11, 23, 54],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
      1: { fontStyle: 'bold', cellWidth: 55 },
      2: { fontStyle: 'bold', fillColor: [241, 245, 249], cellWidth: 38 },
      3: { fontStyle: 'bold', cellWidth: 55 },
    },
    margin: { left: 12, right: 12 },
  });

  // 3. ITEMIZED BREAKDOWN TABLE
  const table1Y = (doc as any).lastAutoTable.finalY + 4;

  const basePrice = Math.round(data.totalAmountINR / 1.05);
  const gstAmount = data.totalAmountINR - basePrice;
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;

  autoTable(doc, {
    startY: table1Y,
    head: [['S.NO', 'SERVICE DESCRIPTION', 'SAC', 'TAXABLE VAL', 'GST RATE', 'NET AMOUNT']],
    body: [
      [
        '1',
        `${data.tourTitle}\nVehicle: ${data.vehicleType} | Travel Date: ${data.travelDate}\nIncludes Chauffeur, Fuel, Interstate Tolls & State Tax Permits`,
        '9985',
        `₹${basePrice.toLocaleString('en-IN')}`,
        '5.0% (GST)',
        `₹${basePrice.toLocaleString('en-IN')}`,
      ],
      [
        '2',
        'Central Goods & Service Tax (CGST @ 2.5%)',
        '9985',
        `₹${basePrice.toLocaleString('en-IN')}`,
        '2.5%',
        `₹${cgstAmount.toLocaleString('en-IN')}`,
      ],
      [
        '3',
        'State Goods & Service Tax (SGST @ 2.5%)',
        '9985',
        `₹${basePrice.toLocaleString('en-IN')}`,
        '2.5%',
        `₹${sgstAmount.toLocaleString('en-IN')}`,
      ],
      [
        '',
        'GRAND TOTAL INVOICE AMOUNT (INCL. ALL TAXES):',
        '',
        '',
        '',
        `₹${data.totalAmountINR.toLocaleString('en-IN')} (~$${data.totalAmountUSD} USD)`,
      ],
    ],
    theme: 'grid',
    styles: {
      cellPadding: 2,
      fontSize: 7.8,
      textColor: [15, 23, 42],
    },
    headStyles: {
      fillColor: [217, 119, 6],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 12, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 90, fontStyle: 'bold' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: 12, right: 12 },
  });

  // 4. PAYMENT & DECLARATION BLOCK
  const table2Y = (doc as any).lastAutoTable.finalY + 4;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(12, table2Y, 186, 26, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Gateway & Statutory Tax Declaration', 15, table2Y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`• Payment Mode: ${data.paymentMethod} | Status: ${data.paymentStatus.toUpperCase()} (100% Fully Settled)`, 15, table2Y + 9);
  doc.text('• Statutory Declaration: We declare that this invoice shows the actual price of services described and details are true.', 15, table2Y + 13);
  doc.text('• Composition Scheme: GST calculated @ 5% under passenger transport & tour operator service rules.', 15, table2Y + 17);
  doc.text('• Computer Generated Invoice: Digitally authorized & signed by Zaara Travels.', 15, table2Y + 21);

  // 5. APPLY COMMON ZAARA TRAVELS LETTERHEAD FOOTER
  applyCommonLetterheadFooter(doc, 1, 1, 'Official Tax Invoice');

  const fileName = `ZaaraTravels_Invoice_${data.bookingId}.pdf`;
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
 * Generates a complete printable PDF itinerary document for a TourPackage with common letterhead.
 */
export function generateTourItineraryPDF(
  tour: {
    id: string;
    title: string;
    duration: string;
    cities: string[];
    priceFromINR: number;
    priceFromUSD: number;
    rating: number;
    reviewsCount: number;
    overview: string;
    highlights: string[];
    itinerary: {
      day: number;
      title: string;
      description: string;
      stayOrLocation: string;
    }[];
    included: string[];
    excluded: string[];
  },
  currency: string = 'USD',
  rates: Record<string, number> = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, AUD: 1.52, CAD: 1.38, SGD: 1.35, AED: 3.67 }
): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. APPLY COMMON ZAARA TRAVELS LETTERHEAD HEADER
  const startY = applyCommonLetterheadHeader(doc, {
    documentTitle: tour.title,
    documentSubtitle: `Duration: ${tour.duration} | Route: ${tour.cities.join(' -> ')} | Rating: ${tour.rating} / 5.0`,
    badgeText: `Price: ₹${tour.priceFromINR.toLocaleString('en-IN')} / $${tour.priceFromUSD} USD`,
    badgeColor: [217, 119, 6],
  });

  // 2. OVERVIEW & HIGHLIGHTS TABLE
  const highlightsList = tour.highlights.map((h) => `• ${h}`).join('\n');

  autoTable(doc, {
    startY: startY + 2,
    head: [['TOUR OVERVIEW & KEY HIGHLIGHTS']],
    body: [
      [`${tour.overview}\n\nKEY HIGHLIGHTS:\n${highlightsList}`],
    ],
    theme: 'grid',
    styles: { cellPadding: 2.5 },
    headStyles: {
      fillColor: [11, 23, 54],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    margin: { left: 12, right: 12 },
  });

  // 3. DAY-BY-DAY SCHEDULE TABLE
  const dayRows = tour.itinerary.map((item) => [
    `Day ${item.day}`,
    item.stayOrLocation,
    `${item.title.toUpperCase()}\n${item.description}`,
  ]);

  const prevFinalY = (doc as any).lastAutoTable.finalY + 4;

  autoTable(doc, {
    startY: prevFinalY,
    head: [['DAY', 'LOCATION / STAY', 'DETAILED DAY ITINERARY SCHEDULE']],
    body: dayRows,
    theme: 'grid',
    styles: { cellPadding: 2, valign: 'top' },
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18, fillColor: [248, 250, 252], textColor: [217, 119, 6] },
      1: { fontStyle: 'bold', cellWidth: 38, textColor: [15, 23, 42] },
      2: { cellWidth: 130 },
    },
    margin: { left: 12, right: 12 },
  });

  // 4. INCLUSIONS & EXCLUSIONS TABLE
  const incList = tour.included.map((i) => `✓ ${i}`).join('\n');
  const excList = tour.excluded.map((e) => `✗ ${e}`).join('\n');

  const prevFinalY2 = (doc as any).lastAutoTable.finalY + 4;

  autoTable(doc, {
    startY: prevFinalY2,
    head: [['WHAT IS INCLUDED IN THIS TOUR', 'WHAT IS EXCLUDED']],
    body: [
      [incList, excList],
    ],
    theme: 'grid',
    styles: { cellPadding: 2.5, valign: 'top' },
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 7.2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
    },
    columnStyles: {
      0: { cellWidth: 104, textColor: [5, 150, 105] },
      1: { cellWidth: 82, textColor: [100, 116, 139] },
    },
    margin: { left: 12, right: 12 },
  });

  // 5. APPLY COMMON ZAARA TRAVELS LETTERHEAD FOOTER ACROSS ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyCommonLetterheadFooter(doc, i, totalPages, 'Tour Itinerary');
  }

  const cleanTitle = tour.title.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `ZaaraTravels_Itinerary_${tour.id}_${cleanTitle}.pdf`;

  return { doc, fileName };
}

/**
 * Downloads a custom AI-generated itinerary as a printable PDF with common letterhead.
 */
export function downloadCustomItineraryPDF(
  result: {
    itineraryTitle: string;
    overview: string;
    days: {
      day: number;
      title: string;
      activities: string[];
      stayLocation: string;
      insiderTip?: string;
    }[];
    recommendedVehicle: string;
    estimatedPriceRange: string;
    includedServices: string[];
    whatsappSummary: string;
  },
  duration?: string,
  travelers?: string
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // 1. APPLY COMMON ZAARA TRAVELS LETTERHEAD HEADER
  const startY = applyCommonLetterheadHeader(doc, {
    documentTitle: result.itineraryTitle || 'CUSTOM TRAVEL ITINERARY',
    documentSubtitle: `Duration: ${duration || 'Custom'} Days | Guests: ${travelers || 'Private Group'} | Vehicle: ${result.recommendedVehicle}`,
    badgeText: `Est: ${result.estimatedPriceRange || 'Custom Quote'}`,
    badgeColor: [2, 132, 199],
  });

  // 2. OVERVIEW
  autoTable(doc, {
    startY: startY + 2,
    head: [['CUSTOM TRIP OVERVIEW']],
    body: [[result.overview]],
    theme: 'grid',
    styles: { cellPadding: 2.5 },
    headStyles: { fillColor: [11, 23, 54], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    margin: { left: 12, right: 12 },
  });

  // 3. DAY SCHEDULE & ACTIVITIES
  const dayRows = (result.days || []).map((d) => [
    `Day ${d.day}`,
    d.stayLocation,
    `${d.title.toUpperCase()}\n${(d.activities || []).map((a) => `• ${a}`).join('\n')}${d.insiderTip ? `\n\n💡 Insider Tip: ${d.insiderTip}` : ''}`,
  ]);

  const prevY = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: prevY,
    head: [['DAY', 'LOCATION', 'DAY SCHEDULE & ACTIVITIES']],
    body: dayRows,
    theme: 'grid',
    styles: { cellPadding: 2, valign: 'top' },
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 18, textColor: [217, 119, 6] },
      1: { fontStyle: 'bold', cellWidth: 38 },
      2: { cellWidth: 130 },
    },
    margin: { left: 12, right: 12 },
  });

  // 4. INCLUDED SERVICES
  const incList = (result.includedServices || []).map((s) => `✓ ${s}`).join('\n');
  const prevY2 = (doc as any).lastAutoTable.finalY + 4;
  autoTable(doc, {
    startY: prevY2,
    head: [['INCLUDED SERVICES & DRIVER AMENITIES']],
    body: [[incList]],
    theme: 'grid',
    styles: { cellPadding: 2.5 },
    headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 7.5, textColor: [5, 150, 105] },
    margin: { left: 12, right: 12 },
  });

  // 5. APPLY COMMON ZAARA TRAVELS LETTERHEAD FOOTER ACROSS ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    applyCommonLetterheadFooter(doc, i, totalPages, 'Custom AI Itinerary');
  }

  const cleanTitle = (result.itineraryTitle || 'Custom_Itinerary').replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`ZaaraTravels_Custom_Itinerary_${cleanTitle}.pdf`);
}

/**
 * Download booking confirmation PDF directly.
 */
export function downloadBookingPDF(data: BookingPDFData) {
  const { doc, fileName } = generateBookingPDF(data);
  doc.save(fileName);
}

/**
 * Download GST Tax Invoice PDF directly.
 */
export function downloadInvoicePDF(data: BookingPDFData) {
  const { doc, fileName } = generateBookingInvoicePDF(data);
  doc.save(fileName);
}

/**
 * Download tour itinerary PDF directly.
 */
export function downloadTourItineraryPDF(tour: any, currency?: string, rates?: Record<string, number>) {
  const { doc, fileName } = generateTourItineraryPDF(tour, currency, rates);
  doc.save(fileName);
}
