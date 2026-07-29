import React, { useState } from 'react';
import { TourPackage } from '../types';
import { POPULAR_TOURS } from '../data/toursData';
import { CurrencyCode, formatConvertedPrice } from '../utils/currencyConverter';
import {
  X,
  ArrowRight,
  Check,
  XCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  Sparkles,
  ArrowRightLeft,
  ChevronRight
} from 'lucide-react';

interface CompareToursModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTourAId?: string;
  initialTourBId?: string;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onBookTour: (tour: TourPackage) => void;
}

export const CompareToursModal: React.FC<CompareToursModalProps> = ({
  isOpen,
  onClose,
  initialTourAId,
  initialTourBId,
  currency,
  rates,
  onBookTour,
}) => {
  const [tourAId, setTourAId] = useState<string>(initialTourAId || POPULAR_TOURS[0].id);
  const [tourBId, setTourBId] = useState<string>(
    initialTourBId || (initialTourAId === POPULAR_TOURS[1].id ? POPULAR_TOURS[0].id : POPULAR_TOURS[1].id)
  );

  if (!isOpen) return null;

  const tourA = POPULAR_TOURS.find((t) => t.id === tourAId) || POPULAR_TOURS[0];
  const tourB = POPULAR_TOURS.find((t) => t.id === tourBId) || POPULAR_TOURS[1];

  const formatPrice = (tour: TourPackage) => {
    return formatConvertedPrice(tour.priceFromUSD, tour.priceFromINR, currency, rates);
  };

  const handleSwap = () => {
    setTourAId(tourBId);
    setTourBId(tourAId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Interactive Tour Comparison Matrix
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Compare Tour Packages Side-by-Side
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            aria-label="Close Comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tour Selection Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center shrink-0">
          <div className="md:col-span-5 flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Tour 1:</label>
            <select
              value={tourAId}
              onChange={(e) => setTourAId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-sky-500"
            >
              {POPULAR_TOURS.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === tourBId}>
                  {t.title} ({t.duration})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center">
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-900 text-xs font-bold transition shadow-sm"
              title="Swap Tour A and Tour B"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Swap</span>
            </button>
          </div>

          <div className="md:col-span-5 flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Tour 2:</label>
            <select
              value={tourBId}
              onChange={(e) => setTourBId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-sky-500"
            >
              {POPULAR_TOURS.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === tourAId}>
                  {t.title} ({t.duration})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-8 flex-1">
          {/* Tour Card Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tour A Card */}
            <div className="bg-white border-2 border-sky-500 rounded-2xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between">
              <span className="absolute -top-3 left-4 bg-sky-600 text-white font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                Option A
              </span>

              <div className="space-y-3">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                  <img src={tourA.image} alt={tourA.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs font-extrabold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {tourA.duration}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-snug">{tourA.title}</h3>

                <div className="flex items-baseline justify-between border-t pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Starting From</span>
                    <div className="text-2xl font-black text-sky-700">{formatPrice(tourA)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{tourA.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({tourA.reviewsCount})</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBookTour(tourA);
                }}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs"
              >
                <span>Book Option A ({tourA.duration})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tour B Card */}
            <div className="bg-white border-2 border-amber-500 rounded-2xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between">
              <span className="absolute -top-3 left-4 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow">
                Option B
              </span>

              <div className="space-y-3">
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                  <img src={tourB.image} alt={tourB.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white text-xs font-extrabold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {tourB.duration}
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-900 leading-snug">{tourB.title}</h3>

                <div className="flex items-baseline justify-between border-t pt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Starting From</span>
                    <div className="text-2xl font-black text-amber-700">{formatPrice(tourB)}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{tourB.rating.toFixed(1)}</span>
                    <span className="text-slate-400">({tourB.reviewsCount})</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onBookTour(tourB);
                }}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2.5 rounded-xl transition shadow flex items-center justify-center gap-2 text-xs"
              >
                <span>Book Option B ({tourB.duration})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Side-by-Side Comparison Matrix Table */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-slate-900 text-white p-3 px-5 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Detailed Feature & Inclusions Comparison
            </div>

            <div className="divide-y divide-slate-200 text-xs">
              {/* Duration & Cities */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-white items-center gap-4">
                <div className="md:col-span-3 font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">
                  Cities & Destinations
                </div>
                <div className="md:col-span-4 font-bold text-sky-800 bg-sky-50/80 p-2.5 rounded-xl border border-sky-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{tourA.cities.join(' • ')}</span>
                </div>
                <div className="md:col-span-5 font-bold text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{tourB.cities.join(' • ')}</span>
                </div>
              </div>

              {/* Primary Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-slate-50/60 items-start gap-4">
                <div className="md:col-span-3 font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pt-1">
                  Tour Highlights
                </div>
                <div className="md:col-span-4 space-y-1.5">
                  {tourA.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-5 space-y-1.5">
                  {tourB.highlights.map((hl, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-white items-start gap-4">
                <div className="md:col-span-3 font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pt-1">
                  What’s Included
                </div>
                <div className="md:col-span-4 space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  {tourA.included.map((inc, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-5 space-y-1.5 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  {tourB.included.map((inc, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-slate-50/60 items-start gap-4">
                <div className="md:col-span-3 font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pt-1">
                  Exclusions
                </div>
                <div className="md:col-span-4 space-y-1.5 text-slate-600">
                  {tourA.excluded.map((exc, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-5 space-y-1.5 text-slate-600">
                  {tourB.excluded.map((exc, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-12 p-4 bg-white items-start gap-4">
                <div className="md:col-span-3 font-extrabold text-slate-900 uppercase tracking-wider text-[11px] pt-1">
                  Day-by-Day Overview
                </div>
                <div className="md:col-span-4 space-y-2">
                  {tourA.itinerary.map((day) => (
                    <div key={day.day} className="bg-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <div className="font-extrabold text-sky-800">Day {day.day}: {day.title}</div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{day.description}</p>
                    </div>
                  ))}
                </div>
                <div className="md:col-span-5 space-y-2">
                  {tourB.itinerary.map((day) => (
                    <div key={day.day} className="bg-slate-100 p-2.5 rounded-xl space-y-0.5">
                      <div className="font-extrabold text-amber-800">Day {day.day}: {day.title}</div>
                      <p className="text-[11px] text-slate-600 line-clamp-2">{day.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            Need help deciding? Contact MD Jahangir Khan on WhatsApp (+91 98372 08973) for custom advice.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-200 font-bold text-xs transition"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
