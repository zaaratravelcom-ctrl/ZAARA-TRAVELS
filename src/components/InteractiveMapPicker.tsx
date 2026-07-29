import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, MapPin, Locate, ExternalLink, Navigation, Check, X, Loader2, Sparkles, Building, Plane, Train, Hotel, Compass } from 'lucide-react';

interface LocationResult {
  place_id: number | string;
  display_name: string;
  lat: number;
  lng: number;
  category?: string;
  icon?: string;
  zone?: string;
}

// Popular Curated Delhi NCR & Golden Triangle Pickup Hotspots with real lat/lng
export const POPULAR_DELHI_HOTSPOTS: LocationResult[] = [
  { place_id: 't3', display_name: 'Indira Gandhi Int\'l Airport (DEL) - Terminal 3', lat: 28.5562, lng: 77.0999, category: 'Airport', zone: 'Delhi Airport', icon: '✈️' },
  { place_id: 't1', display_name: 'Delhi Airport (DEL) - Terminal 1 (Domestic)', lat: 28.5665, lng: 77.1189, category: 'Airport', zone: 'Delhi Airport', icon: '✈️' },
  { place_id: 'aerocity', display_name: 'Aerocity Hotel Complex (JW Marriott, Aloft, Roseate)', lat: 28.5501, lng: 77.1213, category: 'Hotels', zone: 'Aerocity NCR', icon: '🏨' },
  { place_id: 'shangri-la', display_name: 'Shangri-La Eros Hotel, Connaught Place, New Delhi', lat: 28.6219, lng: 77.2185, category: 'Hotels', zone: 'Central Delhi', icon: '🏛️' },
  { place_id: 'cp', display_name: 'Connaught Place - Inner Circle / Radial Hotels', lat: 28.6315, lng: 77.2167, category: 'Hotels', zone: 'Central Delhi', icon: '🏛️' },
  { place_id: 'imperial', display_name: 'The Imperial Hotel, Janpath, Connaught Place', lat: 28.6231, lng: 77.2188, category: 'Hotels', zone: 'Central Delhi', icon: '👑' },
  { place_id: 'ndls', display_name: 'New Delhi Railway Station (NDLS) - Paharganj Side', lat: 28.6431, lng: 77.2197, category: 'Train Station', zone: 'Central Delhi', icon: '🚆' },
  { place_id: 'chanakya', display_name: 'Taj Palace & Leela Palace, Chanakyapuri Embassy Area', lat: 28.5921, lng: 77.1745, category: 'Hotels', zone: 'South Delhi', icon: '👑' },
  { place_id: 'nizamuddin', display_name: 'Hazrat Nizamuddin Railway Station (NZM)', lat: 28.5892, lng: 77.2533, category: 'Train Station', zone: 'South Delhi', icon: '🚆' },
  { place_id: 'gurugram', display_name: 'Gurugram Cyber Hub / DLF Phase 5 (The Oberoi, Trident)', lat: 28.4950, lng: 77.0895, category: 'Hotels', zone: 'Gurugram NCR', icon: '🏢' },
  { place_id: 'noida', display_name: 'Noida Sector 18 / Expressway Hotels (Radisson Blu)', lat: 28.5708, lng: 77.3261, category: 'Hotels', zone: 'Noida NCR', icon: '🏙️' },
  { place_id: 'agra-taj', display_name: 'Agra Taj East Gate / ITC Mughal / Taj Hotel Zone', lat: 27.1751, lng: 78.0421, category: 'Heritage', zone: 'Agra City', icon: '🏰' },
  { place_id: 'jaipur-pink', display_name: 'Jaipur Pink City Heritage Hotels (Rambagh, Taj Jai Mahal)', lat: 26.9124, lng: 75.7873, category: 'Heritage', zone: 'Jaipur City', icon: '🐘' },
];

interface InteractiveMapPickerProps {
  initialLocation: string;
  onSelectLocation: (address: string, lat?: number, lng?: number) => void;
  onClose: () => void;
}

export const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  initialLocation,
  onSelectLocation,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(initialLocation || '');
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocation || 'Shangri-La Eros Hotel, Connaught Place');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6219, lng: 77.2185 }); // Default Shangri-La Eros / CP
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Custom marker icon factory
  const createCustomIcon = (isHighlight = false) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div style="
          background: ${isHighlight ? '#0284c7' : '#0f172a'};
          border: 3px solid #38bdf8;
          color: white;
          border-radius: 9999px;
          padding: 6px;
          box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          transform: translate(-50%, -50%);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const initialLat = coords.lat;
    const initialLng = coords.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Initial Marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: createCustomIcon(true),
    }).addTo(map);

    marker.bindPopup(`<b>Pickup Location</b><br>${selectedLocation}`).openPopup();

    // On Marker Drag End
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      const newLat = Number(position.lat.toFixed(5));
      const newLng = Number(position.lng.toFixed(5));
      setCoords({ lat: newLat, lng: newLng });
      const pinAddress = `Custom Selected Pin (Lat: ${newLat}, Lng: ${newLng})`;
      setSelectedLocation(pinAddress);
      marker.setPopupContent(`<b>Selected Pickup Pin</b><br>${pinAddress}`).openPopup();
    });

    // On Map Click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const newLat = Number(e.latlng.lat.toFixed(5));
      const newLng = Number(e.latlng.lng.toFixed(5));
      setCoords({ lat: newLat, lng: newLng });
      marker.setLatLng([newLat, newLng]);
      const pinAddress = `Map Selected Point (Lat: ${newLat}, Lng: ${newLng})`;
      setSelectedLocation(pinAddress);
      marker.setPopupContent(`<b>Selected Pickup Point</b><br>${pinAddress}`).openPopup();
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Invalidate size after modal render animation
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center Map & Marker when coords or location changes
  const updateMapPosition = (lat: number, lng: number, address: string) => {
    setCoords({ lat, lng });
    setSelectedLocation(address);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setPopupContent(`<b>Selected Pickup Point</b><br>${address}`).openPopup();
    }
  };

  // Perform Geocoding Search via OpenStreetMap Nominatim
  const handleSearchSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Append Delhi NCR / India to query if not present for accurate results
      const fullQuery = searchQuery.toLowerCase().includes('delhi') || searchQuery.toLowerCase().includes('india') || searchQuery.toLowerCase().includes('noida') || searchQuery.toLowerCase().includes('gurgaon')
        ? searchQuery
        : `${searchQuery}, Delhi NCR, India`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&countrycodes=in&limit=6`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const formattedResults: LocationResult[] = data.map((item: any, idx: number) => ({
          place_id: item.place_id || idx,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: 'Search Result',
          icon: '📍',
          zone: item.type || 'Delhi NCR Location',
        }));

        setSearchResults(formattedResults);
        // Auto select first result
        const top = formattedResults[0];
        updateMapPosition(top.lat, top.lng, top.display_name);
      } else {
        // Search in local curated hotspots if API returns empty
        const matches = POPULAR_DELHI_HOTSPOTS.filter(h =>
          h.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.zone?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(matches);
        if (matches.length > 0) {
          updateMapPosition(matches[0].lat, matches[0].lng, matches[0].display_name);
        }
      }
    } catch (err) {
      console.error('Map Geocoding Error:', err);
      // Fallback search in static hotspots
      const matches = POPULAR_DELHI_HOTSPOTS.filter(h =>
        h.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(matches);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle GPS Location Detection
  const handleDetectGps = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const address = `Live GPS Pinpoint (Lat: ${lat}, Lng: ${lng})`;
        updateMapPosition(lat, lng, address);
        setIsGpsLoading(false);
      },
      (error) => {
        console.warn('GPS location error:', error);
        // Fallback to Aerocity
        const fallback = POPULAR_DELHI_HOTSPOTS[2];
        updateMapPosition(fallback.lat, fallback.lng, fallback.display_name);
        setIsGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Open Google Maps External Link
  const handleOpenGoogleMaps = () => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      searchQuery || selectedLocation || 'Delhi NCR Airport Hotels'
    )}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenGoogleMapsPin = () => {
    const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirm = () => {
    onSelectLocation(selectedLocation, coords.lat, coords.lng);
    onClose();
  };

  const filteredHotspots = POPULAR_DELHI_HOTSPOTS.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.zone?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <span>Interactive Delhi NCR Pickup Map</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  OpenStreetMap & Google Maps Connected
                </span>
              </h3>
              <p className="text-xs text-slate-400">Search hotel name, click pin, or drag marker on map</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search hotel (e.g. Shangri-La Eros, Taj Palace, Aerocity)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-24 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-1.5 top-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleDetectGps}
              disabled={isGpsLoading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow"
            >
              {isGpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
              <span>Use My GPS Pin</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Google Maps 🗺️</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['All', 'Airport', 'Hotels', 'Train Station', 'Heritage'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold transition border shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-sky-600 border-sky-500 text-white shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search API Live Results drop down list if found */}
          {searchResults.length > 0 && (
            <div className="bg-sky-950/90 border border-sky-800/80 rounded-xl p-3 space-y-2">
              <div className="text-[11px] font-bold text-sky-300 flex items-center justify-between">
                <span>Matched OpenStreetMap Results ({searchResults.length}):</span>
                <button
                  type="button"
                  onClick={() => setSearchResults([])}
                  className="text-slate-400 hover:text-white"
                >
                  Dismiss ✕
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 text-xs">
                {searchResults.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => updateMapPosition(res.lat, res.lng, res.display_name)}
                    className="p-2 bg-slate-900/80 hover:bg-sky-900/60 rounded-lg cursor-pointer transition flex items-start gap-2 border border-slate-800"
                  >
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold text-white leading-tight">{res.display_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Lat: {res.lat.toFixed(4)}, Lng: {res.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leaflet Real Interactive Map View Container */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
            {/* Real Leaflet Map Render Stage */}
            <div ref={mapContainerRef} className="w-full h-[280px] sm:h-[320px] z-10" />

            {/* Float Badge on Map */}
            <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
              <span>Drag Pin or Click Map</span>
            </div>

            <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow flex items-center gap-2">
              <span className="text-emerald-400">Lat: {coords.lat}</span>
              <span>•</span>
              <span className="text-sky-400">Lng: {coords.lng}</span>
            </div>
          </div>

          {/* Preset Hotspot Cards Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Popular Delhi NCR Hotel & Terminal Hotspots ({filteredHotspots.length}):
              </h4>
              <button
                type="button"
                onClick={handleOpenGoogleMapsPin}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Selected Pin on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[160px] overflow-y-auto pr-1">
              {filteredHotspots.map((item) => {
                const isSelected = selectedLocation === item.display_name;
                return (
                  <div
                    key={item.place_id}
                    onClick={() => updateMapPosition(item.lat, item.lng, item.display_name)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-2 ${
                      isSelected
                        ? 'bg-sky-950/90 border-sky-500 text-white ring-2 ring-sky-500/50 shadow'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center justify-between">
                        <span className="truncate">{item.display_name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.zone} • {item.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300 flex items-center gap-2 truncate max-w-lg">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Selected Address: <strong>{selectedLocation}</strong></span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="bg-sky-600 hover:bg-sky-500 text-white font-extrabold px-6 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
            >
              <span>Confirm Pickup Point ✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
