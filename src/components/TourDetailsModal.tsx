import React, { useState } from 'react';
import { TourPackage, VehicleOption } from '../types';
import { X, Calendar, Users, Car, CheckCircle2, XCircle, ShieldCheck, CreditCard, MessageSquare, FileText, Star, Sparkles, MapPin, Building, ArrowRight, Check, User, ArrowLeft, Clock, Search, Navigation, Crosshair, Plane, Train, Hotel, Locate, Compass, Mail, Printer, Download, Banknote, Wallet, Smartphone, Globe } from 'lucide-react';
import { VEHICLES_DATA } from '../data/vehiclesData';
import { openPrintableVoucher } from '../utils/voucherGenerator';
import { downloadBookingPDF } from '../utils/pdfGenerator';
import { sendBookingConfirmationEmail } from '../utils/emailService';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { InteractiveMapPicker, POPULAR_DELHI_HOTSPOTS } from './InteractiveMapPicker';
import { PickupTimePicker } from './PickupTimePicker';
import { GooglePlacesInput } from './GooglePlacesInput';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { sanitizePhoneNumber, isValidPhoneNumber, handlePhoneKeyDown, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';

export const GUIDE_LANGUAGES = [
  'English',
  'French',
  'German',
  'Italian',
  'Russian',
  'Spanish',
  'Japanese',
  'Portuguese'
];

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
  const [itineraryMapType, setItineraryMapType] = useState<'leaflet' | 'schematic'>('leaflet');
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [previewBookingData, setPreviewBookingData] = useState<any>(null);
  
  // Booking Form State
  const [travelDate, setTravelDate] = useState<string>(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split('T')[0];
  });
  const [pickupTime, setPickupTime] = useState<string>('06:00 AM');
  const [pickupLocation, setPickupLocation] = useState<string>('Indira Gandhi Int\'l Airport (DEL) - Terminal 3');
  const [isPickupSelectedFromMaps, setIsPickupSelectedFromMaps] = useState<boolean>(true);
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [mapSearchQuery, setMapSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [guideLanguage, setGuideLanguage] = useState<string>('English');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('sedan-prime');
  const [selectedAccommodation, setSelectedAccommodation] = useState<'none' | '3star' | '4star' | '5star'>('4star');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment Gateway Modal State
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState<boolean>(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

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
          setPickupLocation(`Live GPS Pinpoint (Lat: ${lat}, Lng: ${lng}) - Delhi NCR Private Driver Pickup`);
          setIsPickupSelectedFromMaps(true);
          setShowMapPicker(false);
        },
        () => {
          setPickupLocation('Aerocity Hotel Zone / Delhi NCR Private Driver Pickup');
          setIsPickupSelectedFromMaps(true);
          setShowMapPicker(false);
        }
      );
    } else {
      setPickupLocation('Delhi Hotel / Airport Terminal Pickup');
      setIsPickupSelectedFromMaps(true);
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
  const [paymentGateway, setPaymentGateway] = useState<'payu' | 'paypal' | 'upi'>('payu');

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastBookingRef, setLastBookingRef] = useState<any>(null);

  // Price Calculations (USD as base calculation anchor)
  const basePriceUSD = tour.priceFromUSD;
  const basePriceINR = tour.priceFromINR;
  const rawSubtotalUSD = (basePriceUSD * adults) + (basePriceUSD * 0.6 * children);
  const rawSubtotalINR = (basePriceINR * adults) + (basePriceINR * 0.6 * children);
  
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

  // Add vehicle add-on fee if Ertiga/Innova or Tempo
  let vehicleAddonUSD = 0;
  let vehicleAddonINR = 0;
  if (selectedVehicle === 'suv-ertiga-innova') {
    vehicleAddonUSD = 30;
    vehicleAddonINR = 2500;
  } else if (selectedVehicle === 'urbania-tempo') {
    vehicleAddonUSD = 80;
    vehicleAddonINR = 6500;
  }

  const grossTotalUSD = rawSubtotalUSD + vehicleAddonUSD + accommodationAddonUSD;
  const grossTotalINR = rawSubtotalINR + vehicleAddonINR + accommodationAddonINR;
  const discountAmountUSD = Math.round((grossTotalUSD * appliedDiscountPercent) / 100);
  const discountAmountINR = Math.round((grossTotalINR * appliedDiscountPercent) / 100);
  const finalTotalUSD = Math.max(0, grossTotalUSD - discountAmountUSD);
  const finalTotalINR = Math.max(0, grossTotalINR - discountAmountINR);

  // Formatted price strings in current currency
  const formattedSubtotal = formatConvertedPrice(rawSubtotalUSD, rawSubtotalINR, currency, rates);
  const formattedVehicleAddon = vehicleAddonUSD > 0 ? formatConvertedPrice(vehicleAddonUSD, vehicleAddonINR, currency, rates) : 'Included';
  const formattedAccommodation = accommodationAddonINR > 0
    ? formatConvertedPrice(accommodationAddonUSD, accommodationAddonINR, currency, rates)
    : 'Included / No Extra Charge';
  const formattedDiscount = formatConvertedPrice(discountAmountUSD, discountAmountINR, currency, rates);
  const formattedFinalTotal = formatConvertedPrice(finalTotalUSD, finalTotalINR, currency, rates);

  // GST 5% breakdown for Tour Booking
  const tourAmountINR = Math.round(finalTotalINR / 1.05);
  const gstINR = finalTotalINR - tourAmountINR;
  const tourAmountUSD = Math.round(finalTotalUSD / 1.05);
  const gstUSD = finalTotalUSD - tourAmountUSD;

  // Convert for Voucher Display
  const finalINR = Math.round(finalTotalINR);
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

  const executeFinalBooking = async (bookingRecord: any) => {
    try {
      // 1. Send confirmation email (with attached PDF data & WhatsApp dispatch payload)
      await sendBookingConfirmationEmail({
        bookingId: bookingRecord.bookingId,
        guestName: bookingRecord.guestName,
        guestEmail: bookingRecord.guestEmail,
        guestPhone: bookingRecord.guestPhone,
        tourTitle: bookingRecord.tourTitle,
        travelDate: bookingRecord.travelDate,
        pickupTime: bookingRecord.pickupTime,
        pickupLocation: bookingRecord.pickupLocation,
        vehicleType: bookingRecord.vehicleType,
        baseAmountINR: bookingRecord.baseAmountINR ?? Math.round(bookingRecord.totalAmountINR / 1.05),
        gstAmountINR: bookingRecord.gstAmountINR ?? (bookingRecord.totalAmountINR - Math.round(bookingRecord.totalAmountINR / 1.05)),
        baseAmountUSD: bookingRecord.baseAmountUSD ?? Math.round(bookingRecord.totalAmountUSD / 1.05),
        gstAmountUSD: bookingRecord.gstAmountUSD ?? (bookingRecord.totalAmountUSD - Math.round(bookingRecord.totalAmountUSD / 1.05)),
        totalAmountINR: bookingRecord.totalAmountINR,
        totalAmountUSD: bookingRecord.totalAmountUSD,
        paymentMethod: bookingRecord.paymentMethod,
        paymentStatus: bookingRecord.paymentStatus,
        specialRequests: bookingRecord.specialRequests,
      });

      // 2. Automatically generate printable PDF voucher for guest
      openPrintableVoucher({
        bookingId: bookingRecord.bookingId,
        guestName: bookingRecord.guestName,
        guestEmail: bookingRecord.guestEmail,
        guestPhone: bookingRecord.guestPhone,
        tourTitle: bookingRecord.tourTitle,
        travelDate: bookingRecord.travelDate,
        pickupTime: bookingRecord.pickupTime,
        pickupLocation: bookingRecord.pickupLocation,
        dropLocation: bookingRecord.dropLocation || 'Hotel / Airport Destination',
        guideLanguage: bookingRecord.guideLanguage,
        travelers: bookingRecord.travelers,
        vehicleType: bookingRecord.vehicleType,
        hotelOption: bookingRecord.hotelOption,
        baseAmountINR: bookingRecord.baseAmountINR ?? Math.round(bookingRecord.totalAmountINR / 1.05),
        gstAmountINR: bookingRecord.gstAmountINR ?? (bookingRecord.totalAmountINR - Math.round(bookingRecord.totalAmountINR / 1.05)),
        baseAmountUSD: bookingRecord.baseAmountUSD ?? Math.round(bookingRecord.totalAmountUSD / 1.05),
        gstAmountUSD: bookingRecord.gstAmountUSD ?? (bookingRecord.totalAmountUSD - Math.round(bookingRecord.totalAmountUSD / 1.05)),
        totalAmountINR: bookingRecord.totalAmountINR,
        totalAmountUSD: bookingRecord.totalAmountUSD,
        paymentMethod: bookingRecord.paymentMethod,
        paymentStatus: bookingRecord.paymentStatus,
        bookingDate: bookingRecord.bookingDate,
        specialRequests: bookingRecord.specialRequests,
      });
    } catch (err) {
      console.warn('Booking confirmation API auto-dispatch notice logged locally:', err);
    }

    onAddBooking(bookingRecord);
    setLastBookingRef(bookingRecord);
    setIsSubmitted(true);

       setTimeout(() => {
      const waText = `*CONFIRMED BOOKING VOUCHER - ZAARA TRAVELS*
*Booking Ref:* ${bookingRecord.bookingId}
*Guest Name:* ${bookingRecord.guestName}
*Phone:* ${bookingRecord.guestPhone}
*Tour:* ${bookingRecord.tourTitle}
*Travel Date:* ${bookingRecord.travelDate}
*Guide Language:* ${bookingRecord.guideLanguage || guideLanguage}
*Vehicle:* ${bookingRecord.vehicleType}
*Total Amount:* ₹${bookingRecord.totalAmountINR.toLocaleString('en-IN')} ($${bookingRecord.totalAmountUSD} USD)
*Payment Method:* ${bookingRecord.paymentMethod}
*GSTIN:* 19ACUPH2897Q2ZA

Hello Zaara Travels, I completed my booking on the website! Please confirm driver assignment.`;
      window.open(`https://wa.me/919933992786?text=${encodeURIComponent(waText)}`, '_blank');
    }, 500);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      alert('Please fill in your Lead Guest Name and Mobile/WhatsApp number before proceeding.');
      setBookingStep(2);
      return;
    }
    if (!isValidPhoneNumber(guestPhone)) {
      alert(PHONE_ERROR_MESSAGE);
      setBookingStep(2);
      return;
    }

    const bookingId = 'ZT-' + Math.floor(100000 + Math.random() * 900000);
    const vehicleObj = VEHICLES_DATA.find((v) => v.id === selectedVehicle);

    const bookingDataPayload = {
      bookingId,
      guestName,
      guestPhone,
      guestEmail: guestEmail || 'guest@zaaratravel.com',
      tourTitle: tour.title,
      travelDate,
      pickupTime,
      pickupLocation,
      dropLocation: 'Hotel / Airport Destination',
      guideLanguage,
      vehicleType: vehicleObj ? vehicleObj.name : 'AC Sedan / Prime (Standard Included)',
      hotelOption: nights > 0 ? selectedAccommodationLabel : 'Day Tour (No Night Stay)',
      baseAmountINR: tourAmountINR,
      gstAmountINR: gstINR,
      baseAmountUSD: tourAmountUSD,
      gstAmountUSD: gstUSD,
      totalAmountINR: finalINR,
      totalAmountUSD: finalUSD,
      specialRequests,
      travelers: { adults, children },
      initialGateway: paymentOption === 'arrival' ? 'pay_on_arrival' : paymentGateway,
      initialChoice: paymentOption === 'deposit' ? 'advance_25' : paymentOption === 'full' ? 'full' : 'arrival',
    };

    if (paymentOption === 'arrival') {
      const confirmedRecord = {
        ...bookingDataPayload,
        paymentMethod: 'Pay on Arrival to Driver',
        paymentStatus: 'Pending (Pay on Arrival)',
        bookingDate: new Date().toLocaleDateString('en-GB'),
      };
      setBookingConfirmed(confirmedRecord);
      setBookingStep(4);
      await executeFinalBooking(confirmedRecord);
    } else {
      setPendingBookingData(bookingDataPayload);
      setIsPaymentGatewayOpen(true);
    }
  };

  const [bookingConfirmed, setBookingConfirmed] = useState<any>(null);

  const handlePaymentConfirmed = async (confirmedRecord: any) => {
    setIsPaymentGatewayOpen(false);
    setBookingConfirmed(confirmedRecord);
    setBookingStep(4);
    await executeFinalBooking(confirmedRecord);
  };

  const handleGenerateVoucher = () => {
    if (lastBookingRef) {
      openPrintableVoucher(lastBookingRef);
    }
  };

  const handleDownloadPDFVoucher = () => {
    if (lastBookingRef) {
      downloadBookingPDF({
        bookingId: lastBookingRef.bookingId,
        guestName: lastBookingRef.guestName,
        guestEmail: lastBookingRef.guestEmail,
        guestPhone: lastBookingRef.guestPhone,
        tourTitle: lastBookingRef.tourTitle,
        travelDate: lastBookingRef.travelDate,
        pickupTime: lastBookingRef.pickupTime,
        pickupLocation: lastBookingRef.pickupLocation,
        dropLocation: lastBookingRef.dropLocation || 'Hotel / Airport Destination',
        guideLanguage: lastBookingRef.guideLanguage,
        travelers: lastBookingRef.travelers,
        vehicleType: lastBookingRef.vehicleType,
        hotelOption: lastBookingRef.hotelOption,
        totalAmountINR: lastBookingRef.totalAmountINR,
        totalAmountUSD: lastBookingRef.totalAmountUSD,
        paymentMethod: lastBookingRef.paymentMethod,
        paymentStatus: lastBookingRef.paymentStatus,
        bookingDate: lastBookingRef.bookingDate,
        specialRequests: lastBookingRef.specialRequests,
      });
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
*Guide Language:* ${lastBookingRef.guideLanguage || 'English'}
*Travelers:* ${lastBookingRef.travelers.adults} Adults, ${lastBookingRef.travelers.children} Kids
*Vehicle:* ${lastBookingRef.vehicleType}
*Total Paid/Amount:* ₹${lastBookingRef.totalAmountINR.toLocaleString('en-IN')} (${lastBookingRef.paymentMethod})
*GSTIN:* 19ACUPH2897Q2ZA

Hello Zaara Travels, I completed my booking on the website! Please acknowledge and send driver details.`;

    window.open(`https://wa.me/919933992786?text=${encodeURIComponent(waText)}`, '_blank');
  };

  const handleSendEmailClientConfirmation = () => {
    if (!lastBookingRef) return;
    const subject = `CONFIRMED BOOKING VOUCHER - ${lastBookingRef.bookingId} - Zaara Travels`;
    const body = `Dear Zaara Travels Team,

I have completed my tour booking on www.zaaratravel.com!

BOOKING & TOUR DETAILS:
- Booking Reference ID: ${lastBookingRef.bookingId}
- Tour Package: ${lastBookingRef.tourTitle}
- Guest Name: ${lastBookingRef.guestName}
- Phone / WhatsApp: ${lastBookingRef.guestPhone}
- Guest Email: ${lastBookingRef.guestEmail}
- Travel Date: ${lastBookingRef.travelDate}
- Pickup Time: ${lastBookingRef.pickupTime || '06:00 AM'}
- Pickup Location: ${lastBookingRef.pickupLocation}
- Guide Language: ${lastBookingRef.guideLanguage || 'English'}
- Transport: ${lastBookingRef.vehicleType}
- Total Amount: ₹${lastBookingRef.totalAmountINR.toLocaleString('en-IN')} ($${lastBookingRef.totalAmountUSD} USD)
- Payment Option: ${lastBookingRef.paymentMethod} (${lastBookingRef.paymentStatus})

Please send driver assignment details and GST Tax Invoice.

Zaara Travels Details:
Website: www.zaaratravel.com
Email: info@zaaratravel.com
Phone/WhatsApp: +91 99339 92786 / +91 99329 99786 | Office: +011 69296175
GSTIN: 19ACUPH2897Q2ZA`;

    window.open(`mailto:info@zaaratravel.com,${encodeURIComponent(lastBookingRef.guestEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh] notranslate" translate="no">
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl transition shadow flex items-center gap-1.5 border border-amber-300"
              title="Print official itinerary"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Itinerary</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition focus:outline-none"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              {/* Printable PDF Banner Callout */}
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 text-white rounded-xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-md">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Official Printable PDF Itinerary</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Download a formatted PDF travel itinerary with full route details, inclusions & 24/7 helpline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2 border border-amber-300 shrink-0"
                >
                  <FileText className="w-4 h-4" />
                  <span>Print Itinerary</span>
                </button>
              </div>

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

              <div className="pt-2 text-center flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-extrabold px-6 py-3 rounded-xl shadow-md transition text-xs inline-flex items-center gap-2 border border-slate-700"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Print Itinerary</span>
                </button>
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

          {activeSubTab === 'book' && (
            <div>
              {isSubmitted ? (
                <div className={`${lastBookingRef?.paymentStatus?.toUpperCase().includes('PENDING') ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} border rounded-2xl p-6 text-center space-y-4`}>
                  <div className={`w-16 h-16 ${lastBookingRef?.paymentStatus?.toUpperCase().includes('PENDING') ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-600'} rounded-full flex items-center justify-center mx-auto text-3xl font-bold`}>
                    {lastBookingRef?.paymentStatus?.toUpperCase().includes('PENDING') ? '⏳' : '✓'}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    {lastBookingRef?.paymentStatus?.toUpperCase().includes('PENDING') ? 'Booking Received (Pending Payment)' : 'Booking Confirmed!'}
                  </h3>
                  <p className="text-sm text-slate-700 max-w-md mx-auto">
                    Thank you, <strong>{guestName}</strong>! Your tour reference number is{' '}
                    <strong className="text-sky-700">{lastBookingRef?.bookingId}</strong>.
                  </p>
                  <div>
                    <span className={`inline-block font-black text-xs px-3 py-1 rounded-full uppercase border ${
                      lastBookingRef?.paymentStatus?.toUpperCase().includes('PENDING') 
                        ? 'bg-amber-100 text-amber-900 border-amber-300' 
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      Payment Status: {lastBookingRef?.paymentStatus}
                    </span>
                  </div>

                  {/* Tour Booking Breakdown & GST Card */}
                  {lastBookingRef && (
                    <div className="bg-white border border-emerald-200 rounded-2xl p-5 text-left text-xs space-y-3 shadow-sm max-w-xl mx-auto">
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-500">Booking Reference:</span>
                        <span className="font-extrabold text-amber-700 font-mono text-sm">#{lastBookingRef.bookingId}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-500">Tour Package:</span>
                        <span className="font-extrabold text-slate-900">{lastBookingRef.tourTitle}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-500">Travel Date & Pickup:</span>
                        <span className="font-bold text-slate-800">{lastBookingRef.travelDate} ({lastBookingRef.pickupTime || '06:00 AM'})</span>
                      </div>

                      {/* GST & Financial Breakdown */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5">
                        <div className="flex justify-between text-slate-600">
                          <span>Base Amount:</span>
                          <span className="font-bold text-slate-900">
                            ₹{(lastBookingRef.baseAmountINR ?? Math.round(lastBookingRef.totalAmountINR / 1.05)).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Goods & Services Tax (GST @ 5%):</span>
                          <span className="font-bold text-amber-800">
                            ₹{(lastBookingRef.gstAmountINR ?? (lastBookingRef.totalAmountINR - Math.round(lastBookingRef.totalAmountINR / 1.05))).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black text-sm text-slate-900">
                          <span>Total Amount Payable:</span>
                          <span className="text-emerald-700">
                            ₹{lastBookingRef.totalAmountINR.toLocaleString('en-IN')} (~${lastBookingRef.totalAmountUSD} USD)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Backend Dispatch Notification Box */}
                  <div className="bg-slate-900 text-white p-4.5 rounded-xl text-left border border-slate-800 space-y-3 max-w-xl mx-auto shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Dispatch Status & Notifications
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/40">
                        AUTOMATICALLY DISPATCHED
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <div className="font-bold text-sky-400 flex items-center gap-1.5 mb-1">
                          <Mail className="w-3.5 h-3.5" /> Email Notification
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Sent to <strong className="text-white">info@zaaratravel.com</strong> & <strong className="text-white">{lastBookingRef?.guestEmail}</strong>
                        </p>
                      </div>

                      <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Dispatch
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Transmitted to Operations Desk (<strong className="text-white">+91 99339 92786</strong>)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Voucher & Email & WhatsApp */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center flex-wrap">
                    <button
                      type="button"
                      onClick={handleDownloadPDFVoucher}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl shadow transition text-xs sm:text-sm"
                    >
                      <Download className="w-4 h-4 text-white" />
                      <span>Download PDF Voucher</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendWhatsAppConfirmation}
                      className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-5 rounded-xl shadow transition text-xs sm:text-sm"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>Send / Open WhatsApp (+91 99339 92786)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendEmailClientConfirmation}
                      className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl shadow transition text-xs sm:text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send via Email Client (info@zaaratravel.com)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGenerateVoucher}
                      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-5 rounded-xl shadow transition text-xs sm:text-sm"
                    >
                      <Printer className="w-4 h-4 text-slate-950" />
                      <span>Print/Save</span>
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
                        { step: 1, label: 'Step 1: Tour Details', icon: Compass, badge: travelDate || 'Select Date' },
                        { step: 2, label: 'Step 2: Customer Details', icon: User, badge: guestName ? guestName.split(' ')[0] : 'Required' },
                        { step: 3, label: 'Step 3: Payment Options', icon: CreditCard, badge: formattedFinalTotal },
                        { step: 4, label: 'Step 4: Confirmation', icon: CheckCircle2, badge: 'Confirmed' },
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
                                Doorstep Private Driver
                              </span>
                            </div>

                            <PickupTimePicker value={pickupTime} onChange={setPickupTime} />

                            <p className="text-[10px] text-slate-500 italic">
                              * Private driver will arrive 10 mins prior with name placard.
                            </p>
                          </div>
                        </div>

                        {/* Pickup Location (Google Places Autocomplete + Map Picker) */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-emerald-600" />
                                <span>Pickup Location & Hotel Address *</span>
                              </label>
                              <p className="text-[11px] text-slate-500">
                                Search any city, airport, station, hotel, tourist attraction, or address across India
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

                          <GooglePlacesInput
                            label=""
                            placeholder="Type hotel name, airport, railway station, city, or address in India..."
                            value={pickupLocation}
                            onChange={(val) => {
                              setPickupLocation(val);
                              setIsPickupSelectedFromMaps(false);
                            }}
                            onSelectLocation={(address) => {
                              setPickupLocation(address);
                              setIsPickupSelectedFromMaps(true);
                            }}
                            isSelectedFromMaps={isPickupSelectedFromMaps}
                            icon={<MapPin className="w-4 h-4 text-emerald-600" />}
                            required
                          />

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
                                  onClick={() => {
                                    setPickupLocation(loc.name);
                                    setIsPickupSelectedFromMaps(true);
                                  }}
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

                        {/* Group Size & Guide Language Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-3.5 rounded-xl border border-slate-200">
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

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Guide Language *</span>
                            </label>
                            <select
                              value={guideLanguage}
                              onChange={(e) => setGuideLanguage(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              {GUIDE_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                  {lang} Guide
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
                            <span>Next: Vehicle {nights > 0 ? '& Accommodation' : 'Selection'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Accommodation & Trip Options */}
                    {bookingStep === 2 && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-5 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                            <Car className="w-4 h-4 text-amber-600" /> Step 2 of 4: {nights > 0 ? 'Accommodation & Tour Options' : 'Vehicle & Tour Confirmation'}
                          </h3>
                          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full">
                            Phase 2/4
                          </span>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-3">
                          <Car className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-900 block">Private Vehicle & Professional Driver Included</span>
                            <span className="text-slate-500 text-[11px]">Clean, air-conditioned private vehicle with professional English-speaking driver included for your tour.</span>
                          </div>
                        </div>

                        {/* Accommodation Options for Night Tours (Hidden for 0 nights) */}
                        {nights > 0 && (
                          <div className="pt-4 border-t border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                                <Building className="w-4 h-4 text-sky-600" /> Accommodation Category ({nights} Night{nights > 1 ? 's' : ''})
                              </h4>
                              <span className="text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                                Total Tour Price Updates Automatically
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {[
                                { id: 'none', label: 'Without Accommodation', rateINR: 0, rateUSD: 0 },
                                { id: '3star', label: '3-Star Hotel Accommodation', rateINR: 3000, rateUSD: 36 },
                                { id: '4star', label: '4-Star Hotel Accommodation', rateINR: 5000, rateUSD: 60 },
                                { id: '5star', label: '5-Star Luxury Accommodation', rateINR: 10000, rateUSD: 120 },
                              ].map((item) => {
                                const optAddonINR = item.rateINR * nights;
                                const optAddonUSD = item.rateUSD * nights;
                                const optGrossUSD = rawSubtotalUSD + vehicleAddonUSD + optAddonUSD;
                                const optGrossINR = rawSubtotalINR + vehicleAddonINR + optAddonINR;
                                const optDiscountUSD = Math.round((optGrossUSD * appliedDiscountPercent) / 100);
                                const optDiscountINR = Math.round((optGrossINR * appliedDiscountPercent) / 100);
                                const optFinalUSD = Math.max(0, optGrossUSD - optDiscountUSD);
                                const optFinalINR = Math.max(0, optGrossINR - optDiscountINR);
                                const formattedOptTotal = formatConvertedPrice(optFinalUSD, optFinalINR, currency, rates);

                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => setSelectedAccommodation(item.id as any)}
                                    className={`cursor-pointer p-3.5 rounded-xl border text-xs transition relative ${
                                      selectedAccommodation === item.id
                                        ? 'border-sky-600 bg-sky-50/90 ring-2 ring-sky-500 shadow-sm'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    {selectedAccommodation === item.id && (
                                      <div className="absolute top-2.5 right-2.5 w-4 h-4 bg-sky-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                        ✓
                                      </div>
                                    )}
                                    <div className="font-bold text-slate-900 pr-5">{item.label}</div>
                                    <div className="text-[11px] font-bold text-emerald-700 mt-1">
                                      Total Tour Amount: {formattedOptTotal}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

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
                              inputMode="numeric"
                              required
                              placeholder="e.g. 9933992786 or +919933992786"
                              value={guestPhone}
                              onKeyDown={handlePhoneKeyDown}
                              onChange={(e) => setGuestPhone(sanitizePhoneNumber(e.target.value))}
                              className={`w-full bg-white border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-sky-500 font-semibold ${
                                guestPhone && !isValidPhoneNumber(guestPhone) ? 'border-red-400 bg-red-50/50' : 'border-slate-300'
                              }`}
                            />
                            {guestPhone && !isValidPhoneNumber(guestPhone) && (
                              <p className="text-[11px] font-bold text-red-600 mt-1">
                                ⚠️ Enter 7 to 15 digits (digits & leading + only).
                              </p>
                            )}
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

                    {/* Step 3: Payment Options */}
                    {bookingStep === 3 && (
                      <div className="space-y-5 animate-fadeIn">
                        {/* Booking Summary Box */}
                        <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                            <div>
                              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Tour Booking Summary</span>
                              <h4 className="text-lg font-black text-white">{tour.title}</h4>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] uppercase text-slate-400 block font-bold">Total Tour Fare</span>
                              <span className="text-2xl font-black text-amber-400">{formattedFinalTotal}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Travel Date & Pickup</span>
                              <p className="font-semibold text-white mt-0.5">{travelDate} at {pickupTime}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Pickup Location</span>
                              <p className="font-semibold text-white mt-0.5 truncate">{pickupLocation}</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Lead Guest</span>
                              <p className="font-semibold text-white mt-0.5">{guestName} ({guestPhone})</p>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Vehicle & Guide</span>
                              <p className="font-semibold text-white mt-0.5">
                                {VEHICLES_DATA.find((v) => v.id === selectedVehicle)?.name || 'AC Sedan'} • {guideLanguage} Guide
                              </p>
                            </div>
                            {nights > 0 && (
                              <div className="sm:col-span-2">
                                <span className="text-slate-400 text-[10px] block font-bold">Accommodation Option</span>
                                <p className="font-semibold text-white mt-0.5">{selectedAccommodationLabel}</p>
                              </div>
                            )}
                          </div>

                          {/* GST Financial Breakdown */}
                          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-xs space-y-1.5 pt-2.5">
                            <div className="flex justify-between text-slate-300">
                              <span>Base Amount:</span>
                              <span className="font-bold text-white">
                                {formatConvertedPrice(tourAmountUSD, tourAmountINR, currency, rates)}
                              </span>
                            </div>
                            <div className="flex justify-between text-amber-300/90">
                              <span>Goods & Services Tax (GST @ 5%):</span>
                              <span className="font-bold">
                                {formatConvertedPrice(gstUSD, gstINR, currency, rates)}
                              </span>
                            </div>
                            {appliedDiscountPercent > 0 && (
                              <div className="flex justify-between text-blue-400 font-bold">
                                <span>Coupon Discount ({appliedDiscountPercent}% OFF):</span>
                                <span>-{formattedDiscount}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-1.5 border-t border-slate-700/80 font-black text-sm text-white">
                              <span>Total Amount Payable:</span>
                              <span className="text-amber-400">{formattedFinalTotal}</span>
                            </div>
                          </div>
                        </div>

                        {/* Coupon Code Input */}
                        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl">
                          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                          <input
                            type="text"
                            placeholder="Coupon Code (e.g. ZAARA10)"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="bg-white border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none rounded-lg px-3 py-1.5 text-xs font-bold uppercase w-48 text-blue-950"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition shadow-sm hover:shadow flex items-center gap-1.5"
                          >
                            <span>Apply Coupon</span>
                          </button>
                          {couponMessage && (
                            <span className="text-xs font-bold text-blue-900 ml-2">{couponMessage}</span>
                          )}
                        </div>

                        {/* Payment Options (Pay on Arrival / 25% Advance / 100% Online) */}
                        <div className="space-y-3">
                          <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Option
                          </label>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Pay on Arrival */}
                            <div
                              onClick={() => setPaymentOption('arrival')}
                              className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                                paymentOption === 'arrival'
                                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-md'
                                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Zero Deposit
                                  </span>
                                  {paymentOption === 'arrival' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                  <Banknote className="w-4 h-4 text-emerald-600" />
                                  Pay on Arrival
                                </h4>
                                <p className="text-xs text-slate-600">
                                  Pay 100% directly to driver upon pickup via Cash, UPI, or Card.
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/80">
                                <div className="text-xs font-black text-slate-900">
                                  Pay Now: <span className="text-emerald-700">₹0 / Free</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  Full amount ({formattedFinalTotal}) due at pickup
                                </span>
                              </div>
                            </div>

                            {/* Pay 25% Advance */}
                            <div
                              onClick={() => setPaymentOption('deposit')}
                              className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                                paymentOption === 'deposit'
                                  ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500 shadow-md'
                                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                                    25% Deposit
                                  </span>
                                  {paymentOption === 'deposit' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                  <Wallet className="w-4 h-4 text-sky-600" />
                                  Pay 25% Advance & Pay Remaining Amount to Driver
                                </h4>
                                <p className="text-xs text-slate-600">
                                  Pay 25% advance token now. Pay remaining 75% to driver.
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/80">
                                <div className="text-xs font-black text-slate-900">
                                  Pay Now: <span className="text-sky-700">{formatConvertedPrice(Math.round(finalTotalUSD * 0.25), Math.round(finalTotalINR * 0.25), currency, rates)}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-semibold block">
                                  Remaining {formatConvertedPrice(Math.round(finalTotalUSD * 0.75), Math.round(finalTotalINR * 0.75), currency, rates)} due at pickup
                                </span>
                              </div>
                            </div>

                            {/* Pay 100% Online */}
                            <div
                              onClick={() => setPaymentOption('full')}
                              className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                                paymentOption === 'full'
                                  ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500 shadow-md'
                                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                                    100% Online
                                  </span>
                                  {paymentOption === 'full' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                                  Pay 100% Online
                                </h4>
                                <p className="text-xs text-slate-600">
                                  Complete full payment upfront for priority driver & vehicle allocation.
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/80">
                                <div className="text-xs font-black text-slate-900">
                                  Pay Now: <span className="text-amber-700">{formattedFinalTotal}</span>
                                </div>
                                <span className="text-[10px] text-emerald-700 font-bold block">
                                  ✓ Zero balance due on travel date
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Online Payment Gateways (shown when 25% Advance or 100% Online is selected) */}
                        {paymentOption !== 'arrival' && (
                          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3 border border-slate-800 shadow-inner">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                              <div>
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                                  Select Online Payment Gateway
                                </span>
                                <span className="text-xs font-bold text-slate-200">
                                  Processing {paymentOption === 'deposit' ? `25% deposit (${formatConvertedPrice(Math.round(finalTotalUSD * 0.25), Math.round(finalTotalINR * 0.25), currency, rates)})` : `100% full amount (${formattedFinalTotal})`}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit Encrypted
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* PayU */}
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('payu')}
                                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                                  paymentGateway === 'payu'
                                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                                  <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-white">PayU</span>
                                    {paymentGateway === 'payu' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">Credit/Debit Cards, NetBanking</span>
                                </div>
                              </button>

                              {/* Google UPI */}
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('upi')}
                                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                                  paymentGateway === 'upi'
                                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <div className="w-9 h-9 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                                  <Smartphone className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-white">Google UPI</span>
                                    {paymentGateway === 'upi' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">GPay, PhonePe, Paytm UPI</span>
                                </div>
                              </button>

                              {/* PayPal */}
                              <button
                                type="button"
                                onClick={() => setPaymentGateway('paypal')}
                                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                                  paymentGateway === 'paypal'
                                    ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50'
                                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                                }`}
                              >
                                <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                                  <Globe className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-xs text-white">PayPal</span>
                                    {paymentGateway === 'paypal' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                  </div>
                                  <span className="text-[10px] text-slate-400 block truncate">International Credit Cards</span>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}

                        {/* CTA Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setBookingStep(2)}
                            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-4 py-3.5 rounded-xl text-xs transition flex items-center gap-1.5"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>

                          <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3.5 rounded-xl text-sm shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            <span>Proceed to Payment / Confirm Reservation</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Tour Booking Confirm, PDF Voucher, Preview, Print/Save & Direct WhatsApp */}
                    {bookingStep === 4 && (
                      <div className="space-y-6 animate-fadeIn py-2">
                        {/* Success Banner */}
                        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white p-6 rounded-2xl border border-emerald-500/40 shadow-xl space-y-4 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Sparkles className="w-36 h-36 text-emerald-300" />
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">Reservation Verified</span>
                              <h3 className="text-xl font-black text-white">Tour Booking Confirmed!</h3>
                              <p className="text-xs text-slate-300">Your tour reservation has been logged and confirmed in our system.</p>
                            </div>
                          </div>

                          {/* Booking Details Summary Box */}
                          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Booking Ref</span>
                              <span className="font-mono font-black text-amber-400 text-sm">{bookingConfirmed?.bookingId || lastBookingRef?.bookingId || 'ZT-CONFIRMED'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Lead Guest</span>
                              <span className="font-bold text-white truncate block">{bookingConfirmed?.guestName || guestName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Travel Date</span>
                              <span className="font-bold text-emerald-300">{bookingConfirmed?.travelDate || travelDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block font-bold">Total Fare</span>
                              <span className="font-black text-amber-400 text-sm">{formattedFinalTotal}</span>
                            </div>
                          </div>
                        </div>

                        {/* Voucher & Actions Grid */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-amber-600" /> Official Voucher & Direct Actions
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* 1. Download PDF Voucher */}
                            <button
                              type="button"
                              onClick={() => {
                                const dataToUse = bookingConfirmed || lastBookingRef || pendingBookingData;
                                if (dataToUse) downloadBookingPDF(dataToUse);
                              }}
                              className="p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md flex items-center gap-3 group text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
                                <Download className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-black text-sm">Download PDF Voucher</div>
                                <div className="text-[11px] text-emerald-100">Official branded PDF with QR Code</div>
                              </div>
                            </button>

                            {/* 2. Preview Voucher */}
                            <button
                              type="button"
                              onClick={() => {
                                const dataToUse = bookingConfirmed || lastBookingRef || pendingBookingData;
                                if (dataToUse) openPrintableVoucher(dataToUse);
                              }}
                              className="p-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-md flex items-center gap-3 group text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-amber-400/50 flex items-center justify-center text-slate-950 shrink-0 group-hover:scale-105 transition">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-black text-sm">Preview Voucher</div>
                                <div className="text-[11px] text-amber-950">View interactive digital voucher online</div>
                              </div>
                            </button>

                            {/* 3. Print / Save */}
                            <button
                              type="button"
                              onClick={() => {
                                const dataToUse = bookingConfirmed || lastBookingRef || pendingBookingData;
                                if (dataToUse) openPrintableVoucher(dataToUse);
                              }}
                              className="p-4 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-bold transition shadow-md flex items-center gap-3 group text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
                                <Printer className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-black text-sm">Print / Save Voucher</div>
                                <div className="text-[11px] text-sky-100">Print voucher or save to PDF</div>
                              </div>
                            </button>

                            {/* 4. Direct WhatsApp Open */}
                            <button
                              type="button"
                              onClick={() => {
                                const dataToUse = bookingConfirmed || lastBookingRef || pendingBookingData;
                                const waText = `*CONFIRMED BOOKING VOUCHER - ZAARA TRAVELS*
*Booking Ref:* ${dataToUse?.bookingId || 'ZT-CONFIRMED'}
*Guest Name:* ${dataToUse?.guestName || guestName}
*Phone:* ${dataToUse?.guestPhone || guestPhone}
*Tour:* ${dataToUse?.tourTitle || tour.title}
*Travel Date:* ${dataToUse?.travelDate || travelDate}
*Guide Language:* ${dataToUse?.guideLanguage || guideLanguage}
*Vehicle:* ${dataToUse?.vehicleType || selectedVehicle}
*Total Amount:* ${formattedFinalTotal}
*Payment Method:* ${dataToUse?.paymentMethod || paymentOption}
*GSTIN:* 19ACUPH2897Q2ZA

Hello Zaara Travels, I confirmed my booking! Please assign my driver and send vehicle details.`;
                                window.open(`https://wa.me/919837071869?text=${encodeURIComponent(waText)}`, '_blank');
                              }}
                              className="p-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition shadow-md flex items-center gap-3 group text-left"
                            >
                              <div className="w-10 h-10 rounded-xl bg-teal-500/40 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
                                <MessageSquare className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-black text-sm">Direct WhatsApp Open</div>
                                <div className="text-[11px] text-teal-100">Contact dispatch team (+91 9837071869)</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Close / Done Action */}
                        <div className="pt-2 flex justify-between items-center">
                          <button
                            type="button"
                            onClick={() => setBookingStep(3)}
                            className="text-xs text-slate-500 hover:text-slate-800 underline font-semibold"
                          >
                            ← View Payment Summary
                          </button>

                          <button
                            type="button"
                            onClick={onClose}
                            className="bg-slate-900 hover:bg-black text-white font-extrabold px-6 py-3 rounded-xl text-xs transition shadow-md"
                          >
                            Done & Close Window
                          </button>
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
          onSelectLocation={(address) => {
            setPickupLocation(address);
            setIsPickupSelectedFromMaps(true);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        bookingData={pendingBookingData}
        currency={currency}
        rates={rates}
        onBookingConfirmed={handlePaymentConfirmed}
      />
    </div>
  );
};

