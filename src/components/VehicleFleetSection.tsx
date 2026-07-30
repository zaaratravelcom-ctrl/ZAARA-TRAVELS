import React from 'react';
import { VEHICLES_DATA } from '../data/vehiclesData';
import { Car, ShieldCheck, CheckCircle2, MessageSquare, Users, Briefcase, Sparkles, Award } from 'lucide-react';

interface VehicleFleetSectionProps {
  currency: 'INR' | 'USD';
  onInquireVehicle: (vehicleName: string) => void;
}

export const VehicleFleetSection: React.FC<VehicleFleetSectionProps> = ({ currency, onInquireVehicle }) => {
  return (
    <section className="py-16 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Car className="w-3.5 h-3.5 text-sky-600" /> Official Private Chauffeur Fleet
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Private Car & Driver Services across India
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            All Zaara Travels vehicles feature dual-zone air-conditioning, clean interiors, GPS tracking, commercial permits, and uniform drivers managed directly by Zaara Travels.
          </p>
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VEHICLES_DATA.map((v) => {
            const priceText = currency === 'INR'
              ? `₹${v.ratePerDayINR.toLocaleString('en-IN')}`
              : `$${Math.round(v.ratePerDayINR / 83)}`;

            return (
              <div
                key={v.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition flex flex-col group"
              >
                {/* Vehicle Image */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    {v.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900">{v.name}</h3>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-sky-600" /> {v.passengers}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-600" /> {v.luggage}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      <strong>Best For:</strong> {v.idealFor}
                    </p>

                    <ul className="space-y-1.5 text-xs text-slate-600 pt-2">
                      {v.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Daily Rental</span>
                      <span className="text-xl font-black text-slate-900">
                        {priceText}
                        <span className="text-xs text-slate-500 font-normal"> / day</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onInquireVehicle(v.name)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>Rent Driver</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantees Ribbon */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block font-bold">GST Invoicing & Permits</strong>
              <span className="text-slate-400 text-xs">GSTIN: 19ACUPH2897Q2ZA provided for all bookings</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block font-bold">Uniform Commercial Chauffeurs</strong>
              <span className="text-slate-400 text-xs">Punctual, background-verified & courteous drivers</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block font-bold">Zero Hidden Toll / Fuel Fees</strong>
              <span className="text-slate-400 text-xs">Tolls, interstate permits, fuel & driver allowance included</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
