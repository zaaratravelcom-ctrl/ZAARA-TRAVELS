import React, { useState } from 'react';
import { BookingVoucherData } from '../utils/voucherGenerator';
import { CurrencyCode, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { BookingHistoryWidget } from './BookingHistoryWidget';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { MessageSquare, Calendar, Users, Car, Ticket, ArrowRight, Sparkles, Check, Clock, MapPin, Trash2, Compass, Eye, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingsViewProps {
  bookings: BookingVoucherData[];
  currency?: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onRemoveBooking?: (id: string) => void;
  onExploreTours: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  currency = 'USD',
  rates = FALLBACK_RATES_FROM_USD,
  onRemoveBooking,
  onExploreTours,
}) => {
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(true);
  const [previewBooking, setPreviewBooking] = useState<BookingVoucherData | null>(null);
  const [previewDocType, setPreviewDocType] = useState<'booking' | 'invoice'>('booking');

  const openPreview = (b: BookingVoucherData, type: 'booking' | 'invoice' = 'booking') => {
    setPreviewBooking(b);
    setPreviewDocType(type);
  };

  // Identify if any booking was added in the last session
  const newestBooking = bookings.length > 0 ? bookings[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-8"
    >
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            <Ticket className="w-3.5 h-3.5 text-sky-600" /> Zaara Travels Guest Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            My Tour Bookings & Vouchers
          </h1>
        </div>

        <button
          onClick={onExploreTours}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition transform active:scale-95"
        >
          <span>Book Another Tour</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Booking History Dashboard Summary Widget */}
      <BookingHistoryWidget
        bookings={bookings}
        currency={currency}
        rates={rates}
        onExploreTours={onExploreTours}
      />

      {/* Success Notification Animation Banner */}
      <AnimatePresence>
        {newestBooking && showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 rounded-2xl shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 z-10">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                className="w-12 h-12 bg-white text-emerald-600 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-4 ring-emerald-300/40"
              >
                <Check className="w-7 h-7 stroke-[3]" />
              </motion.div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wide">
                    New Booking Active
                  </span>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                </div>
                <h4 className="font-extrabold text-base text-white mt-1">
                  Tour Reference #{newestBooking.bookingId} Confirmed!
                </h4>
                <p className="text-xs text-emerald-100 leading-snug">
                  Official GST Voucher & driver assignment generated for {newestBooking.guestName}.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 z-10 w-full sm:w-auto">
              <button
                onClick={() => openPreview(newestBooking, 'booking')}
                className="flex-1 sm:flex-none bg-white text-emerald-900 font-extrabold px-4 py-2 rounded-xl text-xs shadow hover:bg-emerald-50 transition flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preview Document</span>
              </button>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-emerald-200 hover:text-white font-bold text-xs underline px-2"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4"
        >
          <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No active bookings found</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            You haven't booked any tour yet. Explore our Golden Triangle, Ranthambore Tiger Safaris, or Same Day tours to get started!
          </p>
          <button
            onClick={onExploreTours}
            className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-6 py-3 rounded-xl shadow text-sm transition"
          >
            Explore India Tour Packages
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b, index) => (
            <motion.div
              key={b.bookingId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-5 hover:border-sky-300 transition"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                    Ref: {b.bookingId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{b.tourTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase border ${
                    b.paymentStatus?.toUpperCase().includes('PENDING')
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    {b.paymentStatus}
                  </span>

                  {onRemoveBooking && (
                    <button
                      onClick={() => onRemoveBooking(b.bookingId)}
                      title="Remove Booking"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
                  <span><strong>Travel Date:</strong> {b.travelDate}</span>
                </div>

                {b.pickupTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span><strong>Pickup Time:</strong> {b.pickupTime}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600 shrink-0" />
                  <span><strong>Travelers:</strong> {b.travelers.adults} Adults, {b.travelers.children} Children</span>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-sky-600 shrink-0" />
                  <span><strong>Vehicle:</strong> {b.vehicleType}</span>
                </div>

                {(b.guideLanguage || !b.tourTitle?.toLowerCase().includes('cab')) && (
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Guide Language:</strong> {b.guideLanguage || 'English'}</span>
                  </div>
                )}

                {b.pickupLocation && (
                  <div className="md:col-span-2 flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs"><strong>Pickup Point:</strong> {b.pickupLocation}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  Total Amount: <strong className="text-slate-900 text-base">₹{b.totalAmountINR.toLocaleString('en-IN')}</strong> (~${b.totalAmountUSD} USD)
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openPreview(b, 'booking')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm"
                    title="Preview Official Booking Voucher Document"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-950" />
                    <span>Preview Voucher</span>
                  </button>

                  <button
                    onClick={() => openPreview(b, 'invoice')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                    title="Preview Official GST Tax Invoice Document"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview Tax Invoice</span>
                  </button>

                  <a
                    href={`https://wa.me/919933992786?text=${encodeURIComponent(
                      `Hello Zaara Travels team, I am inquiring about my booking ref ${b.bookingId} for ${b.tourTitle} on ${b.travelDate}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Official Document Live Preview Modal */}
      <DocumentPreviewModal
        isOpen={!!previewBooking}
        onClose={() => setPreviewBooking(null)}
        booking={previewBooking}
        defaultDocType={previewDocType}
      />
    </motion.div>
  );
};
