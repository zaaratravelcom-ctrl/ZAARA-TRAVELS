import React, { useState } from 'react';
import { TourPackage } from '../types';
import { VEHICLES_DATA } from '../data/vehiclesData';
import { X, Calendar, Users, Car, Building, Check, ShieldCheck, CreditCard, Download, Printer, MessageSquare, Tag, AlertCircle, ChevronDown, ChevronUp, MapPin, Clock, Star, Phone } from 'lucide-react';
import { openPrintableVoucher, BookingVoucherData } from '../utils/voucherGenerator';
import { downloadBookingPDF } from '../utils/pdfGenerator';
import { sanitizePhoneNumber, isValidPhoneNumber, handlePhoneKeyDown, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';
import { GUIDE_LANGUAGES } from './TourDetailsModal';

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
  const [guideLanguage, setGuideLanguage] = useState<string>('English');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('sedan-prime');
  const [selectedAccommodation, setSelectedAccommodation] = useState<'none' | '3star' | '4star' | '5star'>('4star');
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');
  const [paymentGateway, setPaymentGateway] = useState<'payu' | 'paypal' | 'deposit'>('payu');

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

  // Extract nights for internal accommodation calculation (3-Star: 3000, 4-Star: 5000, 5-Star: 10000)
  const nightsMatch = tour.duration.match(/(\d+)\s*Nights?/i);
  const nights = nightsMatch
    ? parseInt(nightsMatch[1])
    : tour.duration.includes('3 Days')
    ? 2
    : tour.duration.includes('4 Days')
    ? 3
    : tour.duration.includes('6 Days')
    ? 5
    : tour.duration.includes('8 Days')
    ? 7
    : tour.duration.includes('10 Days')
    ? 9
    : tour.duration.includes('5 Days')
    ? 4
    : tour.duration.includes('7 Days')
    ? 6
    : 0;

  // Selected Accommodation rate & addon per night
  const accommodationRateINR = nights > 0
    ? (selectedAccommodation === '3star' ? 3000 : selectedAccommodation === '4star' ? 5000 : selectedAccommodation === '5star' ? 10000 : 0)
    : 0;
  const accommodationRateUSD = nights > 0
    ? (selectedAccommodation === '3star' ? 36 : selectedAccommodation === '4star' ? 60 : selectedAccommodation === '5star' ? 120 : 0)
    : 0;

  const accommodationAddonINR = accommodationRateINR * nights;
  const accommodationAddonUSD = accommodationRateUSD * nights;

  const selectedAccommodationLabel = nights > 0
    ? (selectedAccommodation === 'none'
        ? 'Without Accommodation'
        : selectedAccommodation === '3star'
        ? '3-Star Hotel Accommodation'
        : selectedAccommodation === '4star'
        ? '4-Star Hotel Accommodation'
        : '5-Star Luxury Accommodation')
    : 'Day Tour (No Night Stay)';

  // Vehicle Upgrade Cost
  const vehicleObj = VEHICLES_DATA.find((v) => v.id === selectedVehicleId);
  const vehicleAddonINR = selectedVehicleId === 'sedan-prime' ? 0 : selectedVehicleId === 'suv-ertiga-innova' ? 2500 : 6500;
  const vehicleAddonUSD = selectedVehicleId === 'sedan-prime' ? 0 : selectedVehicleId === 'suv-ertiga-innova' ? 30 : 80;

  // Total calculation (including selected accommodation for overnight tours)
  const totalRawINR = (basePriceINR * adults + (basePriceINR * 0.6 * children) + vehicleAddonINR + accommodationAddonINR);
  const totalRawUSD = (basePriceUSD * adults + (basePriceUSD * 0.6 * children) + vehicleAddonUSD + accommodationAddonUSD);

  const finalPriceINR = Math.round(totalRawINR * (1 - discountPercent / 100));
  const finalPriceUSD = Math.round(totalRawUSD * (1 - discountPercent / 100));

  const formatOptionTotal = (accRateINR: number, accRateUSD: number) => {
    const rawINR = (basePriceINR * adults) + (basePriceINR * 0.6 * children) + vehicleAddonINR + (accRateINR * nights);
    const rawUSD = (basePriceUSD * adults) + (basePriceUSD * 0.6 * children) + vehicleAddonUSD + (accRateUSD * nights);
    const totINR = Math.round(rawINR * (1 - discountPercent / 100));
    const totUSD = Math.round(rawUSD * (1 - discountPercent / 100));
    return currency === 'INR' ? `₹${totINR.toLocaleString('en-IN')}` : `$${totUSD}`;
  };

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
    if (!isValidPhoneNumber(guestPhone)) {
      alert(PHONE_ERROR_MESSAGE);
      return;
    }

    setIsSubmitting(true);

    const baseAmountINR = Math.round(finalPriceINR / 1.05);
    const gstAmountINR = finalPriceINR - baseAmountINR;
    const baseAmountUSD = Math.round(finalPriceUSD / 1.05);
    const gstAmountUSD = finalPriceUSD - baseAmountUSD;

    setTimeout(() => {
      const newBooking: BookingVoucherData = {
        bookingId: 'ZT-' + Math.floor(100000 + Math.random() * 900000),
        guestName,
        guestPhone,
        guestEmail: guestEmail || 'info@zaaratravel.com',
        tourTitle: tour.title,
        travelDate,
        guideLanguage,
        travelers: { adults, children },
        vehicleType: vehicleObj?.name || 'AC Sedan / Prime (1–3 Guests)',
        hotelOption: nights > 0 ? selectedAccommodationLabel : 'Day Tour (No Night Stay)',
        baseAmountINR,
        gstAmountINR,
        baseAmountUSD,
        gstAmountUSD,
        totalAmountINR: finalPriceINR,
        totalAmountUSD: finalPriceUSD,
        paymentMethod: paymentGateway === 'arrival' ? 'Pay Driver on Arrival' : paymentGateway.toUpperCase(),
        paymentStatus: paymentGateway === 'arrival' ? 'CONFIRMED (PAY ON ARRIVAL)' : 'PENDING PAYMENT',
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
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col notranslate" translate="no">
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
              <div className="space-y-1.5 pt-1 border-b pb-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Amount:</span>
                  <span className="font-bold text-slate-900">₹{(bookingSuccess.baseAmountINR ?? Math.round(bookingSuccess.totalAmountINR / 1.05)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Goods & Services Tax (GST @ 5%):</span>
                  <span className="font-bold text-amber-800">₹{(bookingSuccess.gstAmountINR ?? (bookingSuccess.totalAmountINR - Math.round(bookingSuccess.totalAmountINR / 1.05))).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-black text-slate-900">Total Amount Payable:</span>
                <span className="font-extrabold text-emerald-700">₹{bookingSuccess.totalAmountINR.toLocaleString('en-IN')} (~${bookingSuccess.totalAmountUSD} USD)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto pt-2">
              <button
                onClick={() => {
                  if (bookingSuccess) {
                    downloadBookingPDF({
                      bookingId: bookingSuccess.bookingId,
                      guestName: bookingSuccess.guestName,
                      guestEmail: bookingSuccess.guestEmail,
                      guestPhone: bookingSuccess.guestPhone,
                      tourTitle: bookingSuccess.tourTitle,
                      travelDate: bookingSuccess.travelDate,
                      pickupTime: bookingSuccess.pickupTime,
                      pickupLocation: bookingSuccess.pickupLocation,
                      dropLocation: bookingSuccess.dropLocation || 'Hotel / Airport Destination',
                      guideLanguage: bookingSuccess.guideLanguage,
                      travelers: bookingSuccess.travelers,
                      vehicleType: bookingSuccess.vehicleType,
                      hotelOption: bookingSuccess.hotelOption,
                      totalAmountINR: bookingSuccess.totalAmountINR,
                      totalAmountUSD: bookingSuccess.totalAmountUSD,
                      paymentMethod: bookingSuccess.paymentMethod,
                      paymentStatus: bookingSuccess.paymentStatus,
                      bookingDate: bookingSuccess.bookingDate,
                      specialRequests: bookingSuccess.specialRequests,
                    });
                  }
                }}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF Voucher</span>
              </button>

              <button
                onClick={() => openPrintableVoucher(bookingSuccess)}
                className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Print/Save</span>
              </button>

              <a
                href={`https://wa.me/919933992786?text=${encodeURIComponent(
                  `Hello Zaara Travels, I have booked ${tour.title} (Booking Ref: ${bookingSuccess.bookingId}) for ${bookingSuccess.travelDate}. Guide Language: ${bookingSuccess.guideLanguage || 'English'}. Payment option selected: ${bookingSuccess.paymentMethod}.`
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
              <div className="bg-slate-900 text-white p-4 rounded-2xl shadow border border-slate-800 space-y-2">
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Booking Summary & Price</span>
                  {nights > 0 && <span className="text-[10px] text-slate-300 font-normal">{nights} Night Stay</span>}
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {currency === 'INR' ? `₹${finalPriceINR.toLocaleString('en-IN')}` : `$${finalPriceUSD}`}
                  <span className="text-xs font-normal text-slate-400 ml-1.5">Total Payable Amount</span>
                </div>
                {discountPercent > 0 && (
                  <div className="text-xs text-emerald-400 font-bold">
                    🎉 {discountPercent}% Special Discount Applied!
                  </div>
                )}

                {/* Booking Summary Breakdown */}
                <div className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-xl text-xs space-y-1.5 text-slate-300 mt-2">
                  {nights > 0 && (
                    <div className="flex justify-between text-sky-300">
                      <span>Selected Accommodation:</span>
                      <span className="font-bold">{selectedAccommodationLabel}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span className="font-semibold text-slate-100">{adults} Adult{adults > 1 ? 's' : ''}{children > 0 ? `, ${children} Child${children > 1 ? 'ren' : ''}` : ''}</span>
                  </div>
                  {vehicleAddonINR > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Vehicle ({vehicleObj?.name || 'SUV'}):</span>
                      <span>{currency === 'INR' ? `+₹${vehicleAddonINR.toLocaleString('en-IN')}` : `+$${vehicleAddonUSD}`}</span>
                    </div>
                  )}
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-blue-400 font-bold">
                      <span>Discount ({discountPercent}% OFF):</span>
                      <span>-{currency === 'INR' ? `₹${Math.round((totalRawINR * discountPercent)/100).toLocaleString('en-IN')}` : `$${Math.round((totalRawUSD * discountPercent)/100)}`}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-700">
                    <span>Total Tour Amount:</span>
                    <span className="text-amber-400">{currency === 'INR' ? `₹${finalPriceINR.toLocaleString('en-IN')}` : `$${finalPriceUSD}`}</span>
                  </div>
                </div>
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

                {/* Guide Language Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Tour Guide Language *
                  </label>
                  <select
                    value={guideLanguage}
                    onChange={(e) => setGuideLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    {GUIDE_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang} Guide
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Notice */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <Car className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Private AC Vehicle & Professional Driver Included</span>
                </div>

                {/* Accommodation Selection for Night Tours (Hidden for 0 nights) */}
                {nights > 0 && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-sky-600" /> Accommodation Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'Without Accommodation', rateINR: 0, rateUSD: 0 },
                        { id: '3star', label: '3-Star Hotel Accommodation', rateINR: 3000, rateUSD: 36 },
                        { id: '4star', label: '4-Star Hotel Accommodation', rateINR: 5000, rateUSD: 60 },
                        { id: '5star', label: '5-Star Luxury Accommodation', rateINR: 10000, rateUSD: 120 },
                      ].map((item) => {
                        const optTotalStr = formatOptionTotal(item.rateINR, item.rateUSD);
                        const isSelected = selectedAccommodation === item.id;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedAccommodation(item.id as any)}
                            className={`cursor-pointer p-2.5 rounded-xl border text-xs transition relative ${
                              isSelected
                                ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-sky-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                                ✓
                              </div>
                            )}
                            <div className="font-bold text-slate-900 pr-4">{item.label}</div>
                            <div className="text-[11px] font-bold text-emerald-700 mt-1">
                              Total Tour Amount: {optTotalStr}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Coupon Code Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-blue-600" /> Discount Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-xl text-xs uppercase font-bold text-blue-950"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
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

                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          required
                          placeholder="Mobile / WhatsApp *"
                          value={guestPhone}
                          onKeyDown={handlePhoneKeyDown}
                          onChange={(e) => setGuestPhone(sanitizePhoneNumber(e.target.value))}
                          className={`w-full px-3 py-2 bg-white border rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500 ${
                            guestPhone && !isValidPhoneNumber(guestPhone) ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                          }`}
                        />
                        {guestPhone && !isValidPhoneNumber(guestPhone) && (
                          <p className="text-[10px] font-bold text-red-600 mt-0.5">
                            ⚠️ Invalid mobile number (7–15 digits)
                          </p>
                        )}
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-medium text-xs focus:ring-2 focus:ring-sky-500 h-10"
                      />
                    </div>
                  </div>

                  {/* Payment Gateway Options */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" /> Payment Method / Gateway
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setPaymentGateway('payu')}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition flex flex-col justify-between ${
                          paymentGateway === 'payu'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-bold">PayU Gateway</span>
                        <span className="text-[10px] text-slate-500 mt-1">Cards, UPI & NetBanking</span>
                      </button>

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
