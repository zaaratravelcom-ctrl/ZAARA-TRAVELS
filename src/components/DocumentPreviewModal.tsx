import React, { useState } from 'react';
import { X, Printer, ArrowLeft, ShieldCheck, CheckCircle2, MapPin, Calendar, Clock, User, Phone, Mail, Car, CreditCard, FileText, Building2, HelpCircle, Sparkles, Download } from 'lucide-react';
import { BookingVoucherData } from '../utils/voucherGenerator';
import { downloadBookingPDF, downloadInvoicePDF } from '../utils/pdfGenerator';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingVoucherData | any | null;
  defaultDocType?: 'booking' | 'invoice' | 'itinerary';
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  defaultDocType = 'booking',
}) => {
  const [activeDocType, setActiveDocType] = useState<'booking' | 'invoice' | 'itinerary'>(defaultDocType);

  if (!isOpen || !booking) return null;

  // Extract properties safely with fallbacks
  const bookingId = booking.bookingId || booking.id || 'ZT-PENDING';
  const guestName = booking.guestName || booking.customerName || 'Valued Guest';
  const guestPhone = booking.guestPhone || booking.customerPhone || 'N/A';
  const guestEmail = booking.guestEmail || booking.customerEmail || 'info@zaaratravel.com';
  const tourTitle = booking.tourTitle || booking.packageName || booking.title || 'Golden Triangle & North India Tour Package';
  const travelDate = booking.travelDate || booking.pickupDate || new Date().toISOString().split('T')[0];
  const pickupTime = booking.pickupTime || '06:00 AM';
  const pickupLocation = booking.pickupLocation || 'Hotel / Indira Gandhi Int\'l Airport, New Delhi';
  const dropLocation = booking.dropLocation || 'Same as Pickup / Drop as per Itinerary';
  const vehicleType = booking.vehicleType || booking.selectedCar || 'Sedan (Dzire / Etios)';
  const guideLanguage = booking.guideLanguage || 'English';
  const adults = booking.travelers?.adults ?? booking.adults ?? 2;
  const children = booking.travelers?.children ?? booking.children ?? 0;
  const totalINR = booking.totalAmountINR ?? booking.totalINR ?? booking.priceINR ?? 15000;
  const totalUSD = booking.totalAmountUSD ?? booking.totalUSD ?? booking.priceUSD ?? Math.round(totalINR / 83);
  const paymentMethod = booking.paymentMethod || 'UPI / Online Gateway';
  const paymentStatus = booking.paymentStatus || 'CONFIRMED / PAID';
  const bookingDate = booking.bookingDate || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const specialRequests = booking.specialRequests || 'Standard All-Inclusive Service Requested';

  // Financial Breakdown calculations
  const baseFareINR = Math.round(totalINR / 1.05);
  const gstTaxINR = totalINR - baseFareINR;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (activeDocType === 'invoice') {
      downloadInvoicePDF(booking);
    } else {
      downloadBookingPDF(booking);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container Card */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Control Header - Hidden during print */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="Back / Close Preview"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 block">
                Official Document Live Preview
              </span>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Ref: {bookingId}</span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full uppercase font-extrabold">
                  {paymentStatus}
                </span>
              </h3>
            </div>
          </div>

          {/* Document Mode Switcher & Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveDocType('booking')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeDocType === 'booking'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Booking Voucher
              </button>
              <button
                onClick={() => setActiveDocType('invoice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeDocType === 'invoice'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tax Invoice
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              title="Download PDF Document"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              title="Print / Save Voucher Document"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Print/Save</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Mode Switcher for Mobile */}
        <div className="flex md:hidden bg-slate-100 p-2 border-b border-slate-200 print:hidden justify-center gap-2">
          <button
            onClick={() => setActiveDocType('booking')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition text-center ${
              activeDocType === 'booking' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            Booking Voucher
          </button>
          <button
            onClick={() => setActiveDocType('invoice')}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition text-center ${
              activeDocType === 'invoice' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            GST Tax Invoice
          </button>
        </div>

        {/* Scrollable Document Printable Paper Sheet */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 print:p-0 print:bg-white print:overflow-visible">
          
          {/* Paper Sheet Wrapper */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 max-w-3xl mx-auto space-y-6 text-slate-900 relative print:shadow-none print:border-none print:p-0">
            
            {/* Watermark Logo in background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <span className="text-8xl sm:text-9xl font-black tracking-widest text-slate-900 uppercase">ZAARA</span>
            </div>

            {/* Official Letterhead Header */}
            <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-xl shadow-md">
                    Z
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
                      ZAARA TRAVELS
                    </h1>
                    <p className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mt-1">
                      Govt. Authorized Tour & Cab Operations • New Delhi
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">
                  Rani Garden, Shastri Nagar, Geeta Colony, New Delhi - 110031
                  <br />
                  <strong>GSTIN:</strong> 19ACUPH2897Q2ZA • <strong>Web:</strong> www.zaaratravel.com
                </p>
              </div>

              <div className="text-left sm:text-right bg-slate-50 p-3.5 rounded-2xl border border-slate-200 sm:min-w-[220px]">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 block">
                  {activeDocType === 'invoice' ? 'GST TAX INVOICE' : 'OFFICIAL BOOKING VOUCHER'}
                </span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  #{bookingId}
                </span>
                <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                  ● Status: {paymentStatus}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Issue Date: {bookingDate}
                </span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  {activeDocType === 'invoice' ? 'Tax Invoice & Payment Receipt' : 'Confirmed Tour & Cab Service Voucher'}
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-300">
                24x7 Helpline: +91 99339 92786
              </span>
            </div>

            {/* Grid 1: Customer Details & Booking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Customer Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-700" />
                  <span>Guest & Traveler Information</span>
                </h4>
                <div className="space-y-1 text-slate-700 pt-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Guest Name:</span>
                    <span className="font-extrabold text-slate-900">{guestName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Phone / WhatsApp:</span>
                    <span className="font-bold text-slate-900">{guestPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Email Address:</span>
                    <span className="font-bold text-slate-900">{guestEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Group Size:</span>
                    <span className="font-extrabold text-slate-900">{adults} Adults, {children} Children</span>
                  </div>
                  {guideLanguage && (
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-500">Guide Language:</span>
                      <span className="font-bold text-slate-900">{guideLanguage}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Reference Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-700" />
                  <span>Service Schedule & Vehicle</span>
                </h4>
                <div className="space-y-1 text-slate-700 pt-1">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Travel Date:</span>
                    <span className="font-extrabold text-slate-900">{travelDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Pickup Time:</span>
                    <span className="font-bold text-slate-900">{pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Vehicle Allocated:</span>
                    <span className="font-extrabold text-amber-700">{vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Permit Status:</span>
                    <span className="font-bold text-emerald-700">All India Tourist Permit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Driver Assignment:</span>
                    <span className="font-bold text-slate-900">Assigned 2 hrs prior</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Route / Package / Itinerary Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span>Tour Package & Route Specifications</span>
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Package / Service Title</span>
                    <span className="text-sm font-black text-slate-900 block">{tourTitle}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Vehicle Category</span>
                    <span className="text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {vehicleType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px]">Pickup Point:</span>
                    <span className="font-extrabold text-slate-900 block text-xs mt-0.5">{pickupLocation}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block text-[10px]">Drop Point / Coverage:</span>
                    <span className="font-extrabold text-slate-900 block text-xs mt-0.5">{dropLocation}</span>
                  </div>
                </div>

                {specialRequests && (
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 text-amber-900">
                    <span className="font-bold block text-[10px] text-amber-800">Special Notes / Requests:</span>
                    <p className="font-medium text-xs mt-0.5">{specialRequests}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Grid 3: Financial & Payment Details Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-700" />
                <span>Payment & Tariff Breakdown</span>
              </h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black text-[11px]">
                      <th className="p-3">Service Particulars</th>
                      <th className="p-3 text-center">Tax / GST</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                      <th className="p-3 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">
                        Base Amount ({tourTitle} - {vehicleType})
                        <span className="block text-[10px] text-slate-500 font-normal">
                          Includes fuel, chauffeur, state permits, clean vehicle with AC
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-medium">5% GST Included</td>
                      <td className="p-3 text-right font-extrabold text-slate-900">₹{baseFareINR.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-bold text-slate-700">${Math.round(totalUSD * 0.95)}</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-slate-600 font-bold">Goods & Services Tax (GST @ 5%)</td>
                      <td className="p-3 text-center text-slate-600 font-medium">5.0%</td>
                      <td className="p-3 text-right font-semibold text-amber-800">₹{gstTaxINR.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right font-semibold text-slate-700">${totalUSD - Math.round(totalUSD * 0.95)}</td>
                    </tr>
                    <tr className="bg-emerald-50 font-black text-slate-900 text-sm">
                      <td className="p-3 text-emerald-950" colSpan={2}>
                        Total Amount Payable ({paymentMethod})
                      </td>
                      <td className="p-3 text-right text-emerald-800">₹{totalINR.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right text-emerald-800">${totalUSD} USD</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <div>
                  <strong>Payment Option Selected:</strong> {paymentMethod}
                </div>
                <div>
                  <strong>Payment Status:</strong> <span className="text-emerald-700 font-black uppercase">{paymentStatus}</span>
                </div>
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Official Terms & Service Conditions</span>
              </h4>

              <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px] leading-relaxed">
                <li><strong>Kilometer Limit & Odometer:</strong> Distance calculated garage-to-garage. Excess KM usage billed as per standard rate chart.</li>
                <li><strong>CNG Refuel Cooperation:</strong> Cabs promoting eco-friendly CNG may stop for refueling during long routes. Please cooperate with the driver.</li>
                <li><strong>Tolls & Parking:</strong> State taxes, interstate toll plaza fees, and airport entry parking fees are charged as per actual receipts.</li>
                <li><strong>Night Charges:</strong> Night allowance applies for driver duty between 10:00 PM and 06:00 AM.</li>
                <li><strong>Cancellation Policy:</strong> Free cancellation up to 24 hours prior to pickup time with full refund.</li>
                <li><strong>Authorized Permit:</strong> All vehicles operate under valid Commercial All India Tourist Permits (TAXI).</li>
              </ol>
            </div>

            {/* Company Info & Official Stamp Footer */}
            <div className="pt-4 border-t-2 border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1 text-xs text-slate-600">
                <div className="font-black text-slate-900 text-sm">ZAARA TRAVELS PRIVATE LIMITED</div>
                <p>Govt. Recognized Tour Operator & Fleet Manager</p>
                <p>📧 Email: info@zaaratravel.com | 📱 WhatsApp: +91 99339 92786</p>
                <p>📍 Head Office: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi - 110031</p>
              </div>

              {/* Authorised Signatory Seal Stamp */}
              <div className="text-center sm:text-right border-2 border-slate-900/20 p-3 rounded-2xl bg-amber-50/40 relative min-w-[180px] shrink-0">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Stamp</div>
                <div className="my-1.5 py-1 px-3 border border-dashed border-amber-600/60 rounded-lg bg-white/80 inline-block">
                  <span className="text-xs font-black text-amber-800 tracking-wider uppercase block">ZAARA TRAVELS</span>
                  <span className="text-[9px] font-bold text-slate-600 block">NEW DELHI - 110031</span>
                </div>
                <div className="text-[10px] font-bold text-slate-700">Authorised Signatory</div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Modal Actions Bar - Hidden during print */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Close Preview</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`https://wa.me/919933992786?text=${encodeURIComponent(
                `Hello Zaara Travels! I am inquiring regarding booking reference #${bookingId} for ${tourTitle}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5"
            >
              <span>WhatsApp Support</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Print/Save</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
