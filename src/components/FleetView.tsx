import React, { useState, useEffect } from 'react';
import { VEHICLES_DATA, getVehiclePerKmRate } from '../data/vehiclesData';
import { 
  Car, Users, ShieldCheck, CheckCircle2, MessageSquare, ArrowRight, ArrowLeft,
  Fuel, Sparkles, MapPin, Calendar, Clock, Filter, Phone, User, Mail, 
  Check, X, Compass, Wind, Luggage, DollarSign, Send, Zap, Navigation, Calculator,
  AlertTriangle, ChevronDown, ChevronUp, XCircle, CreditCard, Smartphone, Banknote, Wallet, FileText, Info,
  Download, Printer, Ticket, PlaneTakeoff, Home, Eye, Star, CheckCircle, SlidersHorizontal
} from 'lucide-react';
import { VehicleOption } from '../types';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { ScrollFadeIn } from './ScrollFadeIn';
import { estimateRouteKm } from './CabLocationMap';
import { GooglePlacesInput } from './GooglePlacesInput';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { openPrintableVoucher } from '../utils/voucherGenerator';
import { downloadBookingPDF } from '../utils/pdfGenerator';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { sanitizePhoneNumber, isValidPhoneNumber, handlePhoneKeyDown, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';
import { OfferBadge } from './OfferBadge';

interface FleetViewProps {
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onBookVehicle?: (vehicleName: string) => void;
  onAddBooking?: (booking: any) => void;
}

export type TripType = 'oneway' | 'roundtrip' | 'local' | 'airport';

const MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidMapsKey = Boolean(MAPS_API_KEY) && MAPS_API_KEY !== 'YOUR_API_KEY' && MAPS_API_KEY.trim().length > 5;

export const FleetView: React.FC<FleetViewProps> = ({ 
  currency, 
  rates = FALLBACK_RATES_FROM_USD, 
  onBookVehicle,
  onAddBooking 
}) => {
  // Page Navigation State:
  // 1: Cab Rental Home
  // 2: Vehicle List
  // 3: Vehicle Details
  // 4: Booking Details
  // 5: Payment
  // 6: Booking Confirmation
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const [bookingConfirmed, setBookingConfirmed] = useState<any | null>(null);

  // Booking Form State
  const [tripType, setTripType] = useState<TripType>('oneway');
  const [pickupLocation, setPickupLocation] = useState<string>('Indira Gandhi International Airport (DEL) T3, Delhi');
  const [dropLocation, setDropLocation] = useState<string>('Taj Mahal, Eastern Gate, Agra, Uttar Pradesh');
  const [isPickupSelectedFromMaps, setIsPickupSelectedFromMaps] = useState<boolean>(true);
  const [isDropSelectedFromMaps, setIsDropSelectedFromMaps] = useState<boolean>(true);
  
  const [oneWayDistanceKm, setOneWayDistanceKm] = useState<number>(230);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number>(230);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('09:00 AM');
  const [selectedCarId, setSelectedCarId] = useState<string>(VEHICLES_DATA[0]?.id || 'sedan-dzire');
  
  // Custom Fare Estimator State for Vehicle Details Page
  const [customCalcKm, setCustomCalcKm] = useState<number>(250);

  // Customer details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [passengersCount, setPassengersCount] = useState<number>(2);
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Cab Rental Payment Options State
  type CabPaymentChoice = 'arrival' | 'partial_25' | 'full_100';
  type CabPaymentGateway = 'payu' | 'upi' | 'paypal';

  const [paymentChoice, setPaymentChoice] = useState<CabPaymentChoice>('arrival');
  const [paymentGateway, setPaymentGateway] = useState<CabPaymentGateway>('payu');
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Payment Gateway Modal State
  const [isPaymentGatewayOpen, setIsPaymentGatewayOpen] = useState<boolean>(false);
  const [pendingBookingData, setPendingBookingData] = useState<any>(null);

  const activeVehicle = VEHICLES_DATA.find(v => v.id === selectedCarId) || VEHICLES_DATA[0];

  // Helper to update distance based on one-way KM and trip type
  const updateDistanceForTripType = (rawOneWayKm: number, currentType: TripType) => {
    const validOneWay = Math.max(1, rawOneWayKm);
    setOneWayDistanceKm(validOneWay);
    if (currentType === 'oneway') {
      setTotalDistanceKm(validOneWay);
    } else if (currentType === 'roundtrip') {
      setTotalDistanceKm(validOneWay * 2); // Automatically double KM for roundtrip
    } else if (currentType === 'local') {
      setTotalDistanceKm(80);
    } else if (currentType === 'airport') {
      setTotalDistanceKm(validOneWay || 45);
    }
  };

  // Helper to query Google Maps Distance Matrix service directly
  const fetchGoogleDistance = (origin: string, destination: string, currentType: TripType) => {
    if (!origin || (!destination && currentType !== 'local')) return;

    if (currentType === 'local') {
      updateDistanceForTripType(80, 'local');
      return;
    }

    if (typeof window !== 'undefined' && hasValidMapsKey && window.google?.maps?.DistanceMatrixService) {
      try {
        const matrixService = new window.google.maps.DistanceMatrixService();
        matrixService.getDistanceMatrix(
          {
            origins: [origin],
            destinations: [destination],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === 'OK' && response?.rows?.[0]?.elements?.[0]?.status === 'OK') {
              const element = response.rows[0].elements[0];
              const meters = element.distance.value;
              const km = Math.max(1, Math.round(meters / 1000));
              if (km > 0) {
                updateDistanceForTripType(km, currentType);
                return;
              }
            }
            const estKm = estimateRouteKm(origin, destination) || 230;
            updateDistanceForTripType(estKm, currentType);
          }
        );
        return;
      } catch (e) {
        console.warn('DistanceMatrix catch:', e);
      }
    }

    const estKm = estimateRouteKm(origin, destination) || 230;
    updateDistanceForTripType(estKm, currentType);
  };

  // Automatically recalculate Google Maps distance when pickup, drop, or tripType changes
  useEffect(() => {
    if (pickupLocation && dropLocation && tripType !== 'local') {
      fetchGoogleDistance(pickupLocation, dropLocation, tripType);
    } else if (tripType === 'local') {
      updateDistanceForTripType(80, 'local');
    }
  }, [pickupLocation, dropLocation, tripType]);

  // Adjust total distance when trip type changes
  const handleTripTypeChange = (type: TripType) => {
    setTripType(type);
    if (type === 'local') {
      setTotalDistanceKm(80);
      setDropLocation('Local City Sightseeing (8 Hours / 80 KM)');
      setIsDropSelectedFromMaps(true);
    } else if (type === 'airport') {
      setPickupLocation('Indira Gandhi International Airport (DEL) T3, Delhi');
      setDropLocation('Hotel / Destination in Delhi NCR (Airport Transfer)');
      setIsPickupSelectedFromMaps(true);
      setIsDropSelectedFromMaps(true);
      fetchGoogleDistance('Indira Gandhi International Airport (DEL) T3, Delhi', 'Hotel / Destination in Delhi NCR (Airport Transfer)', type);
    } else {
      fetchGoogleDistance(pickupLocation, dropLocation, type);
    }
  };

  // Calculate total fare automatically based on per KM rate x total KM
  const calculateTotalFare = (vehicle = activeVehicle, currentTripType = tripType) => {
    if (!vehicle) return { usd: 0, inr: 0, perKmINR: 14, perKmUSD: 0, effDistance: 0 };
    const perKmINR = getVehiclePerKmRate(vehicle);
    const perKmUSD = Number((perKmINR / 83.5).toFixed(2));
    
    // One Way: Distance * Rate
    // Round Trip: Distance * 2 * Rate
    // Local: 80 * Rate
    let effDistance = Math.max(1, oneWayDistanceKm);
    if (currentTripType === 'roundtrip') {
      effDistance = Math.max(1, oneWayDistanceKm) * 2;
    } else if (currentTripType === 'local') {
      effDistance = 80;
    } else {
      effDistance = Math.max(1, oneWayDistanceKm);
    }

    const baseINR = Math.round(effDistance * perKmINR);
    const baseUSD = Math.round(baseINR / 83.5);
    
    return { usd: baseUSD, inr: baseINR, perKmINR, perKmUSD, effDistance };
  };

  // Select vehicle & proceed directly to Step 2: Journey & Customer Details
  const handleSelectVehicleAndBook = (vehicleId: string) => {
    setSelectedCarId(vehicleId);
    setFormError('');
    setCurrentPage(2); // Move to Step 2: Journey & Customer Details
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleViewVehicleDetails = handleSelectVehicleAndBook;

  // Step 2 Validation before moving to Step 3 (Payment Options)
  const validateAndMoveToPayment = () => {
    setFormError('');
    if (!pickupLocation.trim()) {
      setFormError('Please enter or select a pickup location.');
      return;
    }
    if (tripType !== 'local' && !dropLocation.trim()) {
      setFormError('Please enter or select a drop location.');
      return;
    }
    if (!pickupDate) {
      setFormError('Please select a pickup date.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Please enter your phone/WhatsApp number.');
      return;
    }
    if (!isValidPhoneNumber(customerPhone)) {
      setFormError(PHONE_ERROR_MESSAGE);
      return;
    }
    setCurrentPage(3); // Proceed to Step 3: Payment Options
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!pickupLocation.trim()) {
      setFormError('Please enter or select a pickup location.');
      setCurrentPage(2);
      return;
    }
    if (tripType !== 'local' && !dropLocation.trim()) {
      setFormError('Please enter or select a drop location.');
      setCurrentPage(2);
      return;
    }
    if (!pickupDate) {
      setFormError('Please select a pickup date.');
      setCurrentPage(2);
      return;
    }
    if (!customerName.trim()) {
      setFormError('Please enter your full name.');
      setCurrentPage(2);
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Please enter your phone/WhatsApp number.');
      setCurrentPage(2);
      return;
    }
    if (!isValidPhoneNumber(customerPhone)) {
      setFormError(PHONE_ERROR_MESSAGE);
      setCurrentPage(2);
      return;
    }

    const { usd, inr, perKmINR } = calculateTotalFare();
    const bookingRef = `ZT-CAB-${Math.floor(100000 + Math.random() * 900000)}`;

    const tripTypeName = tripType === 'oneway' ? 'One Way Trip' : tripType === 'roundtrip' ? 'Round Trip' : tripType === 'local' ? 'Local City Rental' : 'Airport Transfer';

    let gatewayLabel = paymentGateway === 'payu' ? 'PayU Gateway' : paymentGateway === 'upi' ? 'Google UPI' : 'PayPal';
    let selectedPaymentMethod = '';
    let selectedPaymentStatus = '';

    const bookingDataPayload = {
      bookingId: bookingRef,
      guestName: customerName,
      guestPhone: customerPhone,
      guestEmail: customerEmail || 'customer@zaaratravels.com',
      tourTitle: `Cab Rental: ${activeVehicle.name} (${tripTypeName})`,
      travelDate: pickupDate,
      pickupLocation,
      dropLocation: dropLocation || 'Local City Sightseeing',
      pickupTime,
      vehicleType: `${activeVehicle.name} (${activeVehicle.category})`,
      hotelOption: 'Private Driver Cab Service',
      specialRequests: `Trip Type: ${tripTypeName} | Distance: ${totalDistanceKm} KM | Pickup: ${pickupTime} | ${specialRequests}`,
      totalAmountINR: inr,
      totalAmountUSD: usd,
      travelers: { adults: passengersCount, children: 0 },
      initialGateway: paymentGateway,
      initialChoice: paymentChoice === 'partial_25' ? 'advance_25' : paymentChoice === 'full_100' ? 'full' : 'arrival',
    };

    setPendingBookingData(bookingDataPayload);
    setIsPaymentGatewayOpen(true);
  };

  // Called when payment verification is successfully completed by PaymentGatewayModal
  const handlePaymentConfirmed = (confirmedRecord: any) => {
    const finalBookingRecord = {
      ...confirmedRecord,
      totalDistanceKm,
      perKmRateINR: calculateTotalFare().perKmINR,
      bookingDate: confirmedRecord.bookingDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    if (onAddBooking) {
      onAddBooking(finalBookingRecord);
    }

    if (onBookVehicle) {
      onBookVehicle(activeVehicle.name);
    }

    setBookingConfirmed(finalBookingRecord);
    setIsPaymentGatewayOpen(false);
    setCurrentPage(4); // Advance to Step 4: Booking Confirmation
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Document Preview Trigger
  const handleOpenPreview = () => {
    if (!bookingConfirmed) return;
    setShowPreviewModal(true);
  };

  // Download PDF Voucher Trigger
  const handleDownloadPDFVoucher = () => {
    if (!bookingConfirmed) return;
    downloadBookingPDF({
      bookingId: bookingConfirmed.bookingId,
      guestName: bookingConfirmed.guestName,
      guestPhone: bookingConfirmed.guestPhone,
      guestEmail: bookingConfirmed.guestEmail,
      tourTitle: bookingConfirmed.tourTitle,
      travelDate: bookingConfirmed.travelDate,
      pickupTime: bookingConfirmed.pickupTime,
      pickupLocation: bookingConfirmed.pickupLocation,
      dropLocation: bookingConfirmed.dropLocation,
      travelers: bookingConfirmed.travelers,
      vehicleType: bookingConfirmed.vehicleType,
      hotelOption: bookingConfirmed.hotelOption,
      totalAmountINR: bookingConfirmed.totalAmountINR,
      totalAmountUSD: bookingConfirmed.totalAmountUSD,
      paymentMethod: bookingConfirmed.paymentMethod,
      paymentStatus: bookingConfirmed.paymentStatus || 'CONFIRMED / PAID',
      bookingDate: bookingConfirmed.bookingDate,
      specialRequests: bookingConfirmed.specialRequests,
    });
  };

  // Open Printable Voucher Trigger
  const handleOpenPrintableVoucher = () => {
    if (!bookingConfirmed) return;
    openPrintableVoucher({
      bookingId: bookingConfirmed.bookingId,
      guestName: bookingConfirmed.guestName,
      guestPhone: bookingConfirmed.guestPhone,
      guestEmail: bookingConfirmed.guestEmail,
      tourTitle: bookingConfirmed.tourTitle,
      travelDate: bookingConfirmed.travelDate,
      pickupTime: bookingConfirmed.pickupTime,
      pickupLocation: bookingConfirmed.pickupLocation,
      dropLocation: bookingConfirmed.dropLocation,
      travelers: bookingConfirmed.travelers,
      vehicleType: bookingConfirmed.vehicleType,
      hotelOption: bookingConfirmed.hotelOption,
      totalAmountINR: bookingConfirmed.totalAmountINR,
      totalAmountUSD: bookingConfirmed.totalAmountUSD,
      paymentMethod: bookingConfirmed.paymentMethod,
      paymentStatus: bookingConfirmed.paymentStatus || 'PENDING PAYMENT',
      bookingDate: bookingConfirmed.bookingDate,
      specialRequests: bookingConfirmed.specialRequests,
    });
  };

  const { usd: estUSD, inr: estINR } = calculateTotalFare();
  const estTotalFormatted = formatConvertedPrice(estUSD, estINR, currency, rates);

  const est25INR = Math.round(estINR * 0.25);
  const est25USD = Math.round(estUSD * 0.25);
  const est75INR = estINR - est25INR;
  const est75USD = estUSD - est25USD;

  const est25Formatted = formatConvertedPrice(est25USD, est25INR, currency, rates);
  const est75Formatted = formatConvertedPrice(est75USD, est75INR, currency, rates);

  const stepsList = [
    { num: 1, stepText: 'Step 1 of 4', title: 'Vehicle Selection', icon: '🚘' },
    { num: 2, stepText: 'Step 2 of 4', title: 'Journey & Customer Details', icon: '📝' },
    { num: 3, stepText: 'Step 3 of 4', title: 'Payment Options', icon: '💳' },
    { num: 4, stepText: 'Step 4 of 4', title: 'Booking Confirmation', icon: '✅' },
  ];

  const filteredVehicles = selectedCategoryFilter === 'all' 
    ? VEHICLES_DATA 
    : VEHICLES_DATA.filter(v => v.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));

  const renderTariffComparisonCard = () => (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Transparent Pricing Guarantee
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">All-Inclusive Fare Inclusions & Features</h3>
          <p className="text-xs text-slate-300 mt-0.5">Every cab rental booking includes full driver coverage, vehicle permits, and flexible payment options.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-amber-400 font-extrabold text-xs block flex items-center gap-1.5">
            <Fuel className="w-4 h-4 text-emerald-400" /> Fuel & Maintenance
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            100% fuel charges, vehicle servicing, and commercial driver fees are included in the final amount.
          </p>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-amber-400 font-extrabold text-xs block flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-400" /> Verified Uniformed Driver
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Professional English/Hindi speaking driver with live GPS tracking and commercial passenger license.
          </p>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-amber-400 font-extrabold text-xs block flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-amber-400" /> Live Google Route
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Fares are computed automatically using Google Maps driving route distance for total accuracy.
          </p>
        </div>

        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 space-y-1">
          <span className="text-amber-400 font-extrabold text-xs block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Hidden Charges
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            No surprise surcharges or night driver fees. Pay on arrival or online with instant PDF vouchers.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Top Hero Banner */}
      <ScrollFadeIn direction="down">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>Zaara Travels® Private Cabs • All India Permits • Verified Drivers</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Cab Rental System
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Book One Way, Round Trip, Local Sightseeing & Airport Transfers with live Google Maps distance calculation, transparent per-KM rates, and instant PDF vouchers.
            </p>

            {/* Carried Forward Active Vehicle Banner Ribbon */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 rounded-xl text-amber-300 text-xs font-bold flex items-center gap-2">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Selected Vehicle: <strong className="text-white">{activeVehicle.name}</strong> ({activeVehicle.category})</span>
              </div>
              <div className="bg-slate-800/90 px-3.5 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 font-semibold flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculated Fare: {estTotalFormatted}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollFadeIn>

      {/* 4-Step Progress Indicator Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-md">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {stepsList.map((st) => {
            const isActive = currentPage === st.num;
            const isPassed = currentPage > st.num;
            return (
              <button
                key={st.num}
                type="button"
                onClick={() => {
                  if (st.num === 1) setCurrentPage(1);
                  else if (st.num === 2 && currentPage >= 2) setCurrentPage(2);
                  else if (st.num === 3 && currentPage >= 3) setCurrentPage(3);
                  else if (st.num === 4 && bookingConfirmed) setCurrentPage(4);
                }}
                disabled={(st.num > currentPage && st.num !== 2) || (st.num === 4 && !bookingConfirmed)}
                className={`p-3 rounded-xl text-left border transition flex items-center gap-3 relative ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-amber-400 shadow-md'
                    : isPassed
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                    : st.num === 4 && !bookingConfirmed
                    ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 cursor-pointer'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-xs ${
                  isActive ? 'bg-amber-400 text-slate-950' : isPassed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isPassed ? '✓' : st.num}
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`text-[10px] font-black tracking-wider uppercase block ${isActive ? 'text-amber-400' : isPassed ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {st.stepText}
                  </span>
                  <span className="text-xs font-extrabold truncate block leading-tight">{st.title}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="bg-red-50 text-red-700 text-xs font-bold p-3.5 rounded-2xl border border-red-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{formError}</span>
          </span>
          <button type="button" onClick={() => setFormError('')} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 1: VEHICLE SELECTION                                                 */}
      {/* ========================================================================= */}
      {currentPage === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 1. Select Trip Type (Compact & Clean) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
                    Step 1 • Journey Type
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">Select Trip Type</h2>
              </div>
              <p className="text-xs text-slate-500">Choose your travel route type to calculate exact distance fares.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'oneway', label: 'One Way', desc: 'Point-to-point intercity transfer', icon: Navigation },
                { id: 'roundtrip', label: 'Round Trip', desc: 'Outstation return journey with driver', icon: Compass },
                { id: 'local', label: 'Local', desc: '8 Hours / 80 KM City Sightseeing', icon: MapPin },
                { id: 'airport', label: 'Airport Transfers', desc: '24/7 Pickup & Drop with Flight Tracking', icon: PlaneTakeoff },
              ].map((type) => {
                const IconComponent = type.icon;
                const isSelected = tripType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => handleTripTypeChange(type.id as TripType)}
                    className={`p-3.5 rounded-xl text-left border transition-all duration-200 flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-amber-400'
                        : 'bg-slate-50/80 text-slate-800 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-amber-400/20 text-amber-400' : 'bg-slate-200/70 text-slate-700'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-extrabold text-xs flex items-center justify-between gap-1">
                        <span className="truncate">{type.label}</span>
                        {isSelected && <span className="text-amber-400 text-[10px] font-extrabold shrink-0">✓</span>}
                      </div>
                      <span className={`text-[11px] block mt-0.5 line-clamp-2 leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {type.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Categories & Single-Column Fleet List */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Our Vehicle Categories</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Select a category or browse our full available cab fleet below.</p>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {['all', 'Sedan', 'SUV', 'Innova Crysta', 'Tempo Traveller'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition border ${
                      selectedCategoryFilter === cat
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Display one vehicle per row with 1228px x 250px layout */}
            <div className="flex flex-col gap-6">
              {filteredVehicles.map((v) => {
                const isSelected = selectedCarId === v.id;
                const vFare = calculateTotalFare(v, tripType);
                const formattedVFare = formatConvertedPrice(vFare.usd, vFare.inr, currency, rates);
                return (
                  <div
                    key={v.id}
                    className={`max-w-[1228px] mx-auto w-full bg-white border rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row lg:h-[250px] ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-400' : 'border-slate-200'
                    }`}
                  >
                    {/* Left Side: Vehicle Image (40% width x 250px height) */}
                    <div className="relative w-full lg:w-[40%] h-[200px] sm:h-[230px] lg:h-[250px] bg-slate-950 overflow-hidden shrink-0">
                      <img
                        src={v.image}
                        alt={v.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 rounded-t-3xl lg:rounded-tr-none lg:rounded-l-3xl"
                      />
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        {v.discountPercentage || v.offerTag ? (
                          <OfferBadge discountPercentage={v.discountPercentage} offerTag={v.offerTag} />
                        ) : (
                          <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-3 py-1 rounded-xl shadow">
                            {v.category}
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 text-amber-400 text-xs font-black px-3 py-1.5 rounded-xl border border-amber-500/40 shadow backdrop-blur-md flex items-center justify-between z-10">
                        <span className="text-[11px] text-slate-300 font-bold">Total Fare</span>
                        <span className="text-sm font-black text-amber-400">{formattedVFare}</span>
                      </div>
                    </div>

                    {/* Right Side: Vehicle Details (60% width x 250px height) */}
                    <div className="w-full lg:w-[60%] lg:h-[250px] p-4 sm:p-5 flex flex-col justify-between space-y-3 lg:space-y-0">
                      {/* Section 1: Header - Name, Selected Badge & Best For */}
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 truncate leading-tight">
                            {v.name}
                          </h3>
                          {isSelected && (
                            <span className="bg-emerald-600 text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate mt-0.5">
                          <strong className="text-slate-800">Best For:</strong> {v.idealFor || 'Couples, solo travelers & small families'}
                        </p>
                      </div>

                      {/* Section 2: Capacity, Luggage & AC Type Grid */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 sm:p-2.5 rounded-2xl border border-slate-200 text-[11px]">
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-none">Capacity</span>
                          <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                            <Users className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                            <span className="truncate">{v.seatingCapacity || v.passengers}</span>
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-none">Luggage</span>
                          <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                            <Luggage className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{v.luggage}</span>
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-none">AC Type</span>
                          <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                            <Wind className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{v.acDetails || 'Climate Control AC'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Section 3: Included & Not Included Features */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100/80">
                          <span className="font-black text-emerald-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Included:
                          </span>
                          <span className="text-slate-700 font-medium truncate block mt-0.5">
                            {v.features.slice(0, 3).join(' • ')}
                          </span>
                        </div>

                        <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100/80">
                          <span className="font-black text-amber-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Info className="w-3 h-3 text-amber-600 shrink-0" /> Not Included:
                          </span>
                          <span className="text-slate-700 font-medium truncate block mt-0.5">
                            Beyond package KM (₹{v.ratePerKmINR || 17.5}/km) & airport parking
                          </span>
                        </div>
                      </div>

                      {/* Section 4: Select Vehicle Action Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => handleSelectVehicleAndBook(v.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm hover:shadow flex items-center justify-center gap-2"
                        >
                          <span>Select & Book {v.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Transparent Rate Guarantee Card */}
          {renderTariffComparisonCard()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: JOURNEY & CUSTOMER DETAILS                                       */}
      {/* ========================================================================= */}
      {currentPage === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          {/* Active Vehicle Ribbon */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-800 shadow">
            <div className="flex items-center gap-3">
              <img src={activeVehicle.image} alt={activeVehicle.name} className="w-14 h-14 object-cover rounded-xl border border-slate-700 shrink-0" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Step 2 of 4 • Journey & Customer Details</span>
                <h3 className="text-base font-black text-white">{activeVehicle.name} ({activeVehicle.category})</h3>
                <span className="text-xs text-slate-300">Trip Type: {tripType === 'oneway' ? 'One Way' : tripType === 'roundtrip' ? 'Round Trip' : tripType === 'local' ? 'Local' : 'Airport Transfer'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Estimated Fare</span>
                <span className="text-lg font-black text-amber-400">{estTotalFormatted}</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0"
              >
                Change Vehicle
              </button>
            </div>
          </div>

          {/* Pickup & Drop Google Maps Places Autocomplete */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                Pickup & Drop Locations (Google Maps Places Autocomplete)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GooglePlacesInput
                label="Pickup Location"
                placeholder="Search Google Maps e.g. Delhi Airport T3..."
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
                icon={<MapPin className="w-3.5 h-3.5 text-sky-600" />}
                required
              />

              {tripType !== 'local' ? (
                <GooglePlacesInput
                  label="Drop Location"
                  placeholder="Search Google Maps e.g. Taj Mahal Agra..."
                  value={dropLocation}
                  onChange={(val) => {
                    setDropLocation(val);
                    setIsDropSelectedFromMaps(false);
                  }}
                  onSelectLocation={(address) => {
                    setDropLocation(address);
                    setIsDropSelectedFromMaps(true);
                  }}
                  isSelectedFromMaps={isDropSelectedFromMaps}
                  icon={<MapPin className="w-3.5 h-3.5 text-amber-600" />}
                  required
                />
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-600" /> Local Package
                  </label>
                  <input
                    type="text"
                    readOnly
                    value="Local City Tour (8 Hours / 80 KM)"
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 cursor-not-allowed"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pickup Date, Pickup Time & Passengers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-sky-600" /> Pickup Time
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {['05:00 AM', '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM'].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-600" /> Number of Passengers
              </label>
              <select
                value={passengersCount}
                onChange={(e) => setPassengersCount(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Customer Contact Details */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
              Customer Contact Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-sky-600" /> Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Numbers only e.g. 9876543210"
                  value={customerPhone}
                  onKeyDown={handlePhoneKeyDown}
                  onChange={(e) => setCustomerPhone(sanitizePhoneNumber(e.target.value))}
                  className={`w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white ${
                    customerPhone && !isValidPhoneNumber(customerPhone) ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                  required
                />
                {customerPhone && !isValidPhoneNumber(customerPhone) && (
                  <p className="text-[11px] font-bold text-red-600 mt-1">
                    ⚠️ Enter digits only (e.g., 9876543210 or +919876543210).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sky-600" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Instructions (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Flight AI-102 arriving at 8:30 AM, child seat requested, extra luggage details, etc."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Step 2 Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className="px-5 py-3 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous (Vehicle Selection)</span>
            </button>

            <button
              type="button"
              onClick={validateAndMoveToPayment}
              className="px-6 py-3 rounded-xl text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-500 transition shadow-md flex items-center gap-2"
            >
              <span>Next (Payment Options)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: PAYMENT OPTIONS                                                   */}
      {/* ========================================================================= */}
      {currentPage === 3 && (
        <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-300">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block">Step 3 of 4 • Booking Summary & Payment</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">Payment Options</h2>
          </div>

          {/* Booking Summary Box */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">Booking Summary</span>
                <h4 className="text-lg font-black text-white">{activeVehicle.name} • {tripType === 'oneway' ? 'One Way' : tripType === 'roundtrip' ? 'Round Trip' : tripType === 'local' ? 'Local' : 'Airport Transfer'} ({totalDistanceKm} KM)</h4>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-bold">Total Fare</span>
                <span className="text-2xl font-black text-amber-400">{estTotalFormatted}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold">Pickup & Drop</span>
                <p className="font-semibold text-white mt-0.5">{pickupLocation} ➔ {dropLocation || 'Local Sightseeing'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-bold">Travel Date & Time</span>
                <p className="font-semibold text-white mt-0.5">{pickupDate || 'Not selected'} at {pickupTime}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-bold">Customer Details</span>
                <p className="font-semibold text-white mt-0.5">{customerName} ({customerPhone}) • {passengersCount} {passengersCount === 1 ? 'Passenger' : 'Passengers'}</p>
              </div>
            </div>

            {/* GST Financial Breakdown */}
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 text-xs space-y-1.5 pt-2.5">
              <div className="flex justify-between text-slate-300">
                <span>Base Amount:</span>
                <span className="font-bold text-white">
                  ₹{Math.round(calculateTotalFare().inr / 1.05).toLocaleString('en-IN')} (~${Math.round(calculateTotalFare().usd / 1.05)})
                </span>
              </div>
              <div className="flex justify-between text-amber-300/90">
                <span>Goods & Services Tax (GST @ 5%):</span>
                <span className="font-bold">
                  ₹{(calculateTotalFare().inr - Math.round(calculateTotalFare().inr / 1.05)).toLocaleString('en-IN')} (~${calculateTotalFare().usd - Math.round(calculateTotalFare().usd / 1.05)})
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-700/80 font-black text-sm text-white">
                <span>Total Amount Payable:</span>
                <span className="text-amber-400">{estTotalFormatted}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Select Payment Method
            </label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1: Pay on Arrival */}
              <div
                onClick={() => setPaymentChoice('arrival')}
                className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                  paymentChoice === 'arrival'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Zero Deposit
                    </span>
                    {paymentChoice === 'arrival' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
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
                    Full amount ({estTotalFormatted}) due at pickup
                  </span>
                </div>
              </div>

              {/* Option 2: Pay 25% Now & Rest to Driver */}
              <div
                onClick={() => setPaymentChoice('partial_25')}
                className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                  paymentChoice === 'partial_25'
                    ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800 border border-sky-200">
                      25% Deposit
                    </span>
                    {paymentChoice === 'partial_25' && <CheckCircle2 className="w-4 h-4 text-sky-600" />}
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-sky-600" />
                    Pay 25% Now & Rest to Driver
                  </h4>
                  <p className="text-xs text-slate-600">
                    Pay 25% advance token now. Pay remaining 75% to driver.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/80">
                  <div className="text-xs font-black text-slate-900">
                    Pay Now: <span className="text-sky-700">{est25Formatted}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold block">
                    Remaining {est75Formatted} due at pickup
                  </span>
                </div>
              </div>

              {/* Option 3: Pay 100% Online */}
              <div
                onClick={() => setPaymentChoice('full_100')}
                className={`cursor-pointer p-4 rounded-2xl border transition relative flex flex-col justify-between space-y-3 ${
                  paymentChoice === 'full_100'
                    ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-500 shadow-md'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                      100% Online
                    </span>
                    {paymentChoice === 'full_100' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
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
                    Pay Now: <span className="text-amber-700">{estTotalFormatted}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    ✓ Zero balance due on travel date
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Gateways (shown when Pay 25% or Pay 100% Online is selected) */}
          {paymentChoice !== 'arrival' ? (
            <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl space-y-3 border border-slate-800 shadow-inner">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                    Select Online Payment Gateway
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    Processing {paymentChoice === 'partial_25' ? `25% deposit (${est25Formatted})` : `100% full amount (${estTotalFormatted})`}
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
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-white">PayPal</span>
                      {paymentGateway === 'paypal' && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">International Cards & USD</span>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>You selected <strong>Pay on Arrival</strong>. Pay 100% cash or UPI directly to your assigned driver on pickup.</span>
            </div>
          )}

          {/* Terms Modal Link */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-amber-700 underline underline-offset-4 transition cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Read Cab Rental Terms & Conditions</span>
            </button>
          </div>

          {/* Step 3 Navigation Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous (Journey & Customer Details)</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Book Cab Now</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: BOOKING CONFIRMATION                                              */}
      {/* ========================================================================= */}
      {currentPage === 4 && bookingConfirmed && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className={`${bookingConfirmed.paymentStatus?.toUpperCase().includes('PENDING') ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} border rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-xl`}>
            <div className={`w-16 h-16 ${bookingConfirmed.paymentStatus?.toUpperCase().includes('PENDING') ? 'bg-amber-500' : 'bg-emerald-600'} text-white rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-lg`}>
              {bookingConfirmed.paymentStatus?.toUpperCase().includes('PENDING') ? '⏳' : '✓'}
            </div>
            <div>
              <span className={`text-xs font-black ${bookingConfirmed.paymentStatus?.toUpperCase().includes('PENDING') ? 'text-amber-800' : 'text-emerald-800'} uppercase tracking-widest block`}>
                Booking Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Booking Reference #{bookingConfirmed.bookingId}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Thank you <strong>{bookingConfirmed.guestName}</strong>! Your private driver cab reservation has been confirmed.
              </p>
              <div className="mt-2">
                <span className={`inline-block font-black text-xs px-3 py-1 rounded-full uppercase border ${
                  bookingConfirmed.paymentStatus?.toUpperCase().includes('PENDING')
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  Payment Status: {bookingConfirmed.paymentStatus}
                </span>
              </div>
            </div>

            {/* Booking Details Grid */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-5 text-left text-xs space-y-3 shadow-sm max-w-2xl mx-auto">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Booking Ref Number:</span>
                <span className="font-extrabold text-amber-700 font-mono text-sm">#{bookingConfirmed.bookingId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Customer Details:</span>
                <span className="font-extrabold text-slate-900">{bookingConfirmed.guestName} ({bookingConfirmed.guestPhone})</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Vehicle Details:</span>
                <span className="font-extrabold text-slate-900">{bookingConfirmed.vehicleType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Trip Details & Distance:</span>
                <span className="font-bold text-slate-900">{bookingConfirmed.tourTitle} ({bookingConfirmed.totalDistanceKm || totalDistanceKm} KM)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Pickup Location:</span>
                <span className="font-bold text-slate-900">{bookingConfirmed.pickupLocation}</span>
              </div>
              {bookingConfirmed.dropLocation && (
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-500">Drop Location:</span>
                  <span className="font-bold text-slate-900">{bookingConfirmed.dropLocation}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Travel Date & Time:</span>
                <span className="font-bold text-slate-900">{bookingConfirmed.travelDate} at {bookingConfirmed.pickupTime}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-500">Payment Status:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{bookingConfirmed.paymentStatus}</span>
              </div>

              {/* Financial & GST Breakdown */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 my-2">
                <div className="flex justify-between text-slate-600">
                  <span>Base Amount:</span>
                  <span className="font-bold text-slate-900">
                    ₹{Math.round(bookingConfirmed.totalAmountINR / 1.05).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Goods & Services Tax (GST @ 5%):</span>
                  <span className="font-bold text-amber-800">
                    ₹{(bookingConfirmed.totalAmountINR - Math.round(bookingConfirmed.totalAmountINR / 1.05)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200 font-black text-sm text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-emerald-700">
                    {formatConvertedPrice(bookingConfirmed.totalAmountUSD, bookingConfirmed.totalAmountINR, currency, rates)}
                  </span>
                </div>
              </div>

              {/* Terms & Conditions Box */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mt-2 space-y-1">
                <span className="font-black text-slate-900 uppercase text-[10px] tracking-wider block border-b border-slate-200 pb-1">
                  Terms & Conditions Highlights:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                  <li>Distance calculated garage-to-garage. Odometer readings apply.</li>
                  <li>Tolls, parking fees & state taxes charged as per actual receipts.</li>
                  <li>Night driver duty allowance applies between 10:00 PM and 06:00 AM.</li>
                  <li>Operating under valid Commercial All India Tourist Permit (TAXI).</li>
                  <li>Free cancellation up to 24 hours prior to pickup time with full refund.</li>
                </ul>
              </div>
            </div>

            {/* Actions: Download PDF Voucher, Preview Booking Voucher, Print/Save & WhatsApp Direct Open */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadPDFVoucher}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download PDF Voucher</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPreview}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 px-5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Preview Voucher</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintableVoucher}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 px-5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4 text-slate-950" />
                <span>Print/Save</span>
              </button>

              <a
                href={`https://wa.me/919933992786?text=${encodeURIComponent(
                  `Hello Zaara Travels! I just booked Cab Ref #${bookingConfirmed.bookingId} for ${bookingConfirmed.vehicleType}. Pickup: ${bookingConfirmed.travelDate} ${bookingConfirmed.pickupTime}. Please send my driver contact details.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Direct WhatsApp Open</span>
              </a>
            </div>

            {/* Start New Booking */}
            <div className="pt-4 border-t border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  setBookingConfirmed(null);
                  setCurrentPage(1);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 underline"
              >
                Book Another Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  <FileText className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Terms & Conditions</h3>
                  <p className="text-xs font-semibold text-slate-500">Cab Rental Service Policies & Rules</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terms List */}
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>Your trip has a KM limit. If your usage exceeds this limit, you will be charged for the excess KM used.</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>We promote cleaner fuel and your cab may be a CNG vehicle. The driver may need to refill CNG once or more during your trip. Please cooperate with the driver.</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>Airport Entry Parking charges, if applicable, are not included in the fare and will be charged extra.</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p>Your trip includes one pickup in the pickup city and one drop to the destination city. It does not include within city travel.</p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">5</span>
                <p>If your trip includes hill climbs, the cab AC may be switched off during such climbs.</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition shadow"
              >
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Advantage Overview */}
      <ScrollFadeIn direction="up">
        <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
              Zaara Travels Cab Guarantee
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Why Book Cabs With Zaara Travels?</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Trusted by 10,000+ international & domestic travelers across Delhi, Agra, Jaipur, Varanasi, and Rajasthan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Fuel className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-sm">Transparent Fixed Pricing</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clear all-inclusive quotes with no surge pricing. All fuel expenses, toll taxes, and state permits are fully covered in your quote.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-sm">English-Speaking Drivers</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Uniformed, police-verified drivers trained in safe highway driving, polite customer support, and local sightseeing routes.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-white text-sm">Chilled Water & Mobile Chargers</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clean, vacuumed vehicles equipped with complimentary bottled mineral water, hand sanitizer, and fast USB phone chargers.
              </p>
            </div>
          </div>
        </div>
      </ScrollFadeIn>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={isPaymentGatewayOpen}
        onClose={() => setIsPaymentGatewayOpen(false)}
        bookingData={pendingBookingData}
        currency={currency}
        rates={rates}
        onBookingConfirmed={handlePaymentConfirmed}
      />

      {/* Official Document Live Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        booking={bookingConfirmed}
        defaultDocType="booking"
      />
    </div>
  );
};
