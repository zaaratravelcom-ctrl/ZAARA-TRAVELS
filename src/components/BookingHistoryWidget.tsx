import React from 'react';
import { BookingVoucherData } from '../utils/voucherGenerator';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  Award, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Car, 
  Compass, 
  ShieldCheck,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';

interface BookingHistoryWidgetProps {
  bookings: BookingVoucherData[];
  currency?: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onExploreTours?: () => void;
}

export const BookingHistoryWidget: React.FC<BookingHistoryWidgetProps> = ({
  bookings,
  currency = 'USD' as CurrencyCode,
  rates = FALLBACK_RATES_FROM_USD,
  onExploreTours
}) => {
  const activeCurrency: CurrencyCode = currency || 'USD';
  // Lifetime Calculations
  const totalBookings = bookings.length;

  const totalLifetimeINR = bookings.reduce((sum, b) => sum + (b.totalAmountINR || 0), 0);
  const totalLifetimeUSD = bookings.reduce((sum, b) => sum + (b.totalAmountUSD || 0), 0);

  const totalTravelers = bookings.reduce(
    (sum, b) => sum + ((b.travelers?.adults || 0) + (b.travelers?.children || 0)),
    0
  );

  const avgBookingValueINR = totalBookings > 0 ? Math.round(totalLifetimeINR / totalBookings) : 0;
  const avgBookingValueUSD = totalBookings > 0 ? Math.round(totalLifetimeUSD / totalBookings) : 0;

  // Formatting currency
  const lifetimeDisplay = formatConvertedPrice(totalLifetimeUSD, totalLifetimeINR, activeCurrency, rates);
  const avgDisplay = formatConvertedPrice(avgBookingValueUSD, avgBookingValueINR, activeCurrency, rates);

  // Breakdown by Booking Type (Cab Rental vs Package Tour)
  const cabBookingsCount = bookings.filter(
    (b) => b.tourTitle?.toLowerCase().includes('cab') || b.tourTitle?.toLowerCase().includes('rental')
  ).length;
  const tourBookingsCount = totalBookings - cabBookingsCount;

  // Loyalty Tier Calculation based on total bookings & lifetime spend
  const getLoyaltyTier = () => {
    if (totalBookings >= 5 || totalLifetimeUSD >= 3000) {
      return {
        name: 'Platinum Globetrotter',
        badgeColor: 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-300',
        icon: '👑',
        perk: '15% Off Next Custom Tour + Priority Airport Transfer',
        progress: 100
      };
    } else if (totalBookings >= 3 || totalLifetimeUSD >= 1500) {
      return {
        name: 'Gold Voyager',
        badgeColor: 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-300',
        icon: '🥇',
        perk: '10% Off Next Custom Tour + Free Monument Guide',
        progress: 75
      };
    } else if (totalBookings >= 1) {
      return {
        name: 'Silver Explorer',
        badgeColor: 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900 border-slate-300',
        icon: '🥈',
        perk: '5% Welcome Back Discount + Complimentary Chilled Water',
        progress: 40
      };
    }
    return {
      name: 'Guest Traveler',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: '✨',
      perk: 'Book your 1st tour to unlock Silver Explorer perks!',
      progress: 10
    };
  };

  const loyalty = getLoyaltyTier();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6"
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-800/90 text-amber-400 text-xs font-extrabold px-3 py-1 rounded-full border border-slate-700">
            <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
            <span>Zaara Travels Guest Lifetime Analytics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-2.5">
            <span>Booking History & Lifetime Summary</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Track your total journeys, cumulative booking value, and exclusive membership tier status.
          </p>
        </div>

        {/* Loyalty Tier Pill */}
        <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 flex items-center gap-3 shrink-0">
          <div className="text-2xl">{loyalty.icon}</div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Guest Membership Status</div>
            <div className={`text-xs font-black px-2.5 py-0.5 rounded-full border inline-block mt-0.5 ${loyalty.badgeColor}`}>
              {loyalty.name}
            </div>
            <div className="text-[11px] text-amber-300 font-medium mt-1">
              🎁 {loyalty.perk}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings Stat */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-amber-500/50 transition shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {totalBookings} <span className="text-xs font-semibold text-slate-400">{totalBookings === 1 ? 'Trip' : 'Trips'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Package Tours: <strong className="text-amber-400">{tourBookingsCount}</strong></span>
            <span>Cabs: <strong className="text-sky-400">{cabBookingsCount}</strong></span>
          </div>
        </div>

        {/* Lifetime Travel Value (LTV) Stat */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-emerald-500/50 transition shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lifetime Value (LTV)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight truncate">
            {lifetimeDisplay}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 flex items-center justify-between">
            <span>Cumulative Spend</span>
            <span className="text-slate-300 font-bold">₹{totalLifetimeINR.toLocaleString('en-IN')} INR</span>
          </div>
        </div>

        {/* Total Travelers Hosted */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-sky-500/50 transition shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Travelers</span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">
            {totalTravelers} <span className="text-xs font-semibold text-slate-400">{totalTravelers === 1 ? 'Guest' : 'Guests'}</span>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 flex items-center justify-between">
            <span>Hosted Across Tours</span>
            <span className="text-sky-300 font-semibold">100% Satisfied</span>
          </div>
        </div>

        {/* Average Booking Value */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 space-y-2 hover:border-purple-500/50 transition shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-300 tracking-tight truncate">
            {avgDisplay}
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/50 flex items-center justify-between">
            <span>Per Travel Reservation</span>
            <span className="text-purple-300 font-bold">Average</span>
          </div>
        </div>
      </div>

      {/* Progress & Milestone Progress Bar */}
      <div className="relative z-10 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Next Loyalty Reward Goal: {totalBookings < 3 ? '3 Tours (Gold Voyager)' : '5 Tours (Platinum Globetrotter)'}</span>
          </div>
          <div className="w-full sm:w-80 bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(loyalty.progress, 100)}%` }}
            />
          </div>
        </div>

        {onExploreTours && (
          <button
            onClick={onExploreTours}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5 shrink-0"
          >
            <Compass className="w-4 h-4" />
            <span>Book Next Tour to Upgrade</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};
