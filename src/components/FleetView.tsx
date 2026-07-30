import React from 'react';
import { VEHICLES_DATA, SERVICES_DATA } from '../data/vehiclesData';
import { Car, Users, ShieldCheck, CheckCircle2, MessageSquare, ArrowRight, Fuel, Sparkles } from 'lucide-react';
import { VehicleOption } from '../types';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import { ScrollFadeIn } from './ScrollFadeIn';

interface FleetViewProps {
  currency: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
  onBookVehicle: (vehicleName: string) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({ currency, rates = FALLBACK_RATES_FROM_USD, onBookVehicle }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Banner */}
      <ScrollFadeIn direction="down">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 text-center space-y-3 shadow-lg">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Chauffeur Driven Private Vehicles • All India Interstate Permits
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Private Car & Chauffeur Services</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Clean, air-conditioned Executive Sedans, Luxury SUVs, and Minibuses with uniformed, English-speaking professional drivers. All fuel, toll taxes, state permits, and driver allowances are included.
          </p>
        </div>
      </ScrollFadeIn>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {VEHICLES_DATA.map((v, idx) => {
          const rateUSD = Math.round(v.ratePerDayINR / 83.5);
          const rateDisplay = formatConvertedPrice(rateUSD, v.ratePerDayINR, currency, rates);

          return (
            <ScrollFadeIn key={v.id} direction="up" delay={idx * 0.1}>
              <div
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full"
              >
                <div>
                  <div className="relative h-48 bg-slate-900 overflow-hidden">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover opacity-90 hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow">
                      {v.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <h3 className="text-lg font-extrabold text-slate-900">{v.name}</h3>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-sky-600" /> {v.passengers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4 text-amber-600" /> {v.luggage}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                      💡 <strong>Ideal For:</strong> {v.idealFor}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-bold text-slate-900 block">Vehicle Amenities & Driver Policy:</span>
                      {v.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Per Day Rental Rate</span>
                    <div className="text-lg font-black text-slate-900">
                      {rateDisplay}
                      <span className="text-xs font-normal text-slate-500 ml-1">/ day</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookVehicle(v.name)}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                  >
                    Reserve Car
                  </button>
                </div>
              </div>
            </ScrollFadeIn>
          );
        })}
      </div>

      {/* Services Overview Grid */}
      <ScrollFadeIn direction="up">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Zaara Travels Advantage</span>
            <h2 className="text-2xl font-black text-slate-900">Why Hire Private Cars from Zaara Travels?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Fuel className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Zero Hidden Fuel / Toll Surcharges</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                All prices quoted by Zaara Travels are 100% inclusive of fuel, interstate taxes, highway toll taxes, parking fees, and driver allowances.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Vetted Uniformed Chauffeurs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our drivers are police-verified, fluent in English, background-checked, and thoroughly trained in safe defensive highway driving.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Sanitized & Chilled Refreshments</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every vehicle is thoroughly vacuumed and sanitized before departure, equipped with complimentary bottled mineral water, hand sanitizer, and mobile chargers.
              </p>
            </div>
          </div>
        </div>
      </ScrollFadeIn>
    </div>
  );
};
