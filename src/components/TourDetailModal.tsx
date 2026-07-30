import React, { useState } from 'react';
import { TourPackage } from '../types';
import { VEHICLES_DATA } from '../data/vehiclesData';
import { X, Calendar, Users, Car, Building, Check, ShieldCheck, CreditCard, Download, MessageSquare, Tag, AlertCircle, ChevronDown, ChevronUp, MapPin, Clock, Star, Phone } from 'lucide-react';
import { openPrintableVoucher, BookingVoucherData } from '../utils/voucherGenerator';

interface TourDetailModalProps {
  tour: TourPackage | null;
  currency: 'INR' | 'USD';
  onClose: () => void;
  onSaveBooking: (booking: BookingVoucherData) => void;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  tour,
  currency,
  onClose,
  onSaveBooking,
}) => {
  if (!tour) return null;

  // Tabs
  const [activeTab, setActiveTab] = useState<'itinerary' | 'booking' | 'included'>('itinerary');
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Booking Form State
  const [travelDate, setTravelDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('suv-innova');
  const [hotelTier, setHotelTier] = useState<'none' | '4star' | '5star'>('4star');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'stripe' | 'paypal' | 'deposit'>('razorpay');

  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingVoucherData | null>(null);

  // Price Calculation Logic
  const basePriceINR = tour.priceFromINR;
  const basePriceUSD = tour.priceFromUSD;

  // Vehicle Upgrade Cost
  const vehicleObj = VEHICLES_DATA.find((v) => v.id === selectedVehicleId);
  const vehicleAddonINR = selectedVehicleId === 'sedan-dzire' ? 0 : selectedVehicleId === 'suv-innova' ? 2500 : 6500;
  const vehicleAddonUSD = selectedVehicleId === 'sedan-dzire' ? 0 : selectedVehicleId === 'suv-innova' ? 30 : 80;

  // Hotel Tier Addon
  const hotelAddonINR = hotelTier === 'none' ? 0 : hotelTier === '4star' ? 3500 : 8500;
  const hotelAddonUSD = hotelTier === 'none' ? 0 : hotelTier === '4star' ? 45 : 105;

  // Total multiplication
  const totalRawINR = (basePriceINR * adults + (basePriceINR * 0.6 * children) + vehicleAddonINR + hotelAddonINR);
  const totalRawUSD = (basePriceUSD * adults + (basePriceUSD * 0.6 * children) + vehicleAddonUSD + hotelAddonUSD);

  const finalPriceINR = Math.round(totalRawINR * (1 - discountPercent / 100));
  const finalPriceUSD = Math.round(totalRawUSD * (1 - discountPercent / 100));

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'WELCOME10') {
      setDiscountPercent(10);
    } else if (code === 'ZAARA15' || code === 'JAHANGIR15') {
      setDiscountPercent(15);
    } else {
      setCouponError('Invalid coupon code. Try WELCOME10 for 10% off.');
      setDiscountPercent(0);
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Please enter your Name and Mobile/WhatsApp number.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking: BookingVoucherData = {
        bookingId: 'ZT-' + Math.floor(100000 + Math.random() * 900000),
        guestName,
        guestPhone,
        guestEmail: guestEmail || 'info@zaaratravel.com',
        tourTitle: tour.title,
        travelDate,
        travelers: { adults, children },
        vehicleType: vehicleObj?.name || 'Private AC Vehicle',
        hotelOption: hotelTier === '4star' ? '4-Star Heritage & Deluxe Hotels' : hotelTier === '5star' ? '5-Star Royal Palace Hotels' : 'No Hotel (Vehicle & Tour Only)',
        totalAmountINR: finalPriceINR,
        totalAmountUSD: finalPriceUSD,
        paymentMethod: paymentGateway.toUpperCase(),
        paymentStatus: paymentGateway === 'deposit' ? 'DEPOSIT CONFIRMED' : 'PAID IN FULL',
        bookingDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        specialRequests,
      };

      setBookingSuccess(newBooking);
      onSaveBooking(newBooking);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap text-xs text-sky-400 font-bold mb-1">
              <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2.5 py-0.5 rounded-full">
                {tour.category.toUpperCase()}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> {tour.duration}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" /> {tour.rating} ({tour.reviewsCount} reviews)
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {tour.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Destinations: {tour.cities.join(' - ')}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {bookingSuccess ? (
          <div className="p-6 sm:p-10 text-center space-y-6 overflow-y-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h3 className="text-2xl font-black text-slate-900">
                Booking Confirmed! (Ref: {bookingSuccess.bookingId})
              </h3>
              <p className="text-sm text-slate-600">
                Thank you <strong>{bookingSuccess.guestName}</strong>. Your official Zaara Travels booking voucher has been generated and transmitted to our reservation team.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mx-auto text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Travel Date:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.travelDate}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Travelers:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.travelers.adults} Adults, {bookingSuccess.travelers.children} Children</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Vehicle:</span>
                <span className="font-bold text-slate-900">{bookingSuccess.vehicleType}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-slate-500">Amount Paid / Total:</span>
                <span className="font-extrabold text-sky-700">₹{bookingSuccess.totalAmountINR.toLocaleString('en-IN')} (~${bookingSuccess.totalAmountUSD} USD)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-semibold text-slate-500">Official PayPal Link:</span>
                <a
                  href={`https://paypal.me/zaaratravel/${bookingSuccess.totalAmountUSD}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  paypal.me/zaaratravel/{bookingSuccess.totalAmountUSD}
                </a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto pt-2">
              <a
                href={`https://paypal.me/zaaratravel/${bookingSuccess.totalAmountUSD}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay via PayPal Link (${bookingSuccess.totalAmountUSD})</span>
              </a>

              <button
                onClick={() => openPrintableVoucher(bookingSuccess)}
                className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Print PDF Voucher</span>
              </button>

              <a
                href={`https://wa.me/919933992786?text=${encodeURIComponent(
                  `Hello Zaara Travels, I have booked ${tour.title} (Booking Ref: ${bookingSuccess.bookingId}) for ${bookingSuccess.travelDate}. Payment option selected: ${bookingSuccess.paymentMethod}. Direct PayPal link: https://paypal.me/zaaratravel/${bookingSuccess.totalAmountUSD}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp MD</span>
              </a>
            </div>
          </div>
        ) : (
          /* Normal Modal Content */
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left Column: Itinerary & Details */}
            <div className="lg:col-span-7 p-4 sm:p-6 space-y-6">
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 gap-2">
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
                    activeTab === 'itinerary'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Day-by-Day Itinerary
                </button>
                <button
                  onClick={() => setActiveTab('included')}
                  className={`pb-3 px-3 text-sm font-bold border-b-2 transition ${
                    activeTab === 'included'
                      ? 'border-sky-600 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Inclusions & Exclusions
                </button>
              </div>

              {/* Overview */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <strong className="text-sky-900 block font-bold mb-1">Tour Overview:</strong>
                {tour.overview}
              </div>

              {/* Tab 1: Itinerary Accordion */}
              {activeTab === 'itinerary' && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base">Detailed Itinerary:</h3>
                  {tour.itinerary.map((day) => (
                    <div
                      key={day.day}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      <button
                        onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                        className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between font-bold text-sm text-slate-900 transition"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs flex items-center justify-center font-bold">
                            {day.day}
                          </span>
                          <span>{day.title}</span>
                        </span>
                        {expandedDay === day.day ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </button>

                      {expandedDay === day.day && (
                        <div className="p-4 text-xs sm:text-sm text-slate-600 space-y-2 border-t border-slate-100">
                          <p className="leading-relaxed">{day.description}</p>
                          <div className="bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-lg inline-block text-xs">
                            🏨 {day.stayOrLocation}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2: Included & Excluded */}
              {activeTab === 'included' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> What's Included:
                    </h4>
                    <ul className="space-y-1.5 text-slate-700">
                      {tour.included.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-50/60 border border-rose-100 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
                      <X className="w-4 h-4 text-rose-600 stroke-[3]" /> What's Excluded:
                    </h4>
                    <ul className="space-y-1.5 text-slate-700">
                      {tour.excluded.map((exc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Yatra / WP Travel Plugin Style Booking Engine */}
            <div className="lg:col-span-5 bg-slate-50/80 p-4 sm:p-6 space-y-5">
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow border border-slate-800">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Yatra Booking Engine</div>
                <div className="text-2xl font-black text-white mt-1">
                  {currency === 'INR' ? `₹${finalPriceINR.toLocaleString('en-IN')}` : `$${finalPriceUSD}`}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">Total Estimated Price</span>
                </div>
                {discountPercent > 0 && (
                  <div className="text-xs text-emerald-400 font-bold mt-1">
                    🎉 {discountPercent}% Special Discount Applied!
                  </div>
                )}
              </div>

              {/* Booking Configuration Form */}
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs sm:text-sm">
                {/* Travel Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> Select Travel Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>

                {/* Travelers Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-600" /> Adults (12+ yrs)
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Adult' : 'Adults'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Children (5-11 yrs)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    >
                      {[0, 1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Child' : 'Children'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-sky-600" /> Choose Private Vehicle Tier
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    {VEHICLES_DATA.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.passengers})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hotel Tier */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-sky-600" /> Hotel Option
                  </label>
                  <select
                    value={hotelTier}
                    onChange={(e) => setHotelTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="none">No Hotel (Vehicle & Tour Guide Only)</option>
                    <option value="4star">4-Star Heritage & Boutique Hotels (Breakfast included)</option>
                    <option value="5star">5-Star Royal Palace & Luxury Hotels (Oberoi/Taj Tier)</option>
                  </select>
                </div>

                {/* Coupon Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-500" /> Discount Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>}
                </div>

                <hr className="border-slate-200 my-3" />

                {/* Guest Details */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                    Guest Lead Contact
                  </h4>

                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="tel"
                      required
                      placeholder="Mobile / WhatsApp *"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  {/* Payment Gateway Options */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" /> Payment Method / Gateway
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('paypal')}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition flex flex-col justify-between ${
                          paymentGateway === 'paypal'
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-700">PayPal</span>
                          <span className="text-[10px] bg-indigo-200/60 text-indigo-900 font-extrabold px-1.5 py-0.5 rounded">USD/Intl</span>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1">PayPal.me Direct Link</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('razorpay')}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition flex flex-col justify-between ${
                          paymentGateway === 'razorpay'
                            ? 'bg-sky-50 border-sky-600 text-sky-900 ring-2 ring-sky-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold">Razorpay / UPI</span>
                        <span className="text-[10px] text-slate-500 mt-1">INR Cards & UPI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('stripe')}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition flex flex-col justify-between ${
                          paymentGateway === 'stripe'
                            ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold">Stripe Card</span>
                        <span className="text-[10px] text-slate-500 mt-1">Visa / MasterCard</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentGateway('deposit')}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition flex flex-col justify-between ${
                          paymentGateway === 'deposit'
                            ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold">25% Advance</span>
                        <span className="text-[10px] text-slate-500 mt-1">Pay Rest on Arrival</span>
                      </button>
                    </div>

                    {/* PayPal Direct Payment Banner */}
                    {paymentGateway === 'paypal' && (
                      <div className="mt-3 bg-indigo-900 text-white p-3.5 rounded-xl border border-indigo-700 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-amber-300 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4" /> Official PayPal Payment Link
                          </span>
                          <span className="text-[10px] bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-full font-mono">
                            paypal.me/JahangirHussain958
                          </span>
                        </div>
                        <p className="text-slate-200 text-[11px] leading-relaxed">
                          Click below to pay safely using your PayPal account or Credit/Debit Card in USD (~${finalPriceUSD}). Instant email receipt & voucher generated.
                        </p>
                        <a
                          href={`https://paypal.me/JahangirHussain958/${finalPriceUSD}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black py-2 rounded-lg transition text-xs shadow"
                        >
                          <span>Open PayPal Link (paypal.me/JahangirHussain958/{finalPriceUSD})</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-sky-600 to-amber-500 hover:from-sky-700 hover:to-amber-600 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <span>Confirming Booking...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Confirm & Generate PDF Voucher</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
