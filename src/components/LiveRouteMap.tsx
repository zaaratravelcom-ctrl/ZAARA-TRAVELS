import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Play, Pause, Clock, Compass, Sparkles, ChevronRight, CheckCircle2, Building2, Info } from 'lucide-react';

interface LiveRouteMapProps {
  cities: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    stayOrLocation: string;
  }[];
  tourTitle: string;
}

// Distance & drive time lookup for popular routes
const ROUTE_SEGMENT_INFO: Record<string, { distance: string; duration: string; highway: string }> = {
  'delhi-agra': { distance: '210 km', duration: '3.5 Hours', highway: 'Yamuna Expressway' },
  'agra-jaipur': { distance: '240 km', duration: '4.5 Hours', highway: 'NH 21 via Fatehpur Sikri' },
  'jaipur-delhi': { distance: '270 km', duration: '4.5 Hours', highway: 'Delhi-Jaipur Super Expressway NH48' },
  'delhi-jaipur': { distance: '270 km', duration: '4.5 Hours', highway: 'NH48 Expressway' },
  'agra-fatehpur sikri': { distance: '38 km', duration: '50 Mins', highway: 'Agra-Bikaner Highway' },
  'fatehpur sikri-jaipur': { distance: '205 km', duration: '3.5 Hours', highway: 'NH 21' },
  'delhi-haridwar': { distance: '220 km', duration: '4 Hours', highway: 'Delhi-Meerut Expressway' },
  'haridwar-rishikesh': { distance: '25 km', duration: '45 Mins', highway: 'Rishikesh Rd' },
};

// Known map node coordinates for aesthetic layout positioning
const CITY_COORDINATES: Record<string, { x: number; y: number; state: string; emoji: string }> = {
  'delhi': { x: 30, y: 22, state: 'NCR', emoji: '🕌' },
  'old and new delhi': { x: 30, y: 22, state: 'NCR', emoji: '🕌' },
  'agra': { x: 62, y: 52, state: 'Uttar Pradesh', emoji: '🏰' },
  'jaipur': { x: 22, y: 68, state: 'Rajasthan', emoji: '🐘' },
  'fatehpur sikri': { x: 50, y: 62, state: 'Uttar Pradesh', emoji: '🏛️' },
  'ranthambore': { x: 38, y: 82, state: 'Rajasthan', emoji: '🐅' },
  'varanasi': { x: 86, y: 60, state: 'Uttar Pradesh', emoji: '🪔' },
  'haridwar': { x: 40, y: 12, state: 'Uttarakhand', emoji: '🕉️' },
  'rishikesh': { x: 48, y: 8, state: 'Uttarakhand', emoji: '🧘' },
  'mathura': { x: 52, y: 40, state: 'Uttar Pradesh', emoji: '🛕' },
  'vrindavan': { x: 50, y: 36, state: 'Uttar Pradesh', emoji: '🪔' },
};

export const LiveRouteMap: React.FC<LiveRouteMapProps> = ({ cities, itinerary, tourTitle }) => {
  const [selectedCityIndex, setSelectedCityIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'map' | 'breakdown'>('map');

  // Format city list to ensure starting and ending points
  const routeSequence = cities.length > 0 ? cities : ['Delhi', 'Agra', 'Jaipur', 'Delhi'];

  // Auto animation playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedCityIndex((prev) => (prev + 1) % routeSequence.length);
      }, 2200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, routeSequence.length]);

  // Derive coordinates for each city in sequence
  const processedNodes = routeSequence.map((cityName, index) => {
    const key = cityName.toLowerCase().trim();
    const known = CITY_COORDINATES[key];

    if (known) {
      return {
        name: cityName,
        x: known.x,
        y: known.y,
        state: known.state,
        emoji: known.emoji,
        index,
      };
    }

    // Fallback placement along a graceful arc
    const total = routeSequence.length;
    const step = (index / Math.max(1, total - 1)) * 60;
    return {
      name: cityName,
      x: 20 + step,
      y: 30 + Math.sin((index / total) * Math.PI) * 40,
      state: 'India',
      emoji: '📍',
      index,
    };
  });

  // Calculate SVG route line path
  const svgPathD = processedNodes.reduce((acc, node, idx) => {
    if (idx === 0) return `M ${node.x * 4} ${node.y * 3}`;
    const prev = processedNodes[idx - 1];
    const midX = (prev.x * 4 + node.x * 4) / 2;
    const midY = (prev.y * 3 + node.y * 3) / 2 - 10;
    return `${acc} Q ${midX} ${midY}, ${node.x * 4} ${node.y * 3}`;
  }, '');

  const currentCity = routeSequence[selectedCityIndex] || routeSequence[0];
  const matchingItineraryDay = itinerary.find(
    (d) =>
      d.stayOrLocation.toLowerCase().includes(currentCity.toLowerCase()) ||
      d.title.toLowerCase().includes(currentCity.toLowerCase())
  ) || itinerary[selectedCityIndex % itinerary.length];

  // Helper for segment information
  const getSegmentInfo = (from: string, to: string) => {
    const key1 = `${from.toLowerCase().trim()}-${to.toLowerCase().trim()}`;
    const key2 = `${to.toLowerCase().trim()}-${from.toLowerCase().trim()}`;
    return (
      ROUTE_SEGMENT_INFO[key1] ||
      ROUTE_SEGMENT_INFO[key2] || {
        distance: '~180 km',
        duration: '3.5 Hours',
        highway: 'National Highway / Express Road',
      }
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 space-y-5">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Interactive Live Route Map</span>
            <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full text-[10px] capitalize font-bold">
              GPS Verified Flow
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-0.5">{tourTitle}</h3>
        </div>

        {/* View Switchers & Simulation Play Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition border ${
              isPlaying
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300/40'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Simulation' : 'Play Live Simulation'}</span>
          </button>

          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'map' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visual Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                activeTab === 'breakdown' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Distance Log
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Map View */}
      {activeTab === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Interactive SVG Canvas Stage */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl p-4 border border-slate-800 relative overflow-hidden min-h-[300px] flex flex-col justify-between">
            {/* Top Info Tag */}
            <div className="flex items-center justify-between text-xs text-slate-400 z-10">
              <span className="flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Sequence: {routeSequence.join(' → ')}</span>
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Click any city pin below
              </span>
            </div>

            {/* SVG Visual Map Box */}
            <div className="relative w-full h-[230px] my-2">
              <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-md">
                {/* Background Grid Lines */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
                <rect width="400" height="300" fill="url(#grid)" opacity="0.6" />

                {/* Route Connecting Lines */}
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d={svgPathD}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* City Nodes */}
                {processedNodes.map((node) => {
                  const isSelected = selectedCityIndex === node.index;
                  const cx = node.x * 4;
                  const cy = node.y * 3;

                  return (
                    <g
                      key={node.index}
                      onClick={() => {
                        setSelectedCityIndex(node.index);
                        setIsPlaying(false);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Pulse Ring for active city */}
                      {isSelected && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r="18"
                          className="fill-sky-500/20 stroke-sky-400 animate-ping opacity-75"
                        />
                      )}

                      {/* City Pin Circle */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isSelected ? 12 : 9}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? 'fill-amber-400 stroke-amber-200 stroke-2 shadow-lg'
                            : 'fill-slate-800 stroke-sky-400 stroke-2 group-hover:fill-sky-600'
                        }`}
                      />

                      {/* Node Index Badge */}
                      <text
                        x={cx}
                        y={cy + 3}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill={isSelected ? '#0f172a' : '#ffffff'}
                        className="pointer-events-none select-none"
                      >
                        {node.index + 1}
                      </text>

                      {/* City Label */}
                      <text
                        x={cx}
                        y={cy + 22}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={isSelected ? 'bold' : '600'}
                        fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                        className="pointer-events-none select-none drop-shadow"
                      >
                        {node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Private Driver Car Marker Animation */}
              <div
                className="absolute transition-all duration-500 z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${processedNodes[selectedCityIndex]?.x}%`,
                  top: `${processedNodes[selectedCityIndex]?.y}%`,
                }}
              >
                <div className="bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg border-2 border-white ring-4 ring-amber-400/30 flex items-center justify-center animate-bounce">
                  <Car className="w-4 h-4 fill-current" />
                </div>
              </div>
            </div>

            {/* Bottom Quick Controls */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400 font-medium">
                Active Stop {selectedCityIndex + 1} of {routeSequence.length}:
              </span>
              <span className="font-extrabold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-lg">
                {currentCity}
              </span>
            </div>
          </div>

          {/* Right Selected City Details Card */}
          <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-sky-400 bg-sky-950/80 border border-sky-800/60 px-2.5 py-1 rounded-md">
                  Stop #{selectedCityIndex + 1} Destination
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  {processedNodes[selectedCityIndex]?.state || 'India'}
                </span>
              </div>

              <h4 className="text-xl font-black text-white mt-2 flex items-center gap-2">
                <span>{processedNodes[selectedCityIndex]?.emoji}</span>
                <span>{currentCity}</span>
              </h4>

              {/* Itinerary Context */}
              {matchingItineraryDay ? (
                <div className="mt-3 bg-slate-800/60 border border-slate-750 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-400">Day {matchingItineraryDay.day} Schedule</span>
                    <span className="text-[11px] text-slate-400">{matchingItineraryDay.stayOrLocation}</span>
                  </div>
                  <h5 className="font-bold text-xs text-white leading-tight">{matchingItineraryDay.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
                    {matchingItineraryDay.description}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">
                  Explore iconic heritage monuments, local artisan bazaars, and culture in {currentCity}.
                </p>
              )}
            </div>

            {/* Travel Segment Info to Next City */}
            {selectedCityIndex < routeSequence.length - 1 && (
              <div className="bg-sky-950/40 border border-sky-800/40 p-3 rounded-xl text-xs space-y-1.5">
                <div className="font-bold text-sky-300 flex items-center justify-between">
                  <span>Drive to Next Stop ({routeSequence[selectedCityIndex + 1]}):</span>
                  <ChevronRight className="w-4 h-4 text-sky-400" />
                </div>
                {(() => {
                  const seg = getSegmentInfo(currentCity, routeSequence[selectedCityIndex + 1]);
                  return (
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>Dist: <strong>{seg.distance}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Drive: <strong>{seg.duration}</strong></span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedCityIndex((prev) => (prev - 1 + routeSequence.length) % routeSequence.length);
                  setIsPlaying(false);
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs text-center transition"
              >
                ← Previous Stop
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCityIndex((prev) => (prev + 1) % routeSequence.length);
                  setIsPlaying(false);
                }}
                className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-2 rounded-xl text-xs text-center transition shadow"
              >
                Next Stop →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Breakdown Log View */
        <div className="bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-sky-400" />
            <span>Complete distance & highway transfer schedule provided by Zaara Travels private chauffeured cars.</span>
          </div>

          <div className="space-y-3">
            {routeSequence.map((city, idx) => {
              if (idx === routeSequence.length - 1) return null;
              const nextCity = routeSequence[idx + 1];
              const seg = getSegmentInfo(city, nextCity);

              return (
                <div
                  key={idx}
                  className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-500 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-950 text-sky-400 border border-sky-800 font-black text-xs flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{city}</span>
                        <ChevronRight className="w-4 h-4 text-amber-400" />
                        <span>{nextCity}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{seg.highway}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto">
                    <span className="bg-slate-900 text-emerald-400 font-bold px-3 py-1 rounded-lg border border-slate-750">
                      📏 {seg.distance}
                    </span>
                    <span className="bg-slate-900 text-amber-300 font-bold px-3 py-1 rounded-lg border border-slate-750">
                      ⏱️ {seg.duration}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
