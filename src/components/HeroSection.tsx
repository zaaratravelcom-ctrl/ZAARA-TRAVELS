import React, { useState } from 'react';
import { Search, MapPin, Calendar, Sparkles, MessageSquare, ShieldCheck, Award, Users, Compass } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (category: string, city: string) => void;
  onOpenAIPlanner: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch, onOpenAIPlanner }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(selectedCategory, selectedCity);
  };

  return (
    <section className="relative bg-slate-950 text-white pt-12 pb-20 overflow-hidden">
      {/* Background Image with Dark Luxury Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=2400&q=85"
          alt="Taj Mahal Agra India"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-60 scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/90" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" /> Government Registered Operator
          </span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> GSTIN: 19ACUPH2897Q2ZA
          </span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Private AC Car & Driver Included
          </span>
        </div>

        {/* Hero Headline */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
            Discover India with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-sky-400 to-amber-300">Zaara Travels</span>
          </h1>
          <p className="text-base sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Your Journey, Our Passion. Premium private tour packages for Golden Triangle, Ranthambore Tiger Safaris, Delhi, Agra, Jaipur & Varanasi.
          </p>
        </div>

        {/* Tour Search & Filter Bar */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 max-w-5xl mx-auto text-slate-900">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-600" /> Tour Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Tour Categories</option>
                <option value="golden-triangle">Golden Triangle (Delhi-Agra-Jaipur)</option>
                <option value="safari">Ranthambore Tiger Safari</option>
                <option value="day-tour">Same Day Express Tours</option>
                <option value="sightseeing">City Sightseeing Tours</option>
                <option value="spiritual">Spiritual (Haridwar / Varanasi)</option>
              </select>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600" /> Preferred City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-sm focus:bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Destination Cities</option>
                <option value="Delhi">Delhi</option>
                <option value="Agra">Agra (Taj Mahal)</option>
                <option value="Jaipur">Jaipur (Pink City)</option>
                <option value="Ranthambore">Ranthambore (Tiger Safari)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Haridwar">Haridwar & Rishikesh</option>
                <option value="Varanasi">Varanasi</option>
              </select>
            </div>

            <div className="lg:col-span-4 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-black py-3 px-4 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Find Tours</span>
              </button>

              <button
                type="button"
                onClick={onOpenAIPlanner}
                title="AI Custom Planner"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black p-3 rounded-xl shadow-md transition flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </button>
            </div>
          </form>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-4 text-center">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="text-amber-400 font-extrabold text-lg sm:text-xl">100% Private</div>
            <div className="text-xs text-slate-400">Customized Car & Driver</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="text-amber-400 font-extrabold text-lg sm:text-xl">Instant Vouchers</div>
            <div className="text-xs text-slate-400">Printable PDF Booking Receipts</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="text-amber-400 font-extrabold text-lg sm:text-xl">Direct 24/7 Support</div>
            <div className="text-xs text-slate-400">WhatsApp (+91 99339 92786)</div>
          </div>
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 p-4 rounded-xl space-y-1">
            <div className="text-amber-400 font-extrabold text-lg sm:text-xl">No Hidden Fees</div>
            <div className="text-xs text-slate-400">All Tolls & Taxes Pre-included</div>
          </div>
        </div>
      </div>
    </section>
  );
};
