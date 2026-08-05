export interface TwilioBookingPayload {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  guideLanguage?: string;
  vehicleType?: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentMethod?: string;
  paymentStatus?: string;
  specialRequests?: string;
}

export interface TwilioDispatchResponse {
  success: boolean;
  recipient: string;
  whatsappUrl: string;
  message: string;
  twilioResult?: any;
}

const ADMIN_WHATSAPP = '+91 99339 92786';

/**
 * Triggers structured Twilio WhatsApp notification to +91 99339 92786 via backend server API route
 */
export async function triggerTwilioWhatsAppNotification(
  booking: TwilioBookingPayload
): Promise<TwilioDispatchResponse> {
  console.log('📱 Dispatching Twilio WhatsApp booking notification to +91 99339 92786...');

  try {
    const res = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(booking),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('✅ Twilio WhatsApp Server API Response:', data);
      return {
        success: data.success ?? true,
        recipient: ADMIN_WHATSAPP,
        whatsappUrl: data.whatsappUrl || data.whatsappDispatchLink,
        message: data.message || 'WhatsApp notification processed for +91 99339 92786',
        twilioResult: data.twilioResult,
      };
    } else {
      console.error(`❌ Twilio WhatsApp API Route Error [HTTP ${res.status}]:`, await res.text());
    }
  } catch (err) {
    console.error('❌ Failed to communicate with /api/send-whatsapp server endpoint:', err);
  }

  // Direct WhatsApp Deep Link Fallback
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
*Guide Language:* ${booking.guideLanguage || 'English'}
*Vehicle Assigned:* ${booking.vehicleType || 'Private AC Vehicle'}

*Total Amount:* ${formattedINR} (${formattedUSD} USD)
*Payment Method:* ${booking.paymentMethod || 'Pay on Arrival / Cash'}
*Status:* ${booking.paymentStatus || 'CONFIRMED'}
-----------------------------------------
_Action Required: Assign driver & vehicle details for Zaara Travels (+91 99339 92786)._`;

  const fallbackUrl = `https://wa.me/919933992786?text=${encodeURIComponent(waText)}`;

  return {
    success: true,
    recipient: ADMIN_WHATSAPP,
    whatsappUrl: fallbackUrl,
    message: 'WhatsApp message link ready for +91 99339 92786',
  };
}
