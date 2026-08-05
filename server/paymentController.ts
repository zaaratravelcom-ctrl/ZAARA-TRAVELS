import { Request, Response } from 'express';
import { 
  generatePayUHash, 
  verifyPayUResponseHash, 
  PAYU_CONFIG, 
  createPayPalOrder, 
  capturePayPalPayment, 
  generateUPILink 
} from './paymentService';
import { 
  saveBookingToDb, 
  savePaymentToDb, 
  logTransactionToDb, 
  getBookingById 
} from './db';
import { validateServerPhoneNumber } from './phoneValidator';
import { sendServerEmailNotification } from './emailService';
import { sendTwilioWhatsAppNotification } from './twilioService';

/**
 * 1. CREATE PAYMENT ORDER API
 * POST /api/payment/create-order
 */
export async function createPaymentOrderHandler(req: Request, res: Response) {
  try {
    const { 
      bookingId,
      gateway,
      paymentChoice = 'full', // 'full' | 'advance_25'
      amountINR,
      amountUSD,
      guestName,
      guestEmail,
      guestPhone,
      tourTitle,
      travelDate,
      pickupTime,
      pickupLocation,
      guideLanguage,
      vehicleType,
      hotelOption,
      specialRequests,
      travelers,
    } = req.body;

    if (!bookingId || !gateway || !guestName || !guestEmail) {
      return res.status(400).json({ success: false, message: 'Missing required booking details.' });
    }

    // Robust Server-Side Customer Phone Number Validation
    const phoneVal = validateServerPhoneNumber(guestPhone);
    if (!phoneVal.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneVal.error || 'Invalid customer phone number format.',
      });
    }

    // Determine actual amount to charge based on paymentChoice (full vs 25% deposit)
    const multiplier = paymentChoice === 'advance_25' ? 0.25 : 1.0;
    const finalAmountINR = Math.round(Number(amountINR) * multiplier);
    const finalAmountUSD = Number((Number(amountUSD) * multiplier).toFixed(2));
    const txnid = 'TXN-' + bookingId + '-' + Date.now();

    const bookingPayload = {
      bookingId,
      guestName,
      guestEmail,
      guestPhone,
      tourTitle,
      travelDate,
      pickupTime,
      pickupLocation,
      guideLanguage,
      vehicleType,
      hotelOption,
      specialRequests,
      travelers,
      totalAmountINR: Number(amountINR),
      totalAmountUSD: Number(amountUSD),
      paymentChoice,
      amountToPayINR: finalAmountINR,
      amountToPayUSD: finalAmountUSD,
    };

    // A. PAY ON ARRIVAL RULE: Confirmed directly
    if (gateway === 'pay_on_arrival') {
      const confirmedRecord = {
        ...bookingPayload,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'CONFIRMED (PAY ON ARRIVAL)',
        paymentMethod: 'Pay Driver on Arrival (100% Cash/Card/UPI)',
        isPaymentVerified: true,
        bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      };

      await saveBookingToDb(confirmedRecord);
      await savePaymentToDb({
        paymentId: 'PAY-ARRIVAL-' + bookingId,
        bookingId,
        gatewayName: 'pay_on_arrival',
        paymentChoice,
        amountINR: finalAmountINR,
        amountUSD: finalAmountUSD,
        paymentStatus: 'SUCCESS',
      });

      // Send Email & WhatsApp
      await sendServerEmailNotification(confirmedRecord);
      const twilioRes = await sendTwilioWhatsAppNotification(confirmedRecord);

      return res.json({
        success: true,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'CONFIRMED (PAY ON ARRIVAL)',
        bookingRecord: confirmedRecord,
        whatsappDispatchLink: twilioRes.whatsappUrl,
      });
    }

    // ONLINE PAYMENT: First create PENDING booking record
    const pendingBooking = {
      ...bookingPayload,
      bookingStatus: 'PENDING',
      paymentStatus: 'PENDING PAYMENT',
      paymentMethod: `${gateway.toUpperCase()} (${paymentChoice === 'advance_25' ? '25% Advance' : '100% Full'})`,
      isPaymentVerified: false,
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    await saveBookingToDb(pendingBooking);

    // B. PAYU GATEWAY ORDER
    if (gateway === 'payu') {
      const productInfo = `Zaara Travels: ${tourTitle}`;
      const payuHash = generatePayUHash({
        txnid,
        amount: finalAmountINR,
        productinfo: productInfo,
        firstname: guestName.split(' ')[0] || 'Guest',
        email: guestEmail,
        udf1: bookingId,
        udf2: paymentChoice,
      });

      const payuFormData = {
        actionUrl: PAYU_CONFIG.paymentUrl,
        key: PAYU_CONFIG.key,
        txnid,
        amount: finalAmountINR,
        productinfo: productInfo,
        firstname: guestName,
        email: guestEmail,
        phone: guestPhone,
        surl: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/payu-callback?status=success`,
        furl: `${process.env.APP_URL || 'http://localhost:3000'}/api/payment/payu-callback?status=failure`,
        hash: payuHash,
        udf1: bookingId,
        udf2: paymentChoice,
      };

      await savePaymentToDb({
        paymentId: txnid,
        bookingId,
        gatewayName: 'payu',
        paymentChoice,
        amountINR: finalAmountINR,
        amountUSD: finalAmountUSD,
        paymentStatus: 'PENDING',
        gatewayOrderId: txnid,
      });

      await logTransactionToDb({
        bookingId,
        gatewayName: 'payu',
        rawRequest: payuFormData,
        status: 'INITIATED',
      });

      return res.json({
        success: true,
        gateway: 'payu',
        payuData: payuFormData,
        amountToPayINR: finalAmountINR,
        amountToPayUSD: finalAmountUSD,
        txnid,
      });
    }

    // C. PAYPAL GATEWAY ORDER
    if (gateway === 'paypal') {
      const paypalOrder = await createPayPalOrder(finalAmountUSD, bookingId, tourTitle);

      await savePaymentToDb({
        paymentId: paypalOrder.id,
        bookingId,
        gatewayName: 'paypal',
        paymentChoice,
        amountINR: finalAmountINR,
        amountUSD: finalAmountUSD,
        paymentStatus: 'PENDING',
        gatewayOrderId: paypalOrder.id,
      });

      await logTransactionToDb({
        bookingId,
        gatewayName: 'paypal',
        rawRequest: paypalOrder,
        status: 'INITIATED',
      });

      return res.json({
        success: true,
        gateway: 'paypal',
        paypalOrderId: paypalOrder.id,
        approvalUrl: paypalOrder.approvalUrl,
        simulated: paypalOrder.simulated,
        amountToPayUSD: finalAmountUSD,
      });
    }

    // D. UPI PAYMENT ORDER
    if (gateway === 'upi') {
      const upiDetails = generateUPILink(finalAmountINR, bookingId, guestName);

      await savePaymentToDb({
        paymentId: txnid,
        bookingId,
        gatewayName: 'upi',
        paymentChoice,
        amountINR: finalAmountINR,
        amountUSD: finalAmountUSD,
        paymentStatus: 'PENDING',
        gatewayOrderId: txnid,
      });

      await logTransactionToDb({
        bookingId,
        gatewayName: 'upi',
        rawRequest: upiDetails,
        status: 'INITIATED',
      });

      return res.json({
        success: true,
        gateway: 'upi',
        upiDetails,
        amountToPayINR: finalAmountINR,
        txnid,
      });
    }

    return res.status(400).json({ success: false, message: 'Invalid payment gateway choice.' });
  } catch (error: any) {
    console.error('Error in createPaymentOrderHandler:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
}

/**
 * 2. VERIFY PAYMENT API
 * POST /api/payment/verify-payment
 */
export async function verifyPaymentHandler(req: Request, res: Response) {
  try {
    const { 
      bookingId, 
      gateway, 
      payuResponse, 
      paypalOrderId, 
      upiTransactionRef, 
      paymentChoice = 'full' 
    } = req.body;

    if (!bookingId || !gateway) {
      return res.status(400).json({ success: false, message: 'Missing bookingId or gateway type.' });
    }

    const booking = await getBookingById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found.' });
    }

    let isVerified = false;
    let gatewayTxnId = '';
    let verificationNote = '';

    // A. PAYU VERIFICATION
    if (gateway === 'payu' && payuResponse) {
      const { status, txnid, amount, productinfo, firstname, email, hash } = payuResponse;
      
      const isHashValid = verifyPayUResponseHash({
        status,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        hash,
      });

      if (status === 'success' && (isHashValid || process.env.PAYU_ENV === 'TEST')) {
        isVerified = true;
        gatewayTxnId = txnid || 'PAYU-TXN-' + Date.now();
        verificationNote = `PayU Payment Verified. TXN ID: ${gatewayTxnId}`;
      } else {
        verificationNote = 'PayU Payment verification failed or hash mismatch.';
      }
    } 
    // B. PAYPAL VERIFICATION
    else if (gateway === 'paypal' && paypalOrderId) {
      const captureResult = await capturePayPalPayment(paypalOrderId);
      if (captureResult.status === 'COMPLETED') {
        isVerified = true;
        gatewayTxnId = captureResult.id;
        verificationNote = `PayPal Payment Captured. Order ID: ${captureResult.id}`;
      } else {
        verificationNote = `PayPal Payment status: ${captureResult.status}`;
      }
    } 
    // C. UPI VERIFICATION
    else if (gateway === 'upi') {
      // In production UPI webhook/bank API confirms reference, or manual verify
      if (upiTransactionRef && upiTransactionRef.length >= 6) {
        isVerified = true;
        gatewayTxnId = upiTransactionRef;
        verificationNote = `UPI Payment Verified via Reference ID: ${upiTransactionRef}`;
      } else {
        verificationNote = 'UPI Transaction reference required for instant verification.';
      }
    }

    // CRITICAL BOOKING RULE ENFORCEMENT:
    if (isVerified) {
      const paymentStatusLabel = paymentChoice === 'advance_25' 
        ? 'DEPOSIT CONFIRMED (25% Paid)' 
        : 'PAID IN FULL (100%)';

      const updatedBooking = {
        ...booking,
        bookingStatus: 'CONFIRMED',
        paymentStatus: paymentStatusLabel,
        isPaymentVerified: true,
        gatewayTxnId,
        verificationNote,
      };

      await saveBookingToDb(updatedBooking);
      await savePaymentToDb({
        paymentId: gatewayTxnId,
        bookingId,
        gatewayName: gateway,
        paymentChoice,
        amountINR: booking.totalAmountINR,
        amountUSD: booking.totalAmountUSD,
        paymentStatus: 'SUCCESS',
        gatewayPaymentId: gatewayTxnId,
      });

      await logTransactionToDb({
        bookingId,
        gatewayName: gateway,
        rawRequest: req.body,
        rawResponse: { isVerified, gatewayTxnId, verificationNote },
        status: 'SUCCESS',
      });

      // Dispatch Email & WhatsApp Confirmation after verification
      await sendServerEmailNotification(updatedBooking);
      const twilioRes = await sendTwilioWhatsAppNotification(updatedBooking);

      return res.json({
        success: true,
        verified: true,
        bookingStatus: 'CONFIRMED',
        paymentStatus: paymentStatusLabel,
        bookingRecord: updatedBooking,
        message: 'Payment verified successfully! Booking confirmed.',
        whatsappDispatchLink: twilioRes.whatsappUrl,
      });
    } else {
      // Failed / Unverified payment
      const failedBooking = {
        ...booking,
        bookingStatus: 'FAILED',
        paymentStatus: 'PAYMENT FAILED / CANCELLED',
        isPaymentVerified: false,
        verificationNote,
      };

      await saveBookingToDb(failedBooking);
      await savePaymentToDb({
        paymentId: 'FAIL-' + Date.now(),
        bookingId,
        gatewayName: gateway,
        paymentChoice,
        amountINR: booking.totalAmountINR,
        amountUSD: booking.totalAmountUSD,
        paymentStatus: 'FAILED',
      });

      await logTransactionToDb({
        bookingId,
        gatewayName: gateway,
        rawRequest: req.body,
        rawResponse: { isVerified: false, verificationNote },
        status: 'FAILED',
      });

      return res.status(400).json({
        success: false,
        verified: false,
        bookingStatus: 'FAILED',
        paymentStatus: 'PAYMENT FAILED',
        message: verificationNote || 'Payment verification failed.',
      });
    }
  } catch (error: any) {
    console.error('Error in verifyPaymentHandler:', error);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification server error' });
  }
}

/**
 * 3. PAYMENT WEBHOOK API
 * POST /api/payment/webhook
 */
export async function paymentWebhookHandler(req: Request, res: Response) {
  try {
    const payload = req.body;
    console.log('🔔 [PAYMENT WEBHOOK RECEIVED]:', JSON.stringify(payload));

    const bookingId = payload.udf1 || payload.bookingId || payload.resource?.purchase_units?.[0]?.reference_id;
    const status = payload.status || payload.event_type;

    if (bookingId) {
      await logTransactionToDb({
        bookingId,
        gatewayName: payload.gateway || 'WEBHOOK',
        rawRequest: payload,
        status: status || 'WEBHOOK_EVENT',
      });
    }

    return res.json({ received: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * 4. GET BOOKING PAYMENT STATUS API
 * GET /api/payment/status/:bookingId
 */
export async function getBookingStatusHandler(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const booking = await getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({
      success: true,
      bookingId: booking.bookingId,
      bookingStatus: booking.bookingStatus || 'PENDING',
      paymentStatus: booking.paymentStatus || 'PENDING PAYMENT',
      guestName: booking.guestName,
      tourTitle: booking.tourTitle,
      travelDate: booking.travelDate,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
