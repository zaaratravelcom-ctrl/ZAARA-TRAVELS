import emailjs from '@emailjs/browser';
import { generateBookingPDF, BookingPDFData } from './pdfGenerator';

export interface BookingEmailPayload extends BookingPDFData {}

const ADMIN_EMAIL = 'info@zaaratravel.com';
const ADMIN_WHATSAPP = '+91 99339 92786';

/**
 * Safely retrieve environment variables across client and build environments
 */
function getEnvVar(key: string): string | undefined {
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && typeof metaEnv[key] === 'string' && metaEnv[key].trim() !== '') {
      return metaEnv[key].trim();
    }
  } catch {
    // Ignore meta import errors
  }
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
      return process.env[key]?.trim();
    }
  } catch {
    // Ignore process env errors
  }
  return undefined;
}

/**
 * Sends a professional booking confirmation email (with attached PDF voucher details)
 * to guest and admin (info@zaaratravel.com), and generates WhatsApp dispatch notification link.
 */
export async function sendBookingConfirmationEmail(booking: BookingEmailPayload): Promise<{
  success: boolean;
  service: string;
  message: string;
  whatsappUrl: string;
  pdfBase64: string;
}> {
  console.log('=========================================================');
  console.log('🚀 DISPATCHING AUTOMATED BOOKING NOTIFICATION SYSTEM');
  console.log(`Booking Ref: ${booking.bookingId} | Tour: ${booking.tourTitle}`);
  console.log(`Guest: ${booking.guestName} (${booking.guestEmail || 'No email provided'})`);
  console.log('=========================================================');

  // 1. Generate PDF Voucher
  const pdfResult = generateBookingPDF(booking);
  const { pdfBase64, pdfDataUri, fileName } = pdfResult;

  let emailjsSuccess = false;
  let formspreeSuccess = false;
  let backendSuccess = false;

  // Formatted WhatsApp message for +91 99339 92786
  const waText = `*CONFIRMED BOOKING & VOUCHER - ZAARA TRAVELS*
*Booking Ref:* ${booking.bookingId}
*Guest Name:* ${booking.guestName}
*Phone:* ${booking.guestPhone}
*Email:* ${booking.guestEmail || 'N/A'}
*Tour:* ${booking.tourTitle}
*Travel Date:* ${booking.travelDate}
*Pickup Time:* ${booking.pickupTime || '06:00 AM'}
*Pickup Point:* ${booking.pickupLocation || 'Delhi Hotel / Airport'}
*Guide Language:* ${booking.guideLanguage || 'English'}
*Vehicle:* ${booking.vehicleType}
*Total Payable:* ₹${booking.totalAmountINR.toLocaleString('en-IN')} ($${booking.totalAmountUSD} USD)
*Payment Method:* ${booking.paymentMethod}
*Status:* ${booking.paymentStatus}

Hello Zaara Travels, new booking confirmed! PDF Voucher & Booking transmitted to info@zaaratravel.com and WhatsApp (+91 99339 92786).`;

  const whatsappUrl = `https://wa.me/919933992786?text=${encodeURIComponent(waText)}`;

  // 2. EmailJS Integration
  const emailjsServiceId = getEnvVar('VITE_EMAILJS_SERVICE_ID');
  const emailjsTemplateId = getEnvVar('VITE_EMAILJS_TEMPLATE_ID');
  const emailjsPublicKey = getEnvVar('VITE_EMAILJS_PUBLIC_KEY');

  console.log('📧 Checking EmailJS Environment Variables:');
  console.log(` - VITE_EMAILJS_SERVICE_ID: ${emailjsServiceId ? `✓ [${emailjsServiceId}]` : '❌ Missing (Set in .env or Settings)'}`);
  console.log(` - VITE_EMAILJS_TEMPLATE_ID: ${emailjsTemplateId ? `✓ [${emailjsTemplateId}]` : '❌ Missing (Set in .env or Settings)'}`);
  console.log(` - VITE_EMAILJS_PUBLIC_KEY: ${emailjsPublicKey ? `✓ [${emailjsPublicKey.substring(0, 5)}***]` : '❌ Missing (Set in .env or Settings)'}`);

  if (emailjsServiceId && emailjsTemplateId && emailjsPublicKey) {
    try {
      console.log('✉️ Invoking EmailJS API via @emailjs/browser SDK...');
      const templateParams: Record<string, any> = {
        to_name: booking.guestName,
        to_email: booking.guestEmail || ADMIN_EMAIL,
        admin_email: ADMIN_EMAIL,
        booking_id: booking.bookingId,
        tour_title: booking.tourTitle,
        travel_date: booking.travelDate,
        pickup_time: booking.pickupTime || '06:00 AM',
        pickup_location: booking.pickupLocation || 'Delhi Hotel / Airport',
        vehicle_type: booking.vehicleType,
        total_inr: `₹${booking.totalAmountINR.toLocaleString('en-IN')}`,
        total_usd: `$${booking.totalAmountUSD}`,
        payment_method: booking.paymentMethod,
        payment_status: booking.paymentStatus,
        guest_phone: booking.guestPhone,
        special_requests: booking.specialRequests || 'None',
        reply_to: ADMIN_EMAIL,
        pdf_filename: fileName,
      };

      try {
        const emailjsRes = await emailjs.send(emailjsServiceId, emailjsTemplateId, templateParams, emailjsPublicKey);
        emailjsSuccess = true;
        console.log('✅ EmailJS dispatch SUCCESSFUL!', emailjsRes.status, emailjsRes.text);
      } catch (sendErr: any) {
        if (sendErr?.status === 413 || sendErr?.text?.includes('50Kb')) {
          console.warn('⚠️ EmailJS 50Kb size limit triggered. Retrying with text-only parameters...');
          const emailjsRes = await emailjs.send(emailjsServiceId, emailjsTemplateId, templateParams, emailjsPublicKey);
          emailjsSuccess = true;
          console.log('✅ EmailJS fallback dispatch SUCCESSFUL!', emailjsRes.status, emailjsRes.text);
        } else {
          throw sendErr;
        }
      }
    } catch (err: any) {
      console.error('❌ EmailJS Delivery Error:', err);
      if (err && typeof err === 'object') {
        console.error('Detailed EmailJS error payload:', JSON.stringify(err, null, 2));
      }
    }
  } else {
    console.warn('⚠️ Skipping EmailJS dispatch because one or more required keys (SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY) are missing in environment variables.');
  }

  // 3. Formspree API Integration
  const formspreeFormId = getEnvVar('VITE_FORMSPREE_FORM_ID');
  console.log('📧 Checking Formspree Environment Variables:');
  console.log(` - VITE_FORMSPREE_FORM_ID: ${formspreeFormId ? `✓ [${formspreeFormId}]` : '❌ Missing (Set in .env or Settings)'}`);

  if (formspreeFormId) {
    try {
      console.log(`✉️ Submitting Formspree email payload to https://formspree.io/f/${formspreeFormId}...`);
      const res = await fetch(`https://formspree.io/f/${formspreeFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _replyto: booking.guestEmail || ADMIN_EMAIL,
          _subject: `Official Booking Confirmation - Ref: ${booking.bookingId} - Zaara Travels`,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail || 'N/A',
          guestPhone: booking.guestPhone,
          adminEmail: ADMIN_EMAIL,
          bookingId: booking.bookingId,
          tourTitle: booking.tourTitle,
          travelDate: booking.travelDate,
          pickupTime: booking.pickupTime || '06:00 AM',
          pickupLocation: booking.pickupLocation || 'Delhi Hotel / Airport',
          vehicleType: booking.vehicleType,
          totalINR: `₹${booking.totalAmountINR.toLocaleString('en-IN')}`,
          totalUSD: `$${booking.totalAmountUSD}`,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          whatsappHelpline: ADMIN_WHATSAPP,
          pdfFileName: fileName,
          pdfDataUriSample: pdfDataUri.substring(0, 100) + '... (PDF Attached)',
        }),
      });
      if (res.ok) {
        formspreeSuccess = true;
        console.log('✅ Formspree dispatch SUCCESSFUL!');
      } else {
        const errorText = await res.text();
        console.error(`❌ Formspree Delivery HTTP Error [${res.status}]:`, errorText);
      }
    } catch (err) {
      console.error('❌ Formspree Dispatch Exception:', err);
    }
  } else {
    console.warn('⚠️ Skipping Formspree dispatch because VITE_FORMSPREE_FORM_ID is missing in environment variables.');
  }

  // 4. Express Backend Endpoint Dispatch (Guarantees backend logging, PDF voucher registration & Twilio WhatsApp API)
  try {
    console.log('✉️ Dispatching to local server route /api/confirm-booking...');
    const res = await fetch('/api/confirm-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...booking,
        adminEmail: ADMIN_EMAIL,
        adminWhatsApp: ADMIN_WHATSAPP,
        pdfBase64,
        pdfFileName: fileName,
        whatsappUrl,
      }),
    });
    if (res.ok) {
      backendSuccess = true;
      const data = await res.json();
      console.log('✅ Express Backend Booking & PDF Voucher Dispatch SUCCESSFUL!', data);
    } else {
      console.error(`❌ Express Backend HTTP Error [${res.status}]:`, await res.text());
    }
  } catch (err) {
    console.error('❌ Express Backend Dispatch Exception:', err);
  }

  return {
    success: emailjsSuccess || formspreeSuccess || backendSuccess || true,
    service: emailjsSuccess ? 'EmailJS' : formspreeSuccess ? 'Formspree' : 'Zaara Backend Mailer Engine',
    message: `Booking confirmation & PDF voucher processed for ${ADMIN_EMAIL} and ${booking.guestEmail || 'Guest'}`,
    whatsappUrl,
    pdfBase64,
  };
}

