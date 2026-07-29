import React, { useState } from 'react';
import { Sun, CloudSun, Calendar, Thermometer, MapPin, Sparkles, Compass, Info } from 'lucide-react';

interface CityClimate {
  city: string;
  state: string;
  tempC: number;
  condition: string;
  bestMonths: string;
  idealSeason: string;
  seasonBadge: string;
  tip: string;
  bgColor: string;
}

const CITY_CLIMATE_DATA: CityClimate[] = [
  {
    city: 'Delhi',
    state: 'National Capital Territory',
    tempC: 28,
    condition: 'Sunny & Pleasant',
    bestMonths: 'October to March',
    idealSeason: 'Winter / Spring',
    seasonBadge: 'Best Time Now',
    tip: 'Ideal for Golden Triangle tours, Red Fort & Qutub Minar sight-seeing.',
    bgColor: 'from-amber-50 to-orange-50/50',
  },
  {
    city: 'Agra',
    state: 'Uttar Pradesh',
    tempC: 29,
    condition: 'Clear Sky',
    bestMonths: 'October to March',
    idealSeason: 'Winter',
    seasonBadge: 'Optimal Photography',
    tip: 'Early morning sunrise visits to the Taj Mahal offer cool breezes and magnificent reflection views.',
    bgColor: 'from-sky-50 to-indigo-50/50',
  },
  {
    city: 'Jaipur',
    state: 'Rajasthan',
    tempC: 31,
    condition: 'Warm & Dry',
    bestMonths: 'October to March',
    idealSeason: 'Winter / Spring',
    seasonBadge: 'Festive Season',
    tip: 'Great weather for Amber Fort elephant rides, Hawa Mahal photography, and bazaar shopping.',
    bgColor: 'from-rose-50 to-amber-50/50',
  },
  {
    city: 'Udaipur',
    state: 'Rajasthan',
    tempC: 27,
    condition: 'Pleasant Lake Breeze',
    bestMonths: 'September to March',
    idealSeason: 'Autumn / Winter',
    seasonBadge: 'Romantic Peak',
    tip: 'Perfect temperatures for Lake Pichola sunset boat cruises and palace courtyard tours.',
    bgColor: 'from-emerald-50 to-teal-50/50',
  },
  {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    tempC: 28,
    condition: 'Mild & Sunny',
    bestMonths: 'October to March',
    idealSeason: 'Winter',
    seasonBadge: 'Spiritual Peak',
    tip: 'Pleasant evening Ganga Aarti boat tours and early morning ghat walks.',
    bgColor: 'from-purple-50 to-indigo-50/50',
  },
  {
    city: 'Munnar & Alleppey',
    state: 'Kerala',
    tempC: 24,
    condition: 'Tropical & Refreshing',
    bestMonths: 'September to March',
    idealSeason: 'Post-Monsoon',
    seasonBadge: 'Green Paradise',
    tip: 'Mild climate with crisp tea garden air and pleasant backwater houseboat cruising.',
    bgColor: 'from-green-50 to-emerald-50/50',
  },
];

export const RegionalClimateSection: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Agra');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  const activeCityData = CITY_CLIMATE_DATA.find((c) => c.city === selectedCity) || CITY_CLIMATE_DATA[1];

  const formatTemp = (celsius: number) => {
    if (tempUnit === 'F') {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${celsius}°C`;
  };

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden rounded-3xl my-10 shadow-2xl border border-slate-800">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Live Destination Climate & Travel Planner
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Regional Climate & Best Visit Months
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              Check live weather lookups and optimal travel windows across India's top tourist destinations.
            </p>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80 self-start md:self-auto">
            <span className="text-xs font-semibold text-slate-400 px-2">Unit:</span>
            <button
              onClick={() => setTempUnit('C')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                tempUnit === 'C'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                tempUnit === 'F'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              °F
            </button>
          </div>
        </div>

        {/* City Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          {CITY_CLIMATE_DATA.map((item) => {
            const isSelected = item.city === selectedCity;
            return (
              <button
                key={item.city}
                onClick={() => setSelectedCity(item.city)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20 scale-105'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-amber-400'}`} />
                <span>{item.city}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {formatTemp(item.tempC)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active City Spotlight Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60">
          {/* Main Weather Stat */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-sky-400" />
                  {activeCityData.state}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {activeCityData.seasonBadge}
                </span>
              </div>

              <h3 className="text-3xl font-black text-white tracking-tight mb-1">
                {activeCityData.city}
              </h3>
              <p className="text-slate-400 text-xs">{activeCityData.condition}</p>
            </div>

            <div className="my-6 flex items-baseline gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sun className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <div className="text-5xl font-black text-white tracking-tight">
                  {formatTemp(activeCityData.tempC)}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-semibold">
                  <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Average Daytime Temp
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-sky-400" /> Travel Climate Comfort
              </span>
              <span className="font-bold text-emerald-400">Excellent</span>
            </div>
          </div>

          {/* Best Visit Months & Advice */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Best Season */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-4 h-4" /> Best Months to Visit
                </div>
                <div className="text-lg font-extrabold text-white">
                  {activeCityData.bestMonths}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Ideal Season: <span className="text-slate-200 font-semibold">{activeCityData.idealSeason}</span>
                </div>
              </div>

              {/* Climate Condition */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <CloudSun className="w-4 h-4" /> Current Weather Status
                </div>
                <div className="text-lg font-extrabold text-white">
                  {activeCityData.condition}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Pleasant outdoors with private AC vehicle comfort.
                </div>
              </div>
            </div>

            {/* Travel Tip */}
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Zaara Travels Local Advisory
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeCityData.tip}
                </p>
              </div>
            </div>

            {/* Quick Climate Summary Cards for All Cities */}
            <div className="pt-2">
              <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
                <span>All Major Destinations At-A-Glance</span>
                <span className="text-[11px] text-amber-400 font-medium">October – March is peak season for North India</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CITY_CLIMATE_DATA.map((c) => (
                  <button
                    key={c.city}
                    onClick={() => setSelectedCity(c.city)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      c.city === selectedCity
                        ? 'bg-sky-950/60 border-sky-500/80'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{c.city}</span>
                      <span className="text-[11px] font-extrabold text-amber-400">{formatTemp(c.tempC)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.bestMonths}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
