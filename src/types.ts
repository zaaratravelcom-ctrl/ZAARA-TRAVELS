export interface TourPackage {
  id: string;
  title: string;
  duration: string;
  category: 'golden-triangle' | 'safari' | 'day-tour' | 'sightseeing' | 'spiritual';
  cities: string[];
  image: string;
  gallery?: string[];
  priceFromINR: number;
  priceFromUSD: number;
  rating: number;
  reviewsCount: number;
  popularTag?: string;
  overview: string;
  highlights: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    stayOrLocation: string;
  }[];
  included: string[];
  excluded: string[];
}

export interface TravelService {
  id: string;
  title: string;
  iconName: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  image: string;
}

export interface VehicleOption {
  id: string;
  name: string;
  category: string;
  passengers: string;
  luggage: string;
  image: string;
  features: string[];
  idealFor: string;
  ratePerDayINR: number;
}

export interface Testimonial {
  id: string;
  name: string;
  country: string;
  avatar: string;
  tourTaken: string;
  rating: number;
  date: string;
  comment: string;
}

export interface InquiryFormData {
  name: string;
  phone: string;
  email: string;
  tourName: string;
  travelers: number;
  travelDate: string;
  notes: string;
}

export interface CustomItineraryResult {
  itineraryTitle: string;
  overview: string;
  days: {
    day: number;
    title: string;
    activities: string[];
    stayLocation: string;
    insiderTip?: string;
  }[];
  recommendedVehicle: string;
  estimatedPriceRange: string;
  includedServices: string[];
  whatsappSummary: string;
  source?: string;
}
