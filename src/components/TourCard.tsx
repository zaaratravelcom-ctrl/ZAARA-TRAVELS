import React from 'react';
import { TourPackage } from '../types';
import { Clock, MapPin, Star, ShieldCheck, ArrowRight, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { CurrencyCode, formatConvertedPrice } from '../utils/currencyConverter';

interface TourCardProps {
  tour: TourPackage;
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onSelectTour: (tour: TourPackage) => void;
  onQuickBook: (tour: TourPackage) => void;
  onCompareTour?: (tour: TourPackage) => void;
}

export const TourCard: React.FC<TourCardProps> = ({
  tour,
  currency,
  rates,
  onSelectTour,
  onQuickBook,
  onCompareTour,
}) => {
  const displayPrice = formatConvertedPrice(tour.priceFromUSD, tour.priceFromINR, currency, rates);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300/80 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-out flex flex-col group">
      {/* Image Banner */}
      <div className="relative h-56 overflow-hidden bg-slate-900">
        <img
          src={tour.image}
          alt={tour.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

        {/* Popular / Tag Badge */}
        {tour.popularTag && (
          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
            {tour.popularTag}
          </span>
        )}

        {/* Cities Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/50">
          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{tour.cities.join(' • ')}</span>
        </div>

        {/* Duration Badge & Compare Button */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {onCompareTour && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareTour(tour);
              }}
              className="flex items-center gap-1 text-slate-200 hover:text-white text-xs font-bold bg-slate-900/80 hover:bg-sky-600 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/50 transition shadow"
              title="Compare with another tour"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Compare</span>
            </button>
          )}
          <div className="flex items-center gap-1 text-white text-xs font-bold bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{tour.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Rating & Reviews */}
          <div className="flex items-center justify-between mb-2 text-xs">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{tour.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({tour.reviewsCount} reviews)</span>
            </div>
            <span className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Guaranteed Private Driver
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelectTour(tour)}
            className="text-lg font-bold text-slate-900 line-clamp-2 hover:text-sky-600 cursor-pointer transition leading-snug"
          >
            {tour.title}
          </h3>

          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {tour.overview}
          </p>

          {/* Top 2 Highlights */}
          <div className="mt-3 space-y-1">
            {tour.highlights.slice(0, 2).map((hl, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="line-clamp-1">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">Starting From</span>
            <div className="text-xl font-black text-slate-900">
              {displayPrice}
              <span className="text-xs font-normal text-slate-500 ml-1">/ person</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTour(tour)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs font-bold transition"
            >
              Details
            </button>
            <button
              onClick={() => onQuickBook(tour)}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm hover:shadow"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
