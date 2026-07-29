import React, { useState } from 'react';
import { TourPackage, VehicleOption } from '../types';
import { X, Calendar, Users, Car, CheckCircle2, XCircle, ShieldCheck, CreditCard, MessageSquare, FileText, Star, Sparkles, MapPin, Building, ArrowRight, Check, User, ArrowLeft, Clock, Search, Navigation, Crosshair, Plane, Train, Hotel, Locate, Compass } from 'lucide-react';
import { VEHICLES_DATA } from '../data/vehiclesData';
import { openPrintableVoucher } from '../utils/voucherGenerator';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { LiveRouteMap } from './LiveRouteMap';
import { TourRouteLeafletMap } from './TourRouteLeafletMap';
import { InteractiveMapPicker, POPULAR_DELHI_HOTSPOTS } from './InteractiveMapPicker';
import { PickupTimePicker } from './PickupTimePicker';

// Delhi NCR Hotspot Coordinates & Presets for Search by Map
const POPULAR_PICKUP_LOCATIONS = [
  { id: 'del-t3', name: 'Indira Gandhi Int\'l Airport (DEL) - Terminal 3 (International)', category: 'Airport', zone: 'Delhi Airport', x: 28, y: 56, icon: '✈️' },
  { id: 'del-t1', name: 'Delhi Airport (DEL) - Terminal 1 (Domestic Departures)', category: 'Airport', zone: 'Delhi Airport', x: 32, y: 50, icon: '✈️' },
  { id: 'aerocity', name: 'Aerocity Hotel Complex (JW Marriott, Roseate House, Aloft)', category: 'Hotels', zone: 'Aerocity NCR', x: 35, y: 60, icon: '🏨' },
  { id: 'ndls', name: 'New Delhi Railway Station (NDLS) - Paharganj Gate', category: 'Train Station', zone: 'Central Delhi', x: 55, y: 35, icon: '🚆' },
  { id: 'cp', name: 'Connaught Place Hotels (The Imperial, Shangri-La, The Lalit)', category: 'Hotels', zone: 'Central Delhi', x: 52, y: 40, icon: '🏛️' },
  { id: 'chanakya', name: 'Chanakyapuri Embassy Area (Taj Palace, Leela Palace, ITC Maurya)', category: 'Hotels', zone: 'South Delhi', x: 45, y: 48, icon: '👑' },
  { id: 'nizamuddin', name: 'Hazrat Nizamuddin Railway Station (NZM)', category: 'Train Station', zone: 'South Delhi', x: 62, y: 52, icon: '🚆' },
  { id: 'gurugram', name: 'Gurugram Cyber Hub / DLF Phase 5 (The Oberoi, Trident)', category: 'Hotels', zone: 'Gurugram NCR', x: 22, y: 72, icon: '🏢' },
  { id: 'noida', name: 'Noida Sector 18 / Expressway Hotels (Radisson Blu, Park Plaza)', category: 'Hotels', zone: 'Noida NCR', x: 78, y: 65, icon: '🏙️' },
  { id: 'old-delhi', name: 'Old Delhi / Chandni Chowk / Maidens Hotel Civil Lines', category: 'Heritage', zone: 'North Delhi', x: 58, y: 26, icon: '🕌' },
];

interface TourDetailsModalProps {
  tour: TourPackage | null;
  onClose: () => void;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onAddBooking: (bookingData: any) => void;
}

export const TourDetailsModal: React.FC<TourDetailsModalProps> = ({
  tour,
  onClose,
  currency,
  rates = FALLBACK_RATES_FROM_USD,
  onAddBooking,
}) => {
  if (!tour) return null;

  const [activeSubTab, setActiveSubTab] = useState<'itinerary' | 'map' | 'book'>('itinerary');
  const [bookingStep, setBookingStep] = useState<number>(1);
  
  // Booking Form State
  const [travelDate, setTravelDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState<string>('06:00 AM');
  const [pickupLocation, setPickupLocation] = useState<string>('Indira Gandhi Int\'l Airport (DEL) - Terminal 3');
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('sedan-dzire');
  const [hotelCategory, setHotelCategory] = useState<string>('4-star-heritage');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  const handleSelectQuickDate = (daysInFuture: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysInFuture);
    setTravelDate(d.toISOString().split('T')[0]);
  };

  const handleUseGpsLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(4);
          const lng = position.coords.longitude.toFixed(4);
          setPickupLocation(`Live GPS Pinpoint (Lat: ${lat}, Lng: ${lng}) - Delhi NCR Chauffeur Pickup`);
          setShowMapPicker(false);
        },
        () => {
          setPickupLocation('Aerocity Hotel Zone / Delhi NCR Chauffeur Pickup');
          setShowMapPicker(false);
        }
      );
    } else {
      setPickupLocation('Delhi Hotel / Airport Terminal Pickup');
      setShowMapPicker(false);
    }
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (bookingStep === 3) {
      if (!guestName.trim() || !guestPhone.trim()) {
        alert('Please fill in your Lead Guest Name and Mobile/WhatsApp number before proceeding.');
        return;
      }
    }
    setBookingStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setBookingStep((prev) => Math.max(1, prev - 1));
  };

  const handleJumpToStep = (targetStep: number) => {
    if (targetStep > 3 && (!guestName.trim() || !guestPhone.trim())) {
      alert('Please fill in your Lead Guest Name and Mobile/WhatsApp number first.');
      setBookingStep(3);
      return;
    }
    setBookingStep(targetStep);
  };
  
  // Coupon State
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [couponMessage, setCouponMessage] = useState<string>('');

  // Payment Options
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit' | 'arrival'>('full');
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'stripe' | 'paypal' | 'upi'>('razorpay');

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastBookingRef, setLastBookingRef] = useState<any>(null);

  // Price Calculations (USD as base calculation anchor)
  const basePriceUSD = tour.priceFromUSD;
  const basePriceINR = tour.priceFromINR;
  const rawSubtotalUSD = basePriceUSD * adults;
  
  // Add vehicle add-on fee if Innova or Tempo
  let vehicleAddonUSD = 0;
  if (selectedVehicle === 'suv-innova') vehicleAddonUSD = 20;
  if (selectedVehicle === 'tempo-traveller') vehicleAddonUSD = 50;

  let hotelAddonUSD = 0;
  if (hotelCategory === '5-star-luxury') hotelAddonUSD = 45 * adults;

  const grossTotalUSD = rawSubtotalUSD + vehicleAddonUSD + hotelAddonUSD;
  const discountAmountUSD = Math.round((grossTotalUSD * appliedDiscountPercent) / 100);
  const finalTotalUSD = Math.max(0, grossTotalUSD - discountAmountUSD);

  // Formatted price string in current currency
  const formattedSubtotal = formatConvertedPrice(rawSubtotalUSD, basePriceINR * adults, currency, rates);
  const formattedVehicleAddon = vehicleAddonUSD > 0 ? formatConvertedPrice(vehicleAddonUSD, vehicleAddonUSD * 83.5, currency, rates) : 'Included';
  const formattedDiscount = formatConvertedPrice(discountAmountUSD, discountAmountUSD * 83.5, currency, rates);
  const formattedFinalTotal = formatConvertedPrice(finalTotalUSD, finalTotalUSD * (rates.INR || 83.5), currency, rates);

  // Convert for Voucher Display
  const finalINR = Math.round(finalTotalUSD * (rates.INR || 83.5));
  const finalUSD = Math.round(finalTotalUSD);

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'ZAARA10' || couponCode.trim().toUpperCase() === 'JAHANGIR10') {
      setAppliedDiscountPercent(10);
      setCouponMessage('🎉 10% Special Discount Applied!');
    } else if (couponCode.trim().toUpperCase() === 'WELCOME15') {
      setAppliedDiscountPercent(15);
      setCouponMessage('🎉 15% Welcome Discount Applied!');
    } else {
      setAppliedDiscountPercent(0);
      setCouponMessage('❌ Invalid coupon code. Try ZAARA10');
    }
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) {
      alert('Please provide your name and phone number for booking confirmation.');
      return;
    }

    const bookingId = 'ZT-' + Math.floor(100000 + Math.random() * 900000);
    const vehicleObj = VEHICLES_DATA.find((v) => v.id === selectedVehicle);

    const bookingRecord = {
      bookingId,
      guestName,
      guestPhone,
      guestEmail: guestEmail || 'guest@zaaratravel.com',
      tourTitle: tour.title,
      travelDate,
      pickupTime,
      pickupLocation,
      travelers: { adults, children },
      vehicleType: vehicleObj ? vehicleObj.name : 'Private AC Vehicle',
      hotelOption: hotelCategory === '5-star-luxury' ? '5-Star Luxury Hotels' : '4-Star Boutique & Heritage Haveli',
      totalAmountINR: finalINR,
      totalAmountUSD: finalUSD,
      paymentMethod: paymentOption === 'arrival' ? 'Pay Driver on Arrival' : `${paymentGateway.toUpperCase()} (${paymentOption === 'deposit' ? '25% Deposit' : 'Paid in Full'})`,
      paymentStatus: paymentOption === 'arrival' ? 'PAY ON ARRIVAL' : 'PAID IN FULL',
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      specialRequests,
    };

    onAddBooking(bookingRecord);
    setLastBookingRef(bookingRecord);
    setIsSubmitted(true);
  };

  const handleGenerateVoucher = () => {
    if (lastBookingRef) {
      openPrintableVoucher(lastBookingRef);
    }
  };

  const handleSendWhatsAppConfirmation = () => {
    if (!lastBookingRef) return;
    const waText = `*CONFIRMED BOOKING VOUCHER - ZAARA TRAVELS*
*Booking Ref:* ${lastBookingRef.bookingId}
*Guest Name:* ${lastBookingRef.guestName}
*Phone:* ${lastBookingRef.guestPhone}
*Tour:* ${lastBookingRef.tourTitle}
*Travel Date:* ${lastBookingRef.travelDate}
*Travelers:* ${lastBookingRef.travelers.adults} Adults, ${lastBookingRef.travelers.children} Kids
*Vehicle:* ${lastBookingRef.vehicleType}
*Total Paid/Amount:* ₹${lastBookingRef.totalAmountINR.toLocaleString('en-IN')} (${lastBookingRef.paymentMethod})
*GSTIN:* 19ACUPH2897Q2ZA

Hi Jahangir Khan, I completed my booking on the website! Please acknowledge and send driver details.`;

    window.open(`https://wa.me/919933992786?text=${encodeURIComponent(waText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between relative shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <ShieldCheck className="w-4 h-4" /> Official Tour Package • Zaara Travels
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white pr-8 leading-snug">{tour.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 mt-2 flex-wrap">
              <span className="bg-slate-800 px-2.5 py-1 rounded-md text-sky-400 font-semibold">{tour.duration}</span>
              <span>📍 {tour.cities.join(' • ')}</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3.5 h-3.5 fill-current" /> {tour.rating} ({tour.reviewsCount} reviews)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('itinerary')}
            className={`flex-1 min-w-[140px] py-3 text-xs sm:text-sm font-bold border-b-2 text-center transition ${
              activeSubTab === 'itinerary'
                ? 'border-sky-600 text-sky-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Day-by-Day Itinerary
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('map')}
            className={`flex-1 min-w-[150px] py-3 text-xs sm:text-sm font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'map'
                ? 'border-sky-600 text-sky-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-sky-600" />
            <span>🗺️ Tour Route Map</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('book')}
            className={`flex-1 min-w-[160px] py-3 text-xs sm:text-sm font-bold border-b-2 text-center transition flex items-center justify-center gap-1.5 ${
              activeSubTab === 'book'
                ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>Book Now & Voucher</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {activeSubTab === 'itinerary' && (
            <div className="space-y-6">
              {/* Live Interactive Route Map */}
              <LiveRouteMap
                cities={tour.cities}
                itinerary={tour.itinerary}
                tourTitle={tour.title}
              />

              {/* Overview Box */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-4">
                <h3 className="font-bold text-slate-900 text-sm mb-1">Tour Overview</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{tour.overview}</p>
              </div>

              {/* Highlights */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">Key Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {tour.highlights.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg text-xs text-slate-800 font-medium border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-by-Day Schedule */}
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3">Detailed Day-by-Day Schedule</h3>
                <div className="space-y-3">
                  {tour.itinerary.map((dayItem) => (
                    <div key={dayItem.day} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-sky-300 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded">
                          Day {dayItem.day}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{dayItem.stayOrLocation}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{dayItem.title}</h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{dayItem.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-4">
                  <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> What's Included
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950">
                    {tour.included.map((inc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-emerald-600">•</span> {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/40 border border-rose-200 rounded-xl p-4">
                  <h4 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" /> What's Excluded
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-950">
                    {tour.excluded.map((exc, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-rose-500">•</span> {exc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('book')}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-8 py-3 rounded-xl shadow-md transition text-sm inline-flex items-center gap-2"
                >
                  <span>Proceed to Select Dates & Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Map Tab View */}
          {activeSubTab === 'map' && (
            <div className="space-y-4">
              <TourRouteLeafletMap
                cities={tour.cities}
                itinerary={tour.itinerary}
                tourTitle={tour.title}
              />

              <div className="flex items-center justify-between gap-3 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="text-xs text-slate-600">
                  📍 Visited Cities: <strong className="text-slate-900">{tour.cities.join(' • ')}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('book')}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center gap-1.5 shrink-0"
                >
                  <span>Book This Tour Package</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'book' && (
            <div>
              {isSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                    ✓
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">Booking Confirmed!</h3>
                  <p className="text-sm text-slate-700 max-w-md mx-auto">
                    Thank you, <strong>{guestName}</strong>! Your tour reference number is{' '}
                    <strong className="text-sky-700">{lastBookingRef?.bookingId}</strong>. Zaara Travels team has been notified.
                  </p>

                  {/* Actions for Voucher & WhatsApp & PayPal */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
                    <a
                      href={`https://paypal.me/JahangirHussain958/${lastBookingRef?.totalAmountUSD || 100}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-6 rounded-xl shadow transition text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay via PayPal Link (${lastBookingRef?.totalAmountUSD})</span>
                    </a>

                    <button
                      onClick={handleGenerateVoucher}
                      className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-6 rounded-xl shadow transition text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Download / Print PDF Voucher</span>
                    </button>

                    <button
                      onClick={handleSendWhatsAppConfirmation}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition text-sm"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Send to Zaara Travels on WhatsApp</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 pt-2">
                    Official GST Invoice & Driver details will be transmitted 12 hours prior to travel date.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Interactive Stepper Visualizer */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between relative max-w-2xl mx-auto px-2">
                      {/* Background Progress Bar Line */}
                      <div className="absolute top-5 left-10 right-10 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />
                      <div
                        className="absolute top-5 left-10 -translate-y-1/2 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 rounded-full z-0 transition-all duration-300"
                        style={{
                          width: `${((bookingStep - 1) / 3) * 82}%`,
                        }}
                      />

                      {/* Step Nodes */}
                      {[
                        { step: 1, label: 'Dates & Group', icon: Calendar, badge: `${adults} A ${children > 0 ? `, ${children} C` : ''}` },
                        { step: 2, label: 'Vehicle & Hotel', icon: Car, badge: VEHICLES_DATA.find(v => v.id === selectedVehicle)?.name.split(' ')[0] },
                        { step: 3, label: 'Lead Guest', icon: User, badge: guestName ? guestName.split(' ')[0] : 'Required' },
                        { step: 4, label: 'Review & Pay', icon: CreditCard, badge: formattedFinalTotal },
                      ].map((item) => {
                        const isCompleted = bookingStep > item.step;
                        const isCurrent = bookingStep === item.step;
                        const Icon = item.icon;

                        return (
                          <button
                            key={item.step}
                            type="button"
                            onClick={() => handleJumpToStep(item.step)}
                            className="relative z-10 flex flex-col items-center group focus:outline-none"
                          >
                            <div
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-200'
                                  : isCurrent
                                  ? 'bg-sky-600 text-white ring-4 ring-sky-200 shadow-lg scale-110'
                                  : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-slate-400'
                              }`}
                            >
                              {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <span
                              className={`text-[10px] sm:text-xs font-bold mt-1.5 transition ${
                                isCurrent ? 'text-sky-700 font-extrabold' : isCompleted ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                              }`}
                            >
                              {item.label}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono hidden sm:inline-block">
                              {item.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <form onSubmit={handleConfirmBooking} className="space-y-6">
                    {/* Step 1: Dates, Pickup Time & Pickup Location (Search by Map) */}
                    {bookingStep === 1 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-sky-600" /> Step 1 of 4: Select Travel Date, Pickup Time & Location
                          </h3>
                          <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                            Phase 1/4
                          </span>
                        </div>

                        {/* Booking Date & Pickup Time Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Booking Date */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                                <span>Select Booking Date *</span>
                              </label>
                              <span className="text-[10px] text-sky-600 font-semibold bg-sky-50 px-2 py-0.5 rounded">
                                Free Cancellation
                              </span>
                            </div>

                            <input
                              type="date"
                              required
                              value={travelDate}
                              onChange={(e) => setTravelDate(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />

                            {/* Quick Date Presets */}
                            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto text-[11px]">
                              <span className="text-slate-400 text-[10px] font-medium shrink-0">Presets:</span>
                              <button
                                type="button"
                                onClick={() => handleSelectQuickDate(1)}
                                className="px-2 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 rounded font-semibold transition shrink-0"
                              >
                                Tomorrow
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectQuickDate(3)}
                                className="px-2 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 rounded font-semibold transition shrink-0"
                              >
                                In 3 Days
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSelectQuickDate(7)}
                                className="px-2 py-1 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-700 rounded font-semibold transition shrink-0"
                              >
                                In 1 Week
                              </button>
                            </div>
                          </div>

                          {/* Pickup Time */}
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Select Preferred Pickup Time *</span>
                              </label>
                              <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                Doorstep Chauffeur
                              </span>
                            </div>

                            <PickupTimePicker value={pickupTime} onChange={setPickupTime} />

                            <p className="text-[10px] text-slate-500 italic">
                              * Private chauffeur will arrive 10 mins prior with name placard.
                            </p>
                          </div>
                        </div>

                        {/* Pickup Location (Search by Map) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>Pickup Location & Hotel Address *</span>
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Airport terminal, railway station, or hotel in Delhi / Gurugram / Noida
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowMapPicker(true)}
                              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow transition transform active:scale-95 shrink-0"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              <span>Search on Map / GPS</span>
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Type hotel name, airport terminal, or address..."
                              value={pickupLocation}
                              onChange={(e) => setPickupLocation(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-24 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />

                            <button
                              type="button"
                              onClick={() => setShowMapPicker(true)}
                              className="absolute right-2 top-1.5 text-[11px] font-bold text-sky-700 bg-sky-100 hover:bg-sky-200 px-2.5 py-1 rounded-lg transition"
                            >
                              Interactive Map 📍
                            </button>
                          </div>

                          {/* Quick Location Preset Chips */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Popular Pickup Hotspots:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {POPULAR_PICKUP_LOCATIONS.slice(0, 6).map((loc) => (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => setPickupLocation(loc.name)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
                                    pickupLocation === loc.name
                                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                      : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200 hover:border-sky-300'
                                  }`}
                                >
                                  {loc.icon} {loc.name.split('(')[0].trim()}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Group Size Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>Adults (12+ yrs)</span>
                            </label>
                            <select
                              value={adults}
                              onChange={(e) => setAdults(parseInt(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>
                                  {n} Adult{n > 1 ? 's' : ''}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>Children (5-11 yrs)</span>
                            </label>
                            <select
                              value={children}
                              onChange={(e) => setChildren(parseInt(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              {[0, 1, 2, 3, 4].map((n) => (
                                <option key={n} value={n}>
                                  {n} Child{n > 1 ? 'ren' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setBookingStep(2)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-md transition flex items-center gap-2 transform active:scale-95"
                          >
                            <span>Next: Vehicle & Accommodation</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Private Vehicle & Hotel Options */}
                    {bookingStep === 2 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-600" /> Step 2 of 4: Vehicle & Accommodation Options
                          </h3>
                          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                            Phase 2/4
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {VEHICLES_DATA.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => setSelectedVehicle(v.id)}
                              className={`cursor-pointer p-3 rounded-xl border text-xs transition relative ${
                                selectedVehicle === v.id
                                  ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-500'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              {selectedVehicle === v.id && (
                                <div className="absolute top-2 right-2 w-4 h-4 bg-sky-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                  ✓
                                </div>
                              )}
                              <div className="font-bold text-slate-900">{v.name}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">{v.passengers}</div>
                              <div className="mt-2 font-semibold text-sky-700">
                                {v.id === 'sedan-dzire'
                                  ? 'Standard Included'
                                  : v.id === 'suv-innova'
                                  ? `+${currency === 'INR' ? '₹1,500' : '$20'}`
                                  : `+${currency === 'INR' ? '₹4,000' : '$50'}`}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Hotel Category (If Applicable)</label>
                          <select
                            value={hotelCategory}
                            onChange={(e) => setHotelCategory(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800"
                          >
                            <option value="4-star-heritage">4-Star Heritage Haveli & Boutique Resorts (Included)</option>
                            <option value="5-star-luxury">5-Star Luxury (Taj / Oberoi / Marriott) (+Additional Fee)</option>
                            <option value="car-only">Transport Only (I will book my own hotels)</option>
                          </select>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setBookingStep(3)}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-2"
                          >
                            <span>Next: Lead Guest Details</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Contact & Lead Passenger Details */}
                    {bookingStep === 3 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <User className="w-4 h-4 text-emerald-600" /> Step 3 of 4: Lead Guest Contact Information
                          </h3>
                          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                            Phase 3/4
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Sarah Thompson"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp No. *</label>
                            <input
                              type="tel"
                              required
                              placeholder="+1 555-0199 or +91 9876543210"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                              type="email"
                              placeholder="info@example.com"
                              value={guestEmail}
                              onChange={(e) => setGuestEmail(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests / Pickup Location</label>
                            <input
                              type="text"
                              placeholder="Flight No, Delhi Hotel name, dietary requirements"
                              value={specialRequests}
                              onChange={(e) => setSpecialRequests(e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <button
                            type="button"
                            onClick={handlePrevStep}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleNextStep}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-2"
                          >
                            <span>Next: Review & Payment</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Payment Terms & Summary */}
                    {bookingStep === 4 && (
                      <div className="space-y-4 animate-fadeIn">
                        {/* Coupon Code Input */}
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                          <input
                            type="text"
                            placeholder="Coupon (e.g. ZAARA10)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase w-48"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                          >
                            Apply
                          </button>
                          {couponMessage && (
                            <span className="text-xs font-bold text-slate-800 ml-2">{couponMessage}</span>
                          )}
                        </div>

                        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                            <div>
                              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-sky-400" /> Step 4 of 4: Review & Payment Terms
                              </h4>
                              <p className="text-xs text-slate-400">Supported by PayPal, Razorpay, Stripe & UPI</p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => setPaymentOption('full')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                  paymentOption === 'full' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                Pay Full Online
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentOption('deposit')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                  paymentOption === 'deposit' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                25% Advance Deposit
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentOption('arrival')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                                  paymentOption === 'arrival' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                Pay Driver on Arrival
                              </button>
                            </div>
                          </div>

                          {/* Gateway Selectors */}
                          <div>
                            <div className="text-xs font-bold text-slate-300 mb-2">Select Preferred Payment Gateway:</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('paypal')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                  paymentGateway === 'paypal'
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                PayPal Link
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('razorpay')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                  paymentGateway === 'razorpay'
                                    ? 'bg-sky-600 border-sky-400 text-white shadow'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                Razorpay / UPI
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('stripe')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                  paymentGateway === 'stripe'
                                    ? 'bg-purple-600 border-purple-400 text-white shadow'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                Stripe Card
                              </button>
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('upi')}
                                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                                  paymentGateway === 'upi'
                                    ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                                }`}
                              >
                                Google Pay / UPI
                              </button>
                            </div>

                            {/* PayPal Direct Banner */}
                            {paymentGateway === 'paypal' && (
                              <div className="mt-3 bg-indigo-950 p-3.5 rounded-xl border border-indigo-700 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-amber-300">
                                  <span>PayPal Express Payment Link:</span>
                                  <span className="font-mono text-indigo-300">paypal.me/JahangirHussain958</span>
                                </div>
                                <p className="text-slate-300 text-[11px] leading-relaxed">
                                  Pay securely in USD (${finalUSD}) or any international currency. Official instant invoice & booking confirmation voucher provided.
                                </p>
                                <a
                                  href={`https://paypal.me/JahangirHussain958/${finalUSD}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-2 w-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-black py-2 rounded-lg transition text-xs"
                                >
                                  <span>Pay Now via PayPal Link (${finalUSD})</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Travel Details Summary */}
                          <div className="bg-slate-800/90 border border-slate-700 p-3 rounded-xl text-xs space-y-1.5">
                            <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Trip Pickup & Schedule Details:</span>
                              <button
                                type="button"
                                onClick={() => setBookingStep(1)}
                                className="text-amber-400 hover:underline capitalize font-semibold"
                              >
                                Edit Schedule ✏️
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                              <div>📅 <strong>Date:</strong> {travelDate}</div>
                              <div>⏰ <strong>Pickup Time:</strong> {pickupTime}</div>
                              <div className="sm:col-span-3 text-slate-200">
                                📍 <strong>Pickup Point:</strong> {pickupLocation}
                              </div>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-750">
                            <div className="flex justify-between">
                              <span>Base Package ({adults} Adults):</span>
                              <span>{formattedSubtotal}</span>
                            </div>
                            {vehicleAddonUSD > 0 && (
                              <div className="flex justify-between text-amber-300">
                                <span>Vehicle Upgrade Add-on:</span>
                                <span>{formattedVehicleAddon}</span>
                              </div>
                            )}
                            {appliedDiscountPercent > 0 && (
                              <div className="flex justify-between text-emerald-400 font-bold">
                                <span>Discount ({appliedDiscountPercent}% OFF):</span>
                                <span>-{formattedDiscount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-base font-black text-white pt-2 border-t border-slate-700">
                              <span>Total Amount Payable ({currency}):</span>
                              <span className="text-amber-400">
                                {formattedFinalTotal}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={handlePrevStep}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-3.5 rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700"
                            >
                              <ArrowLeft className="w-4 h-4" />
                              <span>Back</span>
                            </button>

                            <button
                              type="submit"
                              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
                            >
                              <ShieldCheck className="w-5 h-5" />
                              <span>Confirm Booking & Generate PDF Voucher</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Leaflet & Google Maps Pickup Location Modal */}
      {showMapPicker && (
        <InteractiveMapPicker
          initialLocation={pickupLocation}
          onSelectLocation={(address) => setPickupLocation(address)}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};

