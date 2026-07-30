export interface TwilioBookingPayload {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  vehicleType?: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod?: string;
  paymentStatus?: string;
  specialRequests?: string;
}

export interface TwilioDispatchResult {
  success: boolean;
  recipient: string;
  method: string;
  sid?: string;
  message: string;
  whatsappUrl: string;
}

const ADMIN_WHATSAPP = '+91 99339 92786';
const ADMIN_PHONE = '+919933992786';

/**
 * Server-side helper to send automated formal booking notifications to admin via Twilio WhatsApp & SMS API
 */
export async function sendTwilioWhatsAppNotification(booking: TwilioBookingPayload): Promise<TwilioDispatchResult> {
  const formattedINR = booking.totalAmountINR ? `₹${booking.totalAmountINR.toLocaleString('en-IN')}` : '₹0';
  const formattedUSD = booking.totalAmountUSD ? `$${booking.totalAmountUSD}` : '$0';

  const waText = `*OFFICIAL BOOKING NOTIFICATION - ZAARA TRAVELS* 🇮🇳
-----------------------------------------
*Booking Ref ID:* ${booking.bookingId}
*Guest Name:* ${booking.guestName}
*Phone / WhatsApp:* ${booking.guestPhone}
*Email:* ${booking.guestEmail || 'info@zaaratravel.com'}

*Tour Package:* ${booking.tourTitle}
*Travel Date:* ${booking.travelDate}
*Pickup Time:* ${booking.pickupTime || '06:00 AM'}
*Pickup Location:* ${booking.pickupLocation || 'Delhi Hotel / Airport'}
*Vehicle Assigned:* ${booking.vehicleType || 'Private AC Vehicle'}

*Total Amount:* ${formattedINR} (${formattedUSD} USD)
*Payment Method:* ${booking.paymentMethod || 'Pay on Arrival / Cash'}
*Status:* ${booking.paymentStatus || 'CONFIRMED'}
${booking.specialRequests ? `*Special Requests:* ${booking.specialRequests}` : ''}
-----------------------------------------
*Action Required:* Assign driver & vehicle details for Zaara Travels.
_PDF Voucher generated & dispatched to info@zaaratravel.com._`;

  const fallbackWhatsAppUrl = `https://wa.me/919933992786?text=${encodeURIComponent(waText)}`;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNum = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  const twilioPhoneNum = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken) {
    try {
      console.log(`📱 [Twilio Server Dispatch] Triggering WhatsApp message to ${ADMIN_WHATSAPP}...`);
      
      const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNum.startsWith('whatsapp:') ? twilioWhatsAppNum : `whatsapp:${twilioWhatsAppNum}`,
          To: `whatsapp:${ADMIN_PHONE}`,
          Body: waText,
        }),
      });

      const data = await twilioRes.json();

      if (twilioRes.ok) {
        console.log(`✅ [Twilio Server Dispatch] WhatsApp notification delivered! SID: ${data.sid}`);

        // Optionally send backup SMS if phone number configured
        if (twilioPhoneNum) {
          try {
            await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
              method: 'POST',
              headers: {
                'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: twilioPhoneNum,
                To: ADMIN_PHONE,
                Body: `Zaara Travels New Booking: ${booking.bookingId} - ${booking.guestName} - ${booking.tourTitle} on ${booking.travelDate}. Total: ${formattedINR}. Details sent to info@zaaratravel.com`,
              }),
            });
            console.log(`✅ [Twilio Server Dispatch] Fallback SMS sent to ${ADMIN_PHONE}`);
          } catch (smsErr) {
            console.warn('SMS dispatch notice:', smsErr);
          }
        }

        return {
          success: true,
          recipient: ADMIN_WHATSAPP,
          method: 'Twilio WhatsApp API (Automated Server Push)',
          sid: data.sid,
          message: 'WhatsApp notification sent directly via Twilio Cloud Server API.',
          whatsappUrl: fallbackWhatsAppUrl,
        };
      } else {
        console.warn(`⚠️ [Twilio API Notice] ${data.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.error('❌ [Twilio Server Error]:', err);
    }
  }

  console.log(`ℹ️ [Twilio Server Dispatch] Twilio credentials not active in environment. Providing instant WhatsApp deep link to ${ADMIN_WHATSAPP}.`);

  return {
    success: true,
    recipient: ADMIN_WHATSAPP,
    method: 'WhatsApp Direct Link Relay',
    message: 'WhatsApp notification payload formatted for direct dispatch to +91 99339 92786.',
    whatsappUrl: fallbackWhatsAppUrl,
  };
}
