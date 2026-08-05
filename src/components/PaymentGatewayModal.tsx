import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Lock, CreditCard, Smartphone, Banknote, CheckCircle2, 
  AlertCircle, ArrowRight, Copy, Check, QrCode, RefreshCw, AlertTriangle
} from 'lucide-react';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { createPaymentOrder, verifyPayment } from '../services/paymentApi';
import { openPrintableVoucher } from '../utils/voucherGenerator';

export interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
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
    vehicleType?: string;
    hotelOption?: string;
    specialRequests?: string;
    totalAmountINR: number;
    totalAmountUSD: number;
    travelers?: { adults: number; children: number };
    initialGateway?: 'payu' | 'paypal' | 'upi' | 'pay_on_arrival';
    initialChoice?: 'advance_25' | 'full' | 'arrival';
  } | null;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onBookingConfirmed: (confirmedRecord: any) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  currency,
  rates = FALLBACK_RATES_FROM_USD,
  onBookingConfirmed,
}) => {
  const [paymentChoice, setPaymentChoice] = useState<'advance_25' | 'full'>('advance_25');
  const [selectedGateway, setSelectedGateway] = useState<'payu' | 'paypal' | 'upi' | 'pay_on_arrival'>('payu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // UPI Specific state
  const [upiRefInput, setUpiRefInput] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);
  
  // PayU response simulation / integration state
  const [payuOrderData, setPayuOrderData] = useState<any | null>(null);
  const [upiOrderDetails, setUpiOrderDetails] = useState<any | null>(null);
  const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(null);

  useEffect(() => {
    if (bookingData) {
      if (bookingData.initialGateway) {
        setSelectedGateway(bookingData.initialGateway);
      }
      if (bookingData.initialChoice === 'arrival') {
        setSelectedGateway('pay_on_arrival');
      } else if (bookingData.initialChoice === 'advance_25' || bookingData.initialChoice === 'full') {
        setPaymentChoice(bookingData.initialChoice);
      }
    }
  }, [bookingData?.bookingId, bookingData?.initialGateway, bookingData?.initialChoice]);

  if (!isOpen || !bookingData) return null;

  const multiplier = paymentChoice === 'advance_25' ? 0.25 : 1.0;
  const amountToPayINR = Math.round(bookingData.totalAmountINR * multiplier);
  const amountToPayUSD = Number((bookingData.totalAmountUSD * multiplier).toFixed(2));

  const formattedAmountToPay = formatConvertedPrice(amountToPayUSD, amountToPayINR, currency, rates);
  const formattedTotalFare = formatConvertedPrice(bookingData.totalAmountUSD, bookingData.totalAmountINR, currency, rates);

  // Handle Pay on Arrival
  const handlePayOnArrival = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await createPaymentOrder({
        ...bookingData,
        gateway: 'pay_on_arrival',
        paymentChoice,
        amountINR: bookingData.totalAmountINR,
        amountUSD: bookingData.totalAmountUSD,
      });

      if (response.success && response.bookingRecord) {
        onBookingConfirmed(response.bookingRecord);
        onClose();
      } else {
        setErrorMessage(response.message || 'Failed to confirm Pay on Arrival booking.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Server error confirming booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 1: Initialize Payment Order via Backend
  const handleInitiateOnlinePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const orderRes = await createPaymentOrder({
        ...bookingData,
        gateway: selectedGateway,
        paymentChoice,
        amountINR: bookingData.totalAmountINR,
        amountUSD: bookingData.totalAmountUSD,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      if (selectedGateway === 'payu') {
        setPayuOrderData(orderRes.payuData);
      } else if (selectedGateway === 'upi') {
        setUpiOrderDetails(orderRes.upiDetails);
      } else if (selectedGateway === 'paypal') {
        setPaypalApprovalUrl(orderRes.approvalUrl || null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not initiate online payment');
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Verify Payment Response
  const handleVerifyOnlinePayment = async (verifyPayload: {
    payuResponse?: any;
    paypalOrderId?: string;
    upiRef?: string;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const verifyRes = await verifyPayment({
        bookingId: bookingData.bookingId,
        gateway: selectedGateway as 'payu' | 'paypal' | 'upi',
        paymentChoice,
        payuResponse: verifyPayload.payuResponse,
        paypalOrderId: verifyPayload.paypalOrderId,
        upiTransactionRef: verifyPayload.upiRef,
      });

      if (verifyRes.success && verifyRes.verified) {
        onBookingConfirmed(verifyRes.bookingRecord);
        onClose();
      } else {
        setErrorMessage(verifyRes.message || 'Payment verification failed. Booking not confirmed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error during payment verification');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyUPIToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted Checkout
              </span>
              <h3 className="text-lg font-black text-white">Payment & Reservation Desk</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* Booking Summary Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">Selected Reservation</span>
              <h4 className="text-sm font-black text-slate-900">{bookingData.tourTitle}</h4>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Ref: <strong className="text-sky-700">{bookingData.bookingId}</strong> • Date: <strong>{bookingData.travelDate}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right bg-white p-2.5 rounded-xl border border-slate-200 w-full sm:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Trip Fare</span>
              <span className="text-lg font-black text-slate-900">{formattedTotalFare}</span>
            </div>
          </div>

          {/* Error Message Notice */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-900 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Payment Error</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Payment Amount Choice Selector (25% Deposit vs 100% Full) */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
              Step 1: Choose Amount to Pay Now
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentChoice('advance_25')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  paymentChoice === 'advance_25'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-xs font-black text-slate-900 block">25% Advance Deposit</span>
                  <span className="text-[11px] font-medium text-slate-500 block">Lock seats now, pay 75% on arrival</span>
                </div>
                <div className="text-right font-black text-amber-700 text-sm">
                  {formatConvertedPrice(Number((bookingData.totalAmountUSD * 0.25).toFixed(2)), Math.round(bookingData.totalAmountINR * 0.25), currency, rates)}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentChoice('full')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  paymentChoice === 'full'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <span className="text-xs font-black text-slate-900 block">100% Full Payment</span>
                  <span className="text-[11px] font-medium text-slate-500 block">Instant 100% full voucher confirmation</span>
                </div>
                <div className="text-right font-black text-slate-900 text-sm">
                  {formattedTotalFare}
                </div>
              </button>
            </div>
          </div>

          {/* Payment Gateway Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider block">
              Step 2: Choose Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* PayU */}
              <button
                type="button"
                onClick={() => { setSelectedGateway('payu'); setPayuOrderData(null); setUpiOrderDetails(null); setPaypalApprovalUrl(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedGateway === 'payu'
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">PayU Gateway</div>
                  <div className="text-[10px] text-slate-500 font-medium">Credit/Debit Cards, NetBanking</div>
                </div>
              </button>

              {/* UPI */}
              <button
                type="button"
                onClick={() => { setSelectedGateway('upi'); setPayuOrderData(null); setUpiOrderDetails(null); setPaypalApprovalUrl(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedGateway === 'upi'
                    ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">UPI (GPay / PhonePe / BHIM)</div>
                  <div className="text-[10px] text-slate-500 font-medium">Scan QR Code or Instant UPI Link</div>
                </div>
              </button>

              {/* PayPal */}
              <button
                type="button"
                onClick={() => { setSelectedGateway('paypal'); setPayuOrderData(null); setUpiOrderDetails(null); setPaypalApprovalUrl(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedGateway === 'paypal'
                    ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">PayPal International</div>
                  <div className="text-[10px] text-slate-500 font-medium">International Credit Cards / USD</div>
                </div>
              </button>

              {/* Pay on Arrival */}
              <button
                type="button"
                onClick={() => { setSelectedGateway('pay_on_arrival'); setPayuOrderData(null); setUpiOrderDetails(null); setPaypalApprovalUrl(null); }}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                  selectedGateway === 'pay_on_arrival'
                    ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">Pay Driver on Arrival</div>
                  <div className="text-[10px] text-slate-500 font-medium">100% Cash / Card / UPI on pickup</div>
                </div>
              </button>

            </div>
          </div>

          {/* Interactive Gateway Specific Steps */}
          
          {/* A. PAY ON ARRIVAL */}
          {selectedGateway === 'pay_on_arrival' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Pay on Arrival Booking Confirmation</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                You have chosen to pay the total fare of <strong>{formattedTotalFare}</strong> directly to your assigned Zaara Travels private driver on the pickup date (<strong>{bookingData.travelDate}</strong>).
              </p>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePayOnArrival}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm Reservation Directly (Pay on Arrival)</span>
              </button>
            </div>
          )}

          {/* B. PAYU GATEWAY DISPLAY */}
          {selectedGateway === 'payu' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900 uppercase">PayU Payment Checkout</h5>
                  <p className="text-xs text-slate-500">Payable Amount: <strong className="text-emerald-700">{formattedAmountToPay}</strong></p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                  SHA-512 Secured
                </span>
              </div>

              {!payuOrderData ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleInitiateOnlinePayment}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 text-emerald-400" />}
                  <span>Generate Secured PayU Order ({formattedAmountToPay})</span>
                </button>
              ) : (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PayU SHA-512 Hash Generated Successfully.</span>
                  </div>

                  <p className="text-slate-600">
                    Click below to launch the PayU payment portal or simulate verification:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleVerifyOnlinePayment({
                        payuResponse: {
                          status: 'success',
                          txnid: payuOrderData.txnid,
                          amount: payuOrderData.amount,
                          productinfo: payuOrderData.productinfo,
                          firstname: payuOrderData.firstname,
                          email: payuOrderData.email,
                          hash: payuOrderData.hash,
                        }
                      })}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-center shadow transition flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Complete & Verify PayU Payment</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* C. UPI GATEWAY DISPLAY */}
          {selectedGateway === 'upi' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900 uppercase">Google Pay / PhonePe / BHIM UPI</h5>
                  <p className="text-xs text-slate-500">Amount: <strong className="text-sky-700">{formattedAmountToPay}</strong></p>
                </div>
                <span className="bg-sky-100 text-sky-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                  NPCI Instant UPI
                </span>
              </div>

              {!upiOrderDetails ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleInitiateOnlinePayment}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4 text-sky-400" />}
                  <span>Generate UPI Scan QR Code ({formattedAmountToPay})</span>
                </button>
              ) : (
                <div className="space-y-4 bg-white p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <img 
                      src={upiOrderDetails.qrUrl} 
                      alt="UPI Scan QR" 
                      className="w-36 h-36 border-2 border-slate-200 rounded-xl shadow-sm shrink-0" 
                    />
                    <div className="space-y-2 text-xs w-full">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Official UPI ID (VPA)</span>
                        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200 font-mono font-bold text-slate-800">
                          <span>{upiOrderDetails.vpa}</span>
                          <button
                            type="button"
                            onClick={() => copyUPIToClipboard(upiOrderDetails.vpa)}
                            className="ml-auto text-sky-600 hover:text-sky-800"
                          >
                            {copiedVpa ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <a
                        href={upiOrderDetails.upiUri}
                        className="inline-flex items-center justify-center gap-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-black py-2 px-3 rounded-lg text-xs transition"
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Open in UPI App (GPay/PhonePe)
                      </a>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-[11px] font-extrabold text-slate-700 block">
                      Enter UPI Transaction Ref / UTR No. after payment:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiRefInput}
                        onChange={(e) => setUpiRefInput(e.target.value)}
                        placeholder="e.g., 421899120485"
                        className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-mono"
                      />
                      <button
                        type="button"
                        disabled={isProcessing || !upiRefInput.trim()}
                        onClick={() => handleVerifyOnlinePayment({ upiRef: upiRefInput })}
                        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition"
                      >
                        {isProcessing ? 'Verifying...' : 'Verify UTR'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* D. PAYPAL GATEWAY DISPLAY */}
          {selectedGateway === 'paypal' && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-black text-slate-900 uppercase">PayPal International Checkout</h5>
                  <p className="text-xs text-slate-500">Amount: <strong className="text-indigo-700">${amountToPayUSD} USD</strong></p>
                </div>
                <span className="bg-indigo-100 text-indigo-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase">
                  PayPal REST v2
                </span>
              </div>

              {!paypalApprovalUrl ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleInitiateOnlinePayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4 text-indigo-200" />}
                  <span>Initiate PayPal Checkout (${amountToPayUSD} USD)</span>
                </button>
              ) : (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <p className="text-slate-700 font-semibold">
                    Click below to approve payment with your PayPal account or International Card:
                  </p>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleVerifyOnlinePayment({ paypalOrderId: 'PAYPAL-ORD-' + Date.now() })}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-4 rounded-xl shadow transition flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Complete & Capture PayPal Payment (${amountToPayUSD} USD)</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> Zaara Travels Official Desk
          </span>
          <span className="font-bold text-slate-700">Helpline: +91 99339 92786</span>
        </div>

      </div>
    </div>
  );
};
