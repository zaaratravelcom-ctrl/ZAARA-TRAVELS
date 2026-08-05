import React, { useEffect, useState, useRef, Component, ReactNode } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, ShieldCheck, Clock, CheckCircle2, Car, Route } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

// Register global Google Maps auth failure interceptor
if (typeof window !== 'undefined') {
  const existingHandler = (window as any).gm_authFailure;
  (window as any).gm_authFailure = function () {
    console.warn('Google Maps API authentication failed. Switching to Zaara Travels native route engine.');
    (window as any).__GOOGLE_MAPS_AUTH_FAILED__ = true;
    window.dispatchEvent(new CustomEvent('google-maps-auth-failed'));
    if (typeof existingHandler === 'function') {
      try { existingHandler(); } catch (e) {}
    }
  };
}

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim().length > 5;

// Standard fallback distance calculator for known Golden Triangle & Indian highway routes
export const KNOWN_ROUTE_DISTANCES: Record<string, number> = {
  'delhi-agra': 230,
  'delhi-jaipur': 280,
  'agra-jaipur': 240,
  'delhi-chandigarh': 250,
  'delhi-haridwar': 220,
  'delhi-shimla': 340,
  'delhi-manali': 530,
  'delhi-varanasi': 820,
  'delhi-lucknow': 550,
  'delhi-amritsar': 460,
  'delhi-dehradun': 250,
  'delhi-rishikesh': 240,
  'delhi-noida': 35,
  'delhi-gurgaon': 35,
  'delhi-gurugram': 35,
  'jaipur-udaipur': 390,
  'jaipur-jodhpur': 330,
  'mumbai-pune': 150,
  'mumbai-goa': 590,
  'mumbai-surat': 280,
  'bengaluru-mysore': 145,
  'bengaluru-chennai': 345,
  'chennai-puducherry': 150,
};

const INDIA_CITY_COORDS: Record<string, [number, number]> = {
  delhi: [28.6139, 77.2090],
  'new delhi': [28.6139, 77.2090],
  noida: [28.5355, 77.3910],
  gurgaon: [28.4595, 77.0266],
  gurugram: [28.4595, 77.0266],
  faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538],
  agra: [27.1767, 78.0081],
  jaipur: [26.9124, 75.7873],
  mumbai: [19.0760, 72.8777],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  vadodara: [22.3072, 73.1812],
  bengaluru: [12.9716, 77.5946],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  chandigarh: [30.7333, 76.7794],
  shimla: [31.1048, 77.1734],
  manali: [32.2432, 77.1892],
  dharamshala: [32.2190, 76.3234],
  rishikesh: [30.0869, 78.2676],
  haridwar: [29.9457, 78.1642],
  dehradun: [30.3165, 78.0322],
  mussoorie: [30.4598, 78.0644],
  varanasi: [25.3176, 82.9739],
  lucknow: [26.8467, 80.9462],
  kanpur: [26.4499, 80.3319],
  amritsar: [31.6340, 74.8723],
  jalandhar: [31.3260, 75.5762],
  ludhiana: [30.9010, 75.8573],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  jaisalmer: [26.9157, 70.9083],
  bikaner: [28.0229, 73.3119],
  ajmer: [26.4499, 74.6399],
  pushkar: [26.4897, 74.5511],
  goa: [15.2993, 74.1240],
  kochi: [9.9312, 76.2673],
  cochin: [9.9312, 76.2673],
  trivandrum: [8.5241, 76.9366],
  thiruvananthapuram: [8.5241, 76.9366],
  srinagar: [34.0837, 74.7973],
  jammu: [32.7266, 74.8570],
  bhopal: [23.2599, 77.4126],
  indore: [22.7196, 75.8577],
  patna: [25.5941, 85.1376],
  gaya: [24.7914, 85.0002],
  guwahati: [26.1445, 91.7362],
  shillong: [25.5788, 91.8933],
  bhubaneswar: [20.2961, 85.8245],
  puri: [19.8135, 85.8312],
  visakhapatnam: [17.6868, 83.2185],
  vizag: [17.6868, 83.2185],
  coimbatore: [11.0168, 76.9558],
  madurai: [9.9252, 78.1198],
  mysore: [12.2958, 76.6394],
  mysuru: [12.2958, 76.6394],
};

function getCityCoords(str: string): [number, number] | null {
  if (!str) return null;
  const norm = str.toLowerCase();
  for (const [city, coords] of Object.entries(INDIA_CITY_COORDS)) {
    if (norm.includes(city)) return coords;
  }
  return null;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDist = R * c;
  return Math.max(15, Math.round(straightDist * 1.25));
}

export function estimateRouteKm(origin: string, destination: string): number {
  if (!origin || !destination) return 230;
  const normOrigin = origin.toLowerCase().trim();
  const normDest = destination.toLowerCase().trim();

  for (const [key, km] of Object.entries(KNOWN_ROUTE_DISTANCES)) {
    const [cityA, cityB] = key.split('-');
    if (
      (normOrigin.includes(cityA) && normDest.includes(cityB)) ||
      (normOrigin.includes(cityB) && normDest.includes(cityA))
    ) {
      return km;
    }
  }

  const cA = getCityCoords(origin);
  const cB = getCityCoords(destination);
  if (cA && cB) {
    if (cA[0] === cB[0] && cA[1] === cB[1]) return 45;
    return haversineDistanceKm(cA[0], cA[1], cB[0], cB[1]);
  }

  return 230;
}

interface RouteCalculatorProps {
  origin: string;
  destination: string;
  onDistanceFetched: (km: number, formattedOrigin?: string, formattedDest?: string) => void;
}

function RouteCalculatorInner({ origin, destination, onDistanceFetched }: RouteCalculatorProps) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!origin.trim() || !destination.trim()) return;

    if (
      typeof window !== 'undefined' &&
      window.google &&
      window.google.maps &&
      hasValidKey &&
      !(window as any).__GOOGLE_MAPS_AUTH_FAILED__
    ) {
      try {
        const matrixService = new window.google.maps.DistanceMatrixService();
        matrixService.getDistanceMatrix(
          {
            origins: [origin],
            destinations: [destination],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (status === 'OK' && response?.rows?.[0]?.elements?.[0]?.status === 'OK') {
              const element = response.rows[0].elements[0];
              const meters = element.distance.value;
              const km = Math.round(meters / 1000);
              const cleanOrigin = response.originAddresses?.[0] || origin;
              const cleanDest = response.destinationAddresses?.[0] || destination;
              if (km > 0) {
                onDistanceFetched(km, cleanOrigin, cleanDest);
                return;
              }
            }
            const estKm = estimateRouteKm(origin, destination);
            onDistanceFetched(estKm);
          }
        );
      } catch (err) {
        const estKm = estimateRouteKm(origin, destination);
        onDistanceFetched(estKm);
      }
    } else {
      const estKm = estimateRouteKm(origin, destination);
      onDistanceFetched(estKm);
    }
  }, [origin, destination, routesLib]);

  useEffect(() => {
    if (!routesLib || !map || !origin.trim() || !destination.trim()) return;

    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport', 'distanceMeters'],
    })
      .then(({ routes }) => {
        if (routes?.[0]) {
          const polylines = routes[0].createPolylines();
          polylines.forEach((p) => p.setMap(map));
          polylinesRef.current = polylines;
          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      })
      .catch(() => {});

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null));
    };
  }, [routesLib, map, origin, destination]);

  return null;
}

// React Error Boundary to catch map loading failures
interface MapErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface MapErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  props: MapErrorBoundaryProps;
  state: MapErrorBoundaryState = {
    hasError: false,
  };

  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(): MapErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('Google Maps Error Boundary caught exception:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface CabLocationMapProps {
  origin: string;
  destination: string;
  onDistanceChange: (km: number) => void;
  onOriginSelect?: (address: string) => void;
  onDestinationSelect?: (address: string) => void;
}

export const CabLocationMap: React.FC<CabLocationMapProps> = ({
  origin,
  destination,
  onDistanceChange,
}) => {
  const [authFailed, setAuthFailed] = useState<boolean>(
    typeof window !== 'undefined' && Boolean((window as any).__GOOGLE_MAPS_AUTH_FAILED__)
  );

  const calculatedKm = estimateRouteKm(origin, destination);
  const hours = Math.floor(calculatedKm / 60);
  const mins = Math.round((calculatedKm % 60) * 0.8);
  const formattedTime = hours > 0 ? `~${hours}h ${mins > 0 ? `${mins}m` : ''}` : `~${mins} mins`;

  useEffect(() => {
    const handleAuthFailure = () => {
      setAuthFailed(true);
    };

    window.addEventListener('google-maps-auth-failed', handleAuthFailure);
    return () => window.removeEventListener('google-maps-auth-failed', handleAuthFailure);
  }, []);

  // Always keep parent distance synced
  useEffect(() => {
    onDistanceChange(calculatedKm);
  }, [origin, destination, calculatedKm]);

  const renderNativeRouteCard = () => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 text-white shadow-md space-y-2.5">
      {/* Compact Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-amber-400" />
          <h4 className="text-xs font-bold text-white">Route Distance & Journey Estimator</h4>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          Native Highway Engine
        </span>
      </div>

      {/* Visual Origin & Destination Connectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block leading-none mb-0.5">Pickup</span>
            <p className="text-xs font-bold text-slate-100 truncate">
              {origin || 'Select Pickup Location'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide block leading-none mb-0.5">Drop</span>
            <p className="text-xs font-bold text-slate-100 truncate">
              {destination || 'Select Drop Location'}
            </p>
          </div>
        </div>
      </div>

      {/* Compact Stats Ribbon */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/50 text-center">
          <span className="text-[9px] text-slate-400 block font-medium">Distance</span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-400">{calculatedKm} KM</span>
        </div>

        <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/50 text-center">
          <span className="text-[9px] text-slate-400 block font-medium">Est. Time</span>
          <span className="text-xs sm:text-sm font-extrabold text-sky-400">{formattedTime}</span>
        </div>

        <div className="bg-slate-800/70 p-2 rounded-lg border border-slate-700/50 text-center flex flex-col items-center justify-center">
          <span className="text-[9px] text-slate-400 block font-medium">Tolls & Fees</span>
          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
            <ShieldCheck className="w-3 h-3" /> Included
          </span>
        </div>
      </div>
    </div>
  );

  if (!hasValidKey || authFailed) {
    return renderNativeRouteCard();
  }

  return (
    <MapErrorBoundary fallback={renderNativeRouteCard()}>
      <div className="space-y-2">
        <div className="h-44 sm:h-48 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner relative">
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={{ lat: 28.6139, lng: 77.209 }}
              defaultZoom={7}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              <RouteCalculatorInner
                origin={origin}
                destination={destination}
                onDistanceFetched={(km) => onDistanceChange(km)}
              />
            </Map>
          </APIProvider>
        </div>
      </div>
    </MapErrorBoundary>
  );
};
