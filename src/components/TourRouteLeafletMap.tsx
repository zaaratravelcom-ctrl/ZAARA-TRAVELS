import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Car, Play, Pause, Clock, Compass, Sparkles, ChevronRight, CheckCircle2, Building2, ExternalLink, Route, Layers } from 'lucide-react';

interface TourRouteLeafletMapProps {
  cities: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    stayOrLocation: string;
  }[];
  tourTitle: string;
}

// Real Geographic Coordinates for Popular Tour Cities
export const CITY_GEO_COORDINATES: Record<string, { lat: number; lng: number; state: string; emoji: string }> = {
  'delhi': { lat: 28.6139, lng: 77.2090, state: 'NCR', emoji: '🕌' },
  'old and new delhi': { lat: 28.6139, lng: 77.2090, state: 'NCR', emoji: '🕌' },
  'new delhi': { lat: 28.6139, lng: 77.2090, state: 'NCR', emoji: '🕌' },
  'agra': { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh', emoji: '🏰' },
  'jaipur': { lat: 26.9124, lng: 75.7873, state: 'Rajasthan', emoji: '🐘' },
  'fatehpur sikri': { lat: 27.0945, lng: 77.6679, state: 'Uttar Pradesh', emoji: '🏛️' },
  'ranthambore': { lat: 25.9928, lng: 76.3682, state: 'Rajasthan', emoji: '🐅' },
  'sawai madhopur': { lat: 25.9928, lng: 76.3682, state: 'Rajasthan', emoji: '🐅' },
  'varanasi': { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh', emoji: '🪔' },
  'haridwar': { lat: 29.9457, lng: 78.1642, state: 'Uttarakhand', emoji: '🕉️' },
  'rishikesh': { lat: 30.0869, lng: 78.2676, state: 'Uttarakhand', emoji: '🧘' },
  'mathura': { lat: 27.4924, lng: 77.6737, state: 'Uttar Pradesh', emoji: '🛕' },
  'vrindavan': { lat: 27.5706, lng: 77.6593, state: 'Uttar Pradesh', emoji: '🪔' },
  'amritsar': { lat: 31.6340, lng: 74.8723, state: 'Punjab', emoji: '🛕' },
  'udaipur': { lat: 24.5854, lng: 73.7125, state: 'Rajasthan', emoji: '🏰' },
  'jodhpur': { lat: 26.2389, lng: 73.0243, state: 'Rajasthan', emoji: '🏰' },
  'jaisalmer': { lat: 26.9157, lng: 70.9083, state: 'Rajasthan', emoji: '🐪' },
  'khajuraho': { lat: 24.8318, lng: 79.9199, state: 'Madhya Pradesh', emoji: '🏛️' },
  'orchha': { lat: 25.3512, lng: 78.6420, state: 'Madhya Pradesh', emoji: '🏰' },
  'gwalior': { lat: 26.2183, lng: 78.1828, state: 'Madhya Pradesh', emoji: '🏰' },
  'shimla': { lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh', emoji: '🏔️' },
  'manali': { lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh', emoji: '🏔️' },
  'srinagar': { lat: 34.0837, lng: 74.7973, state: 'Jammu & Kashmir', emoji: '🛶' },
  'mumbai': { lat: 18.9220, lng: 72.8347, state: 'Maharashtra', emoji: '🏙️' },
  'kochi': { lat: 9.9312, lng: 76.2673, state: 'Kerala', emoji: '🌴' },
  'munnar': { lat: 10.0889, lng: 77.0595, state: 'Kerala', emoji: '🍃' },
  'alleppey': { lat: 9.4981, lng: 76.3388, state: 'Kerala', emoji: '🛶' },
  'pushkar': { lat: 26.4897, lng: 74.5511, state: 'Rajasthan', emoji: '🛕' },
  'ayodhya': { lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh', emoji: '🛕' },
  'sarnath': { lat: 25.3762, lng: 83.0227, state: 'Uttar Pradesh', emoji: '☸️' },
  'leh': { lat: 34.1526, lng: 77.5771, state: 'Ladakh', emoji: '🏔️' },
  'nubra valley': { lat: 34.5800, lng: 77.5600, state: 'Ladakh', emoji: '🐪' },
  'pangong lake': { lat: 33.7595, lng: 78.6674, state: 'Ladakh', emoji: '🏔️' },
};

// Highway segment distances
const ROUTE_SEGMENTS: Record<string, { distance: string; duration: string; highway: string }> = {
  'delhi-agra': { distance: '210 km', duration: '3.5 Hours', highway: 'Yamuna Expressway' },
  'agra-jaipur': { distance: '240 km', duration: '4.5 Hours', highway: 'NH 21 via Fatehpur Sikri' },
  'jaipur-delhi': { distance: '270 km', duration: '4.5 Hours', highway: 'Delhi-Jaipur Expressway NH48' },
  'delhi-jaipur': { distance: '270 km', duration: '4.5 Hours', highway: 'NH48 Expressway' },
  'agra-fatehpur sikri': { distance: '38 km', duration: '50 Mins', highway: 'Agra-Bikaner Highway' },
  'fatehpur sikri-jaipur': { distance: '205 km', duration: '3.5 Hours', highway: 'NH 21' },
  'jaipur-ranthambore': { distance: '160 km', duration: '3.5 Hours', highway: 'Jaipur-Kota Highway' },
  'ranthambore-jaipur': { distance: '160 km', duration: '3.5 Hours', highway: 'Jaipur-Kota Highway' },
  'delhi-haridwar': { distance: '220 km', duration: '4 Hours', highway: 'Delhi-Meerut Expressway' },
  'haridwar-rishikesh': { distance: '25 km', duration: '45 Mins', highway: 'Rishikesh Rd' },
  'kochi-munnar': { distance: '130 km', duration: '3.5 Hours', highway: 'NH 85 Hill Highway' },
  'munnar-alleppey': { distance: '160 km', duration: '4 Hours', highway: 'SH 40 Country Highway' },
  'delhi-shimla': { distance: '340 km', duration: '7 Hours', highway: 'Himalayan Expressway NH5' },
  'shimla-manali': { distance: '230 km', duration: '6.5 Hours', highway: 'NH 205 Mountain Highway' },
  'varanasi-ayodhya': { distance: '190 km', duration: '4 Hours', highway: 'NH 330 Purvanchal Route' },
  'varanasi-sarnath': { distance: '12 km', duration: '30 Mins', highway: 'Gaziapur Rd' },
  'jaipur-pushkar': { distance: '145 km', duration: '2.5 Hours', highway: 'NH 48 Bypass' },
  'leh-nubra valley': { distance: '125 km', duration: '4.5 Hours', highway: 'Khardung La Pass Route' },
  'nubra valley-pangong lake': { distance: '160 km', duration: '5 Hours', highway: 'Shyok River Valley Route' },
  'orchha-khajuraho': { distance: '170 km', duration: '3.5 Hours', highway: 'NH 39 Highway' },
  'delhi-amritsar': { distance: '450 km', duration: '7.5 Hours', highway: 'NH 44 Grand Trunk Road' },
};

export const TourRouteLeafletMap: React.FC<TourRouteLeafletMapProps> = ({
  cities,
  itinerary,
  tourTitle,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  const [selectedCityIndex, setSelectedCityIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'topo'>('streets');

  // Ensure sequence starts and ends safely
  const routeCities = cities && cities.length > 0 ? cities : ['Delhi', 'Agra', 'Jaipur', 'Delhi'];

  // Resolve lat/lng for each city in sequence
  const resolvedNodes = routeCities.map((cityName, idx) => {
    const key = cityName.toLowerCase().trim();
    const geo = CITY_GEO_COORDINATES[key] || {
      lat: 28.6139 + (idx * 0.5 - 0.2),
      lng: 77.2090 + (idx * 0.8),
      state: 'India',
      emoji: '📍',
    };
    return {
      name: cityName,
      lat: geo.lat,
      lng: geo.lng,
      state: geo.state,
      emoji: geo.emoji,
      index: idx,
    };
  });

  // Calculate Map Bounds
  const latLngs: [number, number][] = resolvedNodes.map((n) => [n.lat, n.lng]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center or fit bounds
    const centerLat = resolvedNodes[0]?.lat || 28.6139;
    const centerLng = resolvedNodes[0]?.lng || 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 7,
      zoomControl: true,
    });

    // Tile Layer based on selected style
    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    if (mapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapStyle === 'topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
    }

    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Draw Route Polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#0284c7',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);

      // Fit map to route bounds with padding
      map.fitBounds(polyline.getBounds(), { padding: [45, 45] });
    }

    // Add City Markers
    resolvedNodes.forEach((node) => {
      const isSelected = selectedCityIndex === node.index;

      const markerHtml = `
        <div style="
          background: ${isSelected ? '#f59e0b' : '#0f172a'};
          border: 3px solid ${isSelected ? '#fef3c7' : '#38bdf8'};
          color: white;
          border-radius: 9999px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 13px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
          transform: translate(-50%, -50%);
        ">
          ${node.index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'city-route-marker',
        html: markerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const dayInfo = itinerary.find(
        (d) =>
          d.stayOrLocation.toLowerCase().includes(node.name.toLowerCase()) ||
          d.title.toLowerCase().includes(node.name.toLowerCase())
      ) || itinerary[node.index % itinerary.length];

      const marker = L.marker([node.lat, node.lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 2px; min-width: 180px;">
          <div style="font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase;">
            Stop #${node.index + 1} • ${node.state}
          </div>
          <div style="font-size: 15px; font-weight: 900; color: #0f172a; margin-top: 2px;">
            ${node.emoji} ${node.name}
          </div>
          ${dayInfo ? `<div style="font-size: 11px; font-weight: 600; color: #d97706; margin-top: 4px;">Day ${dayInfo.day}: ${dayInfo.title}</div>` : ''}
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Coordinates: ${node.lat.toFixed(4)}, ${node.lng.toFixed(4)}</div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setSelectedCityIndex(node.index);
        setIsPlaying(false);
      });
    });

    // Add Moving Vehicle Marker
    const currentLoc = resolvedNodes[selectedCityIndex] || resolvedNodes[0];
    const carIconHtml = `
      <div style="
        background: #f59e0b;
        color: #0f172a;
        border: 2px solid white;
        border-radius: 9999px;
        padding: 6px;
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        transform: translate(-50%, -50%);
      ">
        🚗
      </div>
    `;

    const carIcon = L.divIcon({
      className: 'car-vehicle-marker',
      html: carIconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const carMarker = L.marker([currentLoc.lat, currentLoc.lng], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
    vehicleMarkerRef.current = carMarker;

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle, cities.join(',')]);

  // Update vehicle location on selected index change
  useEffect(() => {
    const loc = resolvedNodes[selectedCityIndex];
    if (loc && vehicleMarkerRef.current && mapInstanceRef.current) {
      vehicleMarkerRef.current.setLatLng([loc.lat, loc.lng]);
      mapInstanceRef.current.panTo([loc.lat, loc.lng], { animate: true });
    }
  }, [selectedCityIndex]);

  // Auto Animation Loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setSelectedCityIndex((prev) => (prev + 1) % resolvedNodes.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, resolvedNodes.length]);

  const currentCityNode = resolvedNodes[selectedCityIndex] || resolvedNodes[0];
  const matchingItinerary = itinerary.find(
    (d) =>
      d.stayOrLocation.toLowerCase().includes(currentCityNode.name.toLowerCase()) ||
      d.title.toLowerCase().includes(currentCityNode.name.toLowerCase())
  ) || itinerary[selectedCityIndex % itinerary.length];

  // Helper for segment distance
  const getSegment = (from: string, to: string) => {
    const k1 = `${from.toLowerCase().trim()}-${to.toLowerCase().trim()}`;
    const k2 = `${to.toLowerCase().trim()}-${from.toLowerCase().trim()}`;
    return (
      ROUTE_SEGMENTS[k1] ||
      ROUTE_SEGMENTS[k2] || {
        distance: '~200 km',
        duration: '4 Hours',
        highway: 'National Highway / Super Expressway',
      }
    );
  };

  const handleOpenGoogleMapsRoute = () => {
    const waypoints = routeCities.map((c) => encodeURIComponent(c)).join('/');
    const url = `https://www.google.com/maps/dir/${waypoints}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleResetFitBounds = () => {
    if (mapInstanceRef.current && latLngs.length > 0) {
      if (latLngs.length > 1) {
        const bounds = L.latLngBounds(latLngs);
        mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45] });
      } else {
        mapInstanceRef.current.setView(latLngs[0], 10);
      }
    }
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-6 border border-slate-800 shadow-2xl space-y-5">
      {/* Top Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-extrabold text-xs uppercase tracking-wider">
            <Route className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>Interactive Leaflet Route Map</span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
              GPS Connected
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white mt-1">{tourTitle}</h3>
        </div>

        {/* Map Actions */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetFitBounds}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            title="Reset view to fit all route cities"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Fit Route</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition border ${
              isPlaying
                ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-300/40'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Traversal' : 'Simulate Car Drive'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMapsRoute}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
          </button>
        </div>
      </div>

      {/* Main Map & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Leaflet Map Render Canvas */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden shadow-xl min-h-[360px] flex flex-col justify-between">
          {/* Style Selector floating pill */}
          <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 text-xs text-slate-200 px-2.5 py-1 rounded-xl shadow flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold mr-1">Style:</span>
            {(['streets', 'satellite', 'topo'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setMapStyle(st)}
                className={`px-2 py-0.5 rounded capitalize font-bold text-[10px] transition ${
                  mapStyle === st ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 text-xs text-sky-300 font-bold px-3 py-1 rounded-xl shadow flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Click any city node on map</span>
          </div>

          {/* Leaflet Canvas Stage */}
          <div ref={mapContainerRef} className="w-full h-[360px] sm:h-[400px] z-10" />

          {/* City sequence ticker bar at bottom of map */}
          <div className="bg-slate-950 p-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto text-xs z-20">
            <span className="font-bold text-slate-400 shrink-0 uppercase tracking-wider text-[10px]">
              Route Flow ({resolvedNodes.length} Stops):
            </span>
            {resolvedNodes.map((node) => {
              const active = selectedCityIndex === node.index;
              return (
                <button
                  key={node.index}
                  type="button"
                  onClick={() => {
                    setSelectedCityIndex(node.index);
                    setIsPlaying(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 border ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow ring-2 ring-amber-400/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                  }`}
                >
                  <span>{node.index + 1}.</span>
                  <span>{node.emoji}</span>
                  <span>{node.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Info Details Panel */}
        <div className="lg:col-span-4 bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-md">
                Selected Stop #{selectedCityIndex + 1}
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                {currentCityNode.state}
              </span>
            </div>

            <h4 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
              <span>{currentCityNode.emoji}</span>
              <span>{currentCityNode.name}</span>
            </h4>

            {matchingItinerary ? (
              <div className="mt-3 bg-slate-800/80 border border-slate-700 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400">Day {matchingItinerary.day} Schedule</span>
                  <span className="text-[11px] text-slate-400">{matchingItinerary.stayOrLocation}</span>
                </div>
                <h5 className="font-bold text-xs text-white leading-tight">{matchingItinerary.title}</h5>
                <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-4">
                  {matchingItinerary.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">
                Experience heritage monuments, local artisan markets, and guided sightseeing in {currentCityNode.name}.
              </p>
            )}
          </div>

          {/* Next Segment Drive Info */}
          {selectedCityIndex < resolvedNodes.length - 1 && (
            <div className="bg-sky-950/50 border border-sky-800/50 p-3 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-sky-300 flex items-center justify-between">
                <span>Drive to {resolvedNodes[selectedCityIndex + 1].name}:</span>
                <ChevronRight className="w-4 h-4 text-sky-400" />
              </div>
              {(() => {
                const seg = getSegment(currentCityNode.name, resolvedNodes[selectedCityIndex + 1].name);
                return (
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>📏 Distance: <strong>{seg.distance}</strong></span>
                      <span>⏱️ Drive Time: <strong>{seg.duration}</strong></span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      🛣️ {seg.highway}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Navigation Control Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setSelectedCityIndex((prev) => (prev - 1 + resolvedNodes.length) % resolvedNodes.length);
                setIsPlaying(false);
              }}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs text-center transition"
            >
              ← Prev City
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCityIndex((prev) => (prev + 1) % resolvedNodes.length);
                setIsPlaying(false);
              }}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-extrabold py-2.5 rounded-xl text-xs text-center transition shadow"
            >
              Next City →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
