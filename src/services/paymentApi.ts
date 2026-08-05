import { validatePhoneFormat } from '../utils/phoneValidation';

export interface CreatePaymentOrderPayload {
  bookingId: string;
  gateway: 'payu' | 'paypal' | 'upi' | 'pay_on_arrival';
  paymentChoice?: 'full' | 'advance_25';
  amountINR: number;
  amountUSD: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  guideLanguage?: string;
  vehicleType?: string;
  hotelOption?: string;
  specialRequests?: string;
  travelers?: { adults: number; children: number };
}

export interface VerifyPaymentPayload {
  bookingId: string;
  gateway: 'payu' | 'paypal' | 'upi';
  paymentChoice?: 'full' | 'advance_25';
  payuResponse?: any;
  paypalOrderId?: string;
  upiTransactionRef?: string;
}

/**
 * Call Backend API to Create Payment Order
 */
export async function createPaymentOrder(payload: CreatePaymentOrderPayload) {
  try {
    const phoneVal = validatePhoneFormat(payload.guestPhone);
    if (!phoneVal.isValid) {
      throw new Error(phoneVal.error || 'Invalid mobile phone number format.');
    }

    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment order');
    }
    return data;
  } catch (error: any) {
    console.error('API createPaymentOrder error:', error);
    throw error;
  }
}

/**
 * Call Backend API to Verify Payment Response
 */
export async function verifyPayment(payload: VerifyPaymentPayload) {
  try {
    const response = await fetch('/api/payment/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('API verifyPayment error:', error);
    return { success: false, verified: false, message: error.message || 'Verification failed' };
  }
}

/**
 * Call Backend API to Check Booking Status
 */
export async function fetchBookingStatus(bookingId: string) {
  try {
    const response = await fetch(`/api/payment/status/${bookingId}`);
    return await response.json();
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
