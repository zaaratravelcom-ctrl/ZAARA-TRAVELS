import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Check, Compass, X, Building2, Plane, Train, Landmark, Map } from 'lucide-react';

interface GooglePlacesInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  onSelectLocation: (address: string) => void;
  isSelectedFromMaps: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
}

export interface StructuredPrediction {
  description: string;
  mainText: string;
  secondaryText: string;
  placeId?: string;
  category: 'airport' | 'station' | 'hotel' | 'attraction' | 'city' | 'address';
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim().length > 5;

let googleMapsScriptLoadingPromise: Promise<void> | null = null;

/**
 * Ensures Google Maps JavaScript SDK with Places library is dynamically loaded in document head.
 */
function ensureGoogleMapsPlacesSDK(): Promise<void> {
  if (typeof window === 'undefined' || !hasValidKey) return Promise.resolve();

  // Already loaded
  if (window.google?.maps?.places?.AutocompleteService) {
    return Promise.resolve();
  }

  // If google.maps.importLibrary exists
  if (window.google?.maps?.importLibrary) {
    return window.google.maps
      .importLibrary('places')
      .then(() => {})
      .catch(() => {});
  }

  if (googleMapsScriptLoadingPromise) {
    return googleMapsScriptLoadingPromise;
  }

  googleMapsScriptLoadingPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existing) {
      const interval = setInterval(() => {
        if (window.google?.maps?.places?.AutocompleteService) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        resolve();
      }, 4000);
      return;
    }

    const script = document.createElement('script');
    const keyParam = API_KEY ? `key=${API_KEY}&` : '';
    script.src = `https://maps.googleapis.com/maps/api/js?${keyParam}libraries=places&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.importLibrary && !window.google?.maps?.places) {
        window.google.maps
          .importLibrary('places')
          .then(() => resolve())
          .catch(() => resolve());
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      resolve(); // Fallback mode
    };
    document.head.appendChild(script);
  });

  return googleMapsScriptLoadingPromise;
}

// Comprehensive fallback dataset covering India places
const INDIA_FALLBACK_PLACES: Array<{ name: string; main: string; secondary: string; category: StructuredPrediction['category'] }> = [
  // Airports
  { name: 'Indira Gandhi International Airport (DEL) T3, Delhi', main: 'Indira Gandhi International Airport (DEL) T3', secondary: 'New Delhi, Delhi, India', category: 'airport' },
  { name: 'Indira Gandhi International Airport (DEL) T1, Delhi', main: 'Indira Gandhi International Airport (DEL) T1', secondary: 'New Delhi, Delhi, India', category: 'airport' },
  { name: 'Chhatrapati Shivaji Maharaj International Airport (BOM) T2, Mumbai', main: 'Chhatrapati Shivaji Maharaj Airport (BOM) T2', secondary: 'Mumbai, Maharashtra, India', category: 'airport' },
  { name: 'Jaipur International Airport (JAI), Sanganer, Jaipur', main: 'Jaipur International Airport (JAI)', secondary: 'Sanganer, Jaipur, Rajasthan, India', category: 'airport' },
  { name: 'Chandigarh International Airport (IXC), Mohali', main: 'Chandigarh International Airport (IXC)', secondary: 'Mohali, Chandigarh, India', category: 'airport' },
  { name: 'Kempegowda International Airport (BLR), Bengaluru', main: 'Kempegowda International Airport (BLR)', secondary: 'Bengaluru, Karnataka, India', category: 'airport' },
  { name: 'Sri Guru Ram Dass Jee International Airport (ATQ), Amritsar', main: 'Sri Guru Ram Dass Jee Airport (ATQ)', secondary: 'Amritsar, Punjab, India', category: 'airport' },
  { name: 'Lal Bahadur Shastri International Airport (VNS), Varanasi', main: 'Lal Bahadur Shastri Airport (VNS)', secondary: 'Varanasi, Uttar Pradesh, India', category: 'airport' },
  { name: 'Jolly Grant Airport (DED), Dehradun', main: 'Jolly Grant Airport (DED)', secondary: 'Dehradun, Uttarakhand, India', category: 'airport' },
  { name: 'Chaudhary Charan Singh International Airport (LKO), Lucknow', main: 'Chaudhary Charan Singh Airport (LKO)', secondary: 'Lucknow, Uttar Pradesh, India', category: 'airport' },
  { name: 'Sardar Vallabhbhai Patel International Airport (AMD), Ahmedabad', main: 'Sardar Vallabhbhai Patel Airport (AMD)', secondary: 'Ahmedabad, Gujarat, India', category: 'airport' },
  { name: 'Dabolim International Airport (GOI), Goa', main: 'Dabolim Airport (GOI)', secondary: 'Dabolim, Goa, India', category: 'airport' },
  { name: 'Manohar International Airport (GOX), Mopa, Goa', main: 'Manohar International Airport Mopa (GOX)', secondary: 'Mopa, Goa, India', category: 'airport' },
  { name: 'Rajiv Gandhi International Airport (HYD), Hyderabad', main: 'Rajiv Gandhi International Airport (HYD)', secondary: 'Shamshabad, Hyderabad, Telangana, India', category: 'airport' },
  { name: 'Chennai International Airport (MAA), Chennai', main: 'Chennai International Airport (MAA)', secondary: 'Chennai, Tamil Nadu, India', category: 'airport' },
  { name: 'Netaji Subhash Chandra Bose International Airport (CCU), Kolkata', main: 'Netaji Subhash Chandra Bose Airport (CCU)', secondary: 'Kolkata, West Bengal, India', category: 'airport' },

  // Railway Stations
  { name: 'New Delhi Railway Station (NDLS), Paharganj, New Delhi', main: 'New Delhi Railway Station (NDLS)', secondary: 'Paharganj, New Delhi, Delhi, India', category: 'station' },
  { name: 'Hazrat Nizamuddin Railway Station (NZM), New Delhi', main: 'Hazrat Nizamuddin Railway Station (NZM)', secondary: 'New Delhi, Delhi, India', category: 'station' },
  { name: 'Agra Cantt Railway Station (AGC), Agra', main: 'Agra Cantt Railway Station (AGC)', secondary: 'Agra, Uttar Pradesh, India', category: 'station' },
  { name: 'Jaipur Junction Railway Station (JP), Jaipur', main: 'Jaipur Junction Railway Station (JP)', secondary: 'Jaipur, Rajasthan, India', category: 'station' },
  { name: 'Haridwar Junction Railway Station (HW), Haridwar', main: 'Haridwar Junction Railway Station (HW)', secondary: 'Haridwar, Uttarakhand, India', category: 'station' },
  { name: 'Varanasi Junction Railway Station (BSB), Varanasi', main: 'Varanasi Junction Railway Station (BSB)', secondary: 'Varanasi, Uttar Pradesh, India', category: 'station' },
  { name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT), Mumbai', main: 'Chhatrapati Shivaji Terminus (CSMT)', secondary: 'Mumbai, Maharashtra, India', category: 'station' },
  { name: 'Old Delhi Railway Station (DLI), Delhi', main: 'Old Delhi Railway Station (DLI)', secondary: 'Delhi, India', category: 'station' },
  { name: 'Chandigarh Junction Railway Station (CDG), Chandigarh', main: 'Chandigarh Railway Station (CDG)', secondary: 'Chandigarh, India', category: 'station' },
  { name: 'Lucknow Charbagh Railway Station (LKO), Lucknow', main: 'Lucknow Charbagh Railway Station (LKO)', secondary: 'Lucknow, Uttar Pradesh, India', category: 'station' },
  { name: 'Amritsar Junction Railway Station (ASR), Amritsar', main: 'Amritsar Junction Railway Station (ASR)', secondary: 'Amritsar, Punjab, India', category: 'station' },
  { name: 'Udaipur City Railway Station (UDZ), Udaipur', main: 'Udaipur City Railway Station (UDZ)', secondary: 'Udaipur, Rajasthan, India', category: 'station' },
  { name: 'Jodhpur Junction Railway Station (JU), Jodhpur', main: 'Jodhpur Junction Railway Station (JU)', secondary: 'Jodhpur, Rajasthan, India', category: 'station' },

  // Tourist Places
  { name: 'Taj Mahal, Eastern Gate, Dharmapuri, Agra, Uttar Pradesh', main: 'Taj Mahal', secondary: 'Eastern Gate, Agra, Uttar Pradesh, India', category: 'attraction' },
  { name: 'Agra Fort, Rakabganj, Agra, Uttar Pradesh', main: 'Agra Fort', secondary: 'Rakabganj, Agra, Uttar Pradesh, India', category: 'attraction' },
  { name: 'Fatehpur Sikri, Uttar Pradesh', main: 'Fatehpur Sikri', secondary: 'Agra District, Uttar Pradesh, India', category: 'attraction' },
  { name: 'Amber Fort, Devisinghpura, Amer, Jaipur, Rajasthan', main: 'Amber Fort (Amer Fort)', secondary: 'Jaipur, Rajasthan, India', category: 'attraction' },
  { name: 'Hawa Mahal, Badi Choupad, Jaipur, Rajasthan', main: 'Hawa Mahal', secondary: 'Badi Choupad, Jaipur, Rajasthan, India', category: 'attraction' },
  { name: 'City Palace, Tripolia Bazar, Jaipur, Rajasthan', main: 'City Palace Jaipur', secondary: 'Jaipur, Rajasthan, India', category: 'attraction' },
  { name: 'Red Fort, Netaji Subhash Marg, Old Delhi', main: 'Red Fort (Lal Qila)', secondary: 'Chandni Chowk, New Delhi, Delhi, India', category: 'attraction' },
  { name: 'Qutub Minar, Seth Sarai, Mehrauli, New Delhi', main: 'Qutub Minar', secondary: 'Mehrauli, New Delhi, Delhi, India', category: 'attraction' },
  { name: 'Har Ki Pauri, Haridwar, Uttarakhand', main: 'Har Ki Pauri', secondary: 'Haridwar, Uttarakhand, India', category: 'attraction' },
  { name: 'Laxman Jhula, Rishikesh, Uttarakhand', main: 'Laxman Jhula', secondary: 'Rishikesh, Uttarakhand, India', category: 'attraction' },
  { name: 'Golden Temple, Amritsar, Punjab', main: 'Golden Temple (Harmandir Sahib)', secondary: 'Amritsar, Punjab, India', category: 'attraction' },
  { name: 'Dashashwamedh Ghat, Varanasi, Uttar Pradesh', main: 'Dashashwamedh Ghat', secondary: 'Varanasi, Uttar Pradesh, India', category: 'attraction' },
  { name: 'City Palace, Udaipur, Rajasthan', main: 'City Palace Udaipur', secondary: 'Udaipur, Rajasthan, India', category: 'attraction' },
  { name: 'Mehrangarh Fort, Jodhpur, Rajasthan', main: 'Mehrangarh Fort', secondary: 'Jodhpur, Rajasthan, India', category: 'attraction' },
  { name: 'Gateway of India, Colaba, Mumbai, Maharashtra', main: 'Gateway of India', secondary: 'Mumbai, Maharashtra, India', category: 'attraction' },
  { name: 'Solang Valley, Manali, Himachal Pradesh', main: 'Solang Valley', secondary: 'Manali, Himachal Pradesh, India', category: 'attraction' },
  { name: 'Rohtang Pass, Manali, Himachal Pradesh', main: 'Rohtang Pass', secondary: 'Himachal Pradesh, India', category: 'attraction' },

  // Hotels & Hubs
  { name: 'JW Marriott Hotel New Delhi Aerocity, Delhi', main: 'JW Marriott Hotel Aerocity', secondary: 'New Delhi, Delhi, India', category: 'hotel' },
  { name: 'The Oberoi Amarvilas, Taj East Gate Road, Agra', main: 'The Oberoi Amarvilas', secondary: 'Agra, Uttar Pradesh, India', category: 'hotel' },
  { name: 'Rambagh Palace, Bhawani Singh Road, Jaipur', main: 'Rambagh Palace', secondary: 'Jaipur, Rajasthan, India', category: 'hotel' },
  { name: 'Taj Mahal Palace Hotel, Colaba, Mumbai', main: 'Taj Mahal Palace Hotel', secondary: 'Colaba, Mumbai, Maharashtra, India', category: 'hotel' },
  { name: 'Connaught Place, Inner Circle, New Delhi', main: 'Connaught Place (CP)', secondary: 'New Delhi, Delhi, India', category: 'address' },
  { name: 'DLF Cyber City, Phase 2, Gurugram, Haryana', main: 'DLF Cyber City', secondary: 'Gurugram, Haryana, India', category: 'address' },
  { name: 'Sector 18, Noida, Uttar Pradesh', main: 'Sector 18 Market', secondary: 'Noida, Uttar Pradesh, India', category: 'address' },
  { name: 'Mall Road, Shimla, Himachal Pradesh', main: 'Mall Road', secondary: 'Shimla, Himachal Pradesh, India', category: 'address' },
  { name: 'Mall Road, Manali, Himachal Pradesh', main: 'Mall Road', secondary: 'Manali, Himachal Pradesh, India', category: 'address' },

  // Major Cities & States
  { name: 'New Delhi, Delhi, India', main: 'New Delhi', secondary: 'Delhi, India', category: 'city' },
  { name: 'Agra, Uttar Pradesh, India', main: 'Agra', secondary: 'Uttar Pradesh, India', category: 'city' },
  { name: 'Jaipur, Rajasthan, India', main: 'Jaipur', secondary: 'Rajasthan, India', category: 'city' },
  { name: 'Chandigarh, Punjab, India', main: 'Chandigarh', secondary: 'India', category: 'city' },
  { name: 'Shimla, Himachal Pradesh, India', main: 'Shimla', secondary: 'Himachal Pradesh, India', category: 'city' },
  { name: 'Manali, Himachal Pradesh, India', main: 'Manali', secondary: 'Himachal Pradesh, India', category: 'city' },
  { name: 'Rishikesh, Uttarakhand, India', main: 'Rishikesh', secondary: 'Uttarakhand, India', category: 'city' },
  { name: 'Haridwar, Uttarakhand, India', main: 'Haridwar', secondary: 'Uttarakhand, India', category: 'city' },
  { name: 'Varanasi, Uttar Pradesh, India', main: 'Varanasi', secondary: 'Uttar Pradesh, India', category: 'city' },
  { name: 'Udaipur, Rajasthan, India', main: 'Udaipur', secondary: 'Rajasthan, India', category: 'city' },
  { name: 'Jodhpur, Rajasthan, India', main: 'Jodhpur', secondary: 'Rajasthan, India', category: 'city' },
  { name: 'Jaisalmer, Rajasthan, India', main: 'Jaisalmer', secondary: 'Rajasthan, India', category: 'city' },
  { name: 'Amritsar, Punjab, India', main: 'Amritsar', secondary: 'Punjab, India', category: 'city' },
  { name: 'Lucknow, Uttar Pradesh, India', main: 'Lucknow', secondary: 'Uttar Pradesh, India', category: 'city' },
  { name: 'Dehradun, Uttarakhand, India', main: 'Dehradun', secondary: 'Uttarakhand, India', category: 'city' },
  { name: 'Mussoorie, Uttarakhand, India', main: 'Mussoorie', secondary: 'Uttarakhand, India', category: 'city' },
  { name: 'Noida, Uttar Pradesh, India', main: 'Noida', secondary: 'Uttar Pradesh, India', category: 'city' },
  { name: 'Gurugram, Haryana, India', main: 'Gurugram (Gurgaon)', secondary: 'Haryana, India', category: 'city' },
  { name: 'Faridabad, Haryana, India', main: 'Faridabad', secondary: 'Haryana, India', category: 'city' },
  { name: 'Ghaziabad, Uttar Pradesh, India', main: 'Ghaziabad', secondary: 'Uttar Pradesh, India', category: 'city' },
  { name: 'Mumbai, Maharashtra, India', main: 'Mumbai', secondary: 'Maharashtra, India', category: 'city' },
  { name: 'Pune, Maharashtra, India', main: 'Pune', secondary: 'Maharashtra, India', category: 'city' },
  { name: 'Ahmedabad, Gujarat, India', main: 'Ahmedabad', secondary: 'Gujarat, India', category: 'city' },
  { name: 'Goa, India', main: 'Goa', secondary: 'India', category: 'city' },
  { name: 'Bengaluru, Karnataka, India', main: 'Bengaluru (Bangalore)', secondary: 'Karnataka, India', category: 'city' },
  { name: 'Chennai, Tamil Nadu, India', main: 'Chennai', secondary: 'Tamil Nadu, India', category: 'city' },
  { name: 'Hyderabad, Telangana, India', main: 'Hyderabad', secondary: 'Telangana, India', category: 'city' },
  { name: 'Kolkata, West Bengal, India', main: 'Kolkata', secondary: 'West Bengal, India', category: 'city' },
  { name: 'Rajasthan, India', main: 'Rajasthan State', secondary: 'India', category: 'city' },
  { name: 'Uttar Pradesh, India', main: 'Uttar Pradesh State', secondary: 'India', category: 'city' },
  { name: 'Uttarakhand, India', main: 'Uttarakhand State', secondary: 'India', category: 'city' },
  { name: 'Himachal Pradesh, India', main: 'Himachal Pradesh State', secondary: 'India', category: 'city' },
  { name: 'Punjab, India', main: 'Punjab State', secondary: 'India', category: 'city' },
  { name: 'Maharashtra, India', main: 'Maharashtra State', secondary: 'India', category: 'city' },
  { name: 'Gujarat, India', main: 'Gujarat State', secondary: 'India', category: 'city' },
  { name: 'Karnataka, India', main: 'Karnataka State', secondary: 'India', category: 'city' },
];

function getCategoryFromTypes(description: string, types: string[] = []): StructuredPrediction['category'] {
  const d = description.toLowerCase();
  if (types.includes('airport') || d.includes('airport') || d.includes('(del)') || d.includes('(bom)') || d.includes('(jai)') || d.includes('terminal')) {
    return 'airport';
  }
  if (types.includes('train_station') || types.includes('transit_station') || d.includes('railway station') || d.includes('junction') || d.includes('station') || d.includes('ndls') || d.includes('cst')) {
    return 'station';
  }
  if (types.includes('lodging') || d.includes('hotel') || d.includes('resort') || d.includes('palace') || d.includes('suites') || d.includes('inn') || d.includes('marriott') || d.includes('oberoi') || d.includes('taj')) {
    return 'hotel';
  }
  if (types.includes('tourist_attraction') || types.includes('point_of_interest') || d.includes('fort') || d.includes('mahal') || d.includes('temple') || d.includes('ghat') || d.includes('tomb') || d.includes('minar') || d.includes('museum')) {
    return 'attraction';
  }
  if (types.includes('locality') || types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
    return 'city';
  }
  return 'address';
}

function getCategoryBadge(cat: StructuredPrediction['category']) {
  switch (cat) {
    case 'airport':
      return { label: 'Airport', bg: 'bg-sky-100 text-sky-800 border-sky-300', icon: <Plane className="w-3 h-3 text-sky-600" /> };
    case 'station':
      return { label: 'Railway Station', bg: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Train className="w-3 h-3 text-amber-700" /> };
    case 'hotel':
      return { label: 'Hotel / Stay', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: <Building2 className="w-3 h-3 text-indigo-600" /> };
    case 'attraction':
      return { label: 'Tourist Place', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <Landmark className="w-3 h-3 text-emerald-600" /> };
    case 'city':
      return { label: 'City / State', bg: 'bg-purple-100 text-purple-800 border-purple-300', icon: <Map className="w-3 h-3 text-purple-600" /> };
    default:
      return { label: 'Area / Address', bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: <MapPin className="w-3 h-3 text-slate-600" /> };
  }
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelectLocation,
  isSelectedFromMaps,
  icon,
  disabled = false,
  required = true,
}) => {
  const [predictions, setPredictions] = useState<StructuredPrediction[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isGoogleLive, setIsGoogleLive] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);

  useEffect(() => {
    ensureGoogleMapsPlacesSDK();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch predictions from Google Maps Places API (India restricted) or comprehensive fallback
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (isSelectedFromMaps && !isOpen) {
      return;
    }

    setIsSearching(true);
    let isMounted = true;

    ensureGoogleMapsPlacesSDK().then(() => {
      if (!isMounted) return;

      if (
        typeof window !== 'undefined' &&
        hasValidKey &&
        !(window as any).__GOOGLE_MAPS_AUTH_FAILED__ &&
        window.google?.maps?.places?.AutocompleteService
      ) {
        try {
          if (!autocompleteServiceRef.current) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
          }
          if (!sessionTokenRef.current && window.google.maps.places.AutocompleteSessionToken) {
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
          }

          autocompleteServiceRef.current.getPlacePredictions(
            {
              input: value,
              componentRestrictions: { country: 'in' }, // Restricted to India (IN) only
              sessionToken: sessionTokenRef.current || undefined,
            },
            (results: any[], status: string) => {
              if (!isMounted) return;
              setIsSearching(false);

              if (status === 'OK' && results && results.length > 0) {
                setIsGoogleLive(true);
                const googleList: StructuredPrediction[] = results.map((r) => {
                  const mainText = r.structured_formatting?.main_text || r.description;
                  const secondaryText = r.structured_formatting?.secondary_text || '';
                  const category = getCategoryFromTypes(r.description, r.types || []);
                  return {
                    description: r.description,
                    mainText,
                    secondaryText,
                    placeId: r.place_id,
                    category,
                  };
                });
                setPredictions(googleList);
                setIsOpen(true);
                return;
              }

              fallbackFilter(value);
            }
          );
          return;
        } catch (e) {
          // Fallthrough to fallback filter
        }
      }

      fallbackFilter(value);
    });

    return () => {
      isMounted = false;
    };
  }, [value, isSelectedFromMaps]);

  const fallbackFilter = (query: string) => {
    setIsGoogleLive(false);
    const q = query.toLowerCase().trim();
    const matches = INDIA_FALLBACK_PLACES.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.main.toLowerCase().includes(q) ||
        p.secondary.toLowerCase().includes(q)
    );

    const mapped: StructuredPrediction[] = matches.map((m) => ({
      description: m.name,
      mainText: m.main,
      secondaryText: m.secondary,
      category: m.category,
    }));

    if (mapped.length === 0) {
      mapped.push({
        description: `${query.trim()}, India`,
        mainText: query.trim(),
        secondaryText: 'India (Custom Address / Location)',
        category: 'address',
      });
    }

    setPredictions(mapped.slice(0, 8));
    setIsOpen(true);
    setIsSearching(false);
  };

  const handleSelect = (pred: StructuredPrediction) => {
    onSelectLocation(pred.description);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative space-y-1">
      <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
        <span className="flex items-center gap-1">
          {icon || <MapPin className="w-3.5 h-3.5 text-sky-600" />}
          {label}
        </span>
        {isSelectedFromMaps && (
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-600" /> Location Selected
          </span>
        )}
      </label>

      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length >= 2) setIsOpen(true);
          }}
          className={`w-full pl-9 pr-8 py-2.5 bg-white border rounded-xl text-xs font-semibold focus:outline-none transition ${
            isSelectedFromMaps
              ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/20 text-slate-900 font-bold'
              : 'border-slate-300 focus:ring-2 focus:ring-sky-500 text-slate-800'
          }`}
          required={required}
        />
        <div className="absolute left-3 top-3 text-slate-400">
          <MapPin className={`w-4 h-4 ${isSelectedFromMaps ? 'text-emerald-600' : 'text-sky-600'}`} />
        </div>

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              setPredictions([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
            aria-label="Clear location input"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isSearching && (
          <div className="absolute right-8 top-3">
            <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Autocomplete Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-300 rounded-2xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100">
          <div className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Google Maps Places (India)
            </span>
            <span className="text-[9px] text-emerald-400 font-extrabold uppercase">
              {isGoogleLive ? '✓ Live Places API' : 'All India Places Search'}
            </span>
          </div>

          <div>
            {predictions.map((item, idx) => {
              const badge = getCategoryBadge(item.category);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-800 hover:bg-sky-50 transition flex items-start justify-between gap-3 group border-b border-slate-50 last:border-b-0"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-sky-100 group-hover:text-sky-700 shrink-0">
                      {badge.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-900 group-hover:text-sky-900 truncate">
                        {item.mainText}
                      </span>
                      {item.secondaryText && (
                        <span className="block text-[11px] text-slate-500 font-medium truncate">
                          {item.secondaryText}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
