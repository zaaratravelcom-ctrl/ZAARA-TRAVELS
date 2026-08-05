import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// -----------------------------------------------------------------------------
// PAYU CONFIGURATION & SHA-512 HELPERS
// -----------------------------------------------------------------------------
export const PAYU_CONFIG = {
  key: process.env.PAYU_MERCHANT_KEY || 'JP2V9q',
  salt: process.env.PAYU_MERCHANT_SALT || 'qwerty12345',
  env: process.env.PAYU_ENV || 'TEST',
  paymentUrl: (process.env.PAYU_ENV === 'LIVE' || process.env.PAYU_PAYMENT_URL?.includes('secure'))
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment',
};

/**
 * Generate PayU Request Hash (SHA-512)
 * Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 */
export function generatePayUHash(params: {
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
}): string {
  const amountStr = typeof params.amount === 'number' ? params.amount.toFixed(2) : parseFloat(params.amount).toFixed(2);
  const udf1 = params.udf1 || '';
  const udf2 = params.udf2 || '';
  const udf3 = params.udf3 || '';
  const udf4 = params.udf4 || '';
  const udf5 = params.udf5 || '';

  const hashString = `${PAYU_CONFIG.key}|${params.txnid}|${amountStr}|${params.productinfo}|${params.firstname}|${params.email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${PAYU_CONFIG.salt}`;
  
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

/**
 * Verify PayU Response Reverse Hash
 * Formula: sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 */
export function verifyPayUResponseHash(resParams: {
  status: string;
  txnid: string;
  amount: string | number;
  productinfo: string;
  firstname: string;
  email: string;
  hash: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  key?: string;
}): boolean {
  const amountStr = typeof resParams.amount === 'number' ? resParams.amount.toFixed(2) : parseFloat(resParams.amount).toFixed(2);
  const udf1 = resParams.udf1 || '';
  const udf2 = resParams.udf2 || '';
  const udf3 = resParams.udf3 || '';
  const udf4 = resParams.udf4 || '';
  const udf5 = resParams.udf5 || '';
  const keyToUse = resParams.key || PAYU_CONFIG.key;

  const reverseHashString = `${PAYU_CONFIG.salt}|${resParams.status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${resParams.email}|${resParams.firstname}|${resParams.productinfo}|${amountStr}|${resParams.txnid}|${keyToUse}`;
  
  const calculatedHash = crypto.createHash('sha512').update(reverseHashString).digest('hex');
  return calculatedHash.toLowerCase() === (resParams.hash || '').toLowerCase();
}

// -----------------------------------------------------------------------------
// PAYPAL CONFIGURATION & ORDER API HELPERS
// -----------------------------------------------------------------------------
export const PAYPAL_CONFIG = {
  clientId: process.env.PAYPAL_CLIENT_ID || 'AXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'EXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  mode: process.env.PAYPAL_MODE || 'sandbox',
  apiBase: process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com',
};

/**
 * Get PayPal OAuth2 Access Token
 */
export async function getPayPalAccessToken(): Promise<string | null> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return null;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64');
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.warn('PayPal auth failed:', await response.text());
      return null;
    }

    const data: any = await response.json();
    return data.access_token || null;
  } catch (err: any) {
    console.error('PayPal OAuth error:', err.message);
    return null;
  }
}

/**
 * Create PayPal Order via PayPal REST API v2
 */
export async function createPayPalOrder(amountUSD: number, bookingId: string, tourTitle: string) {
  const token = await getPayPalAccessToken();

  if (!token) {
    // Sandbox simulation mode when live PayPal keys are pending
    const simulatedOrderId = 'PAYPAL-ORD-' + Math.floor(100000 + Math.random() * 900000);
    return {
      id: simulatedOrderId,
      status: 'CREATED',
      simulated: true,
      approvalUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/paypal-approve?orderId=${simulatedOrderId}&bookingId=${bookingId}`,
    };
  }

  try {
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: bookingId,
            description: `Zaara Travels Reservation: ${tourTitle}`,
            amount: {
              currency_code: 'USD',
              value: amountUSD.toFixed(2),
            },
          },
        ],
        application_context: {
          brand_name: 'Zaara Travels',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/paypal-return?bookingId=${bookingId}`,
          cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/paypal-cancel?bookingId=${bookingId}`,
        },
      }),
    });

    const orderData: any = await response.json();
    const approveLink = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

    return {
      id: orderData.id,
      status: orderData.status,
      simulated: false,
      approvalUrl: approveLink,
    };
  } catch (err: any) {
    console.error('PayPal order creation error:', err.message);
    throw err;
  }
}

/**
 * Capture PayPal Payment Order
 */
export async function capturePayPalPayment(orderId: string) {
  const token = await getPayPalAccessToken();

  if (!token || orderId.startsWith('PAYPAL-ORD-')) {
    // Simulated capture for test mode
    return {
      status: 'COMPLETED',
      id: orderId,
      payer: { name: { given_name: 'Test', surname: 'Guest' } },
      simulated: true,
    };
  }

  try {
    const response = await fetch(`${PAYPAL_CONFIG.apiBase}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data: any = await response.json();
    return {
      status: data.status,
      id: data.id,
      payer: data.payer,
      simulated: false,
    };
  } catch (err: any) {
    console.error('PayPal capture error:', err.message);
    throw err;
  }
}

// -----------------------------------------------------------------------------
// UPI (BHIM / GOOGLE PAY / PHONEPE) HELPERS
// -----------------------------------------------------------------------------
export const UPI_CONFIG = {
  vpa: process.env.UPI_VPA || 'zaaratravels@icici',
  name: process.env.UPI_PAYEE_NAME || 'Zaara Travels',
  merchantCode: process.env.UPI_MERCHANT_CODE || '4722',
};

/**
 * Generate standard UPI Payment Link (upi://pay?pa=...)
 */
export function generateUPILink(amountINR: number, bookingId: string, guestName: string): {
  upiUri: string;
  qrUrl: string;
  vpa: string;
  payeeName: string;
} {
  const cleanName = encodeURIComponent(UPI_CONFIG.name);
  const note = encodeURIComponent(`Zaara Travels Booking ${bookingId}`);
  const amountStr = amountINR.toFixed(2);

  // Standard NPCI UPI URI
  const upiUri = `upi://pay?pa=${UPI_CONFIG.vpa}&pn=${cleanName}&tr=${bookingId}&tn=${note}&am=${amountStr}&cu=INR`;
  
  // High-resolution Google Chart QR code URL for scan-and-pay
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;

  return {
    upiUri,
    qrUrl,
    vpa: UPI_CONFIG.vpa,
    payeeName: UPI_CONFIG.name,
  };
}
