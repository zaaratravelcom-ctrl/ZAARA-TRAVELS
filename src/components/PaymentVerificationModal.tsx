import React from 'react';
import { 
  X, ShieldCheck, AlertTriangle, Lock, Clock, CheckCircle2, ArrowRight, Banknote, CreditCard, Smartphone
} from 'lucide-react';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';

export type PaymentGatewayType = 'payu' | 'upi' | 'paypal';

export interface PendingBookingPayload {
  bookingId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  tourTitle: string;
  travelDate: string;
  pickupTime?: string;
  pickupLocation?: string;
  guideLanguage?: string;
  dropLocation?: string;
  vehicleType?: string;
  hotelOption?: string;
  totalAmountINR: number;
  totalAmountUSD: number;
  paymentChoiceLabel: string; // e.g., "25% Advance Deposit" or "100% Full Payment"
  amountToPayINR: number;
  amountToPayUSD: number;
  gateway: PaymentGatewayType;
  specialRequests?: string;
  travelers?: { adults: number; children: number };
}

interface PaymentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingPayload: PendingBookingPayload | null;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onPaymentVerified: (confirmedBookingRecord: any) => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  isOpen,
  onClose,
  bookingPayload,
  currency,
  rates = FALLBACK_RATES_FROM_USD,
  onPaymentVerified,
}) => {
  if (!isOpen || !bookingPayload) return null;

  const formattedAmountToPay = formatConvertedPrice(
    bookingPayload.amountToPayUSD,
    bookingPayload.amountToPayINR,
    currency,
    rates
  );

  const formattedTotalFare = formatConvertedPrice(
    bookingPayload.totalAmountUSD,
    bookingPayload.totalAmountINR,
    currency,
    rates
  );

  const getGatewayName = () => {
    switch (bookingPayload.gateway) {
      case 'payu': return 'PayU Payment Gateway';
      case 'upi': return 'Google UPI / PhonePe / BHIM';
      case 'paypal': return 'PayPal International';
      default: return 'Online Payment Gateway';
    }
  };

  const getGatewayIcon = () => {
    switch (bookingPayload.gateway) {
      case 'payu': return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'upi': return <Smartphone className="w-5 h-5 text-sky-600" />;
      case 'paypal': return <Banknote className="w-5 h-5 text-indigo-600" />;
      default: return <CreditCard className="w-5 h-5 text-amber-600" />;
    }
  };

  const handleConfirmAsPending = () => {
    const record = {
      ...bookingPayload,
      paymentStatus: 'PENDING PAYMENT',
      paymentMethod: `${getGatewayName()} (${bookingPayload.paymentChoiceLabel}) - PENDING VERIFICATION`,
      isPaymentVerified: false,
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    onPaymentVerified(record);
  };

  const handleSwitchToPayOnArrival = () => {
    const record = {
      ...bookingPayload,
      paymentStatus: 'CONFIRMED (PAY ON ARRIVAL)',
      paymentMethod: 'Pay Driver on Arrival (100% Cash/Card/UPI)',
      isPaymentVerified: true,
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    onPaymentVerified(record);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden relative my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Payment Gateway Integration Status
              </span>
              <h3 className="text-lg font-black text-white">{getGatewayName()}</h3>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Amount & Summary Header Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 block">Amount for Online Payment</span>
              <div className="text-2xl font-black text-slate-900">{formattedAmountToPay}</div>
              <span className="text-[11px] font-semibold text-slate-500">
                {bookingPayload.paymentChoiceLabel} • Total Trip Fare: {formattedTotalFare}
              </span>
            </div>

            <div className="text-right text-xs">
              <span className="font-extrabold text-slate-800 block truncate max-w-[180px]">{bookingPayload.tourTitle}</span>
              <span className="text-slate-500 font-medium block">Lead Guest: {bookingPayload.guestName}</span>
              <span className="text-slate-500 font-medium block">Date: {bookingPayload.travelDate}</span>
            </div>
          </div>

          {/* Notice Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Payment Gateway API Integration Pending</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Live online payment verification for <strong>{getGatewayName()}</strong> is currently undergoing API credential setup. Until real payment gateway verification is completed, online payment bookings cannot be automatically marked as CONFIRMED.
            </p>
            <div className="bg-white/80 p-3 rounded-xl text-xs text-slate-800 font-semibold border border-amber-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Your booking will be saved with status: <strong className="text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">PENDING PAYMENT</strong></span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleConfirmAsPending}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <span>Submit Booking with Status "PENDING PAYMENT"</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleSwitchToPayOnArrival}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Switch to "Pay Driver on Arrival" (CONFIRMED Directly)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full text-xs font-bold text-slate-500 hover:text-slate-800 py-2 transition"
            >
              Return to Booking Form
            </button>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1 font-semibold">
            <Lock className="w-3 h-3 text-emerald-600" /> Secure Reservation Desk
          </span>
          <span className="font-bold text-slate-700">Zaara Travels</span>
        </div>
      </div>
    </div>
  );
};
