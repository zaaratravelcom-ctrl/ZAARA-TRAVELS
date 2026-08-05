import { VehicleOption, TravelService, Testimonial } from '../types';

export const SERVICES_DATA: TravelService[] = [
  {
    id: 'private-tours',
    title: 'Private India Tour Packages',
    iconName: 'Compass',
    shortDesc: 'Handcrafted itineraries tailored to your pace, preferences, and budget.',
    fullDesc: 'Custom private tours across Delhi, Rajasthan, Agra, Varanasi, Kerala, and Himachal Pradesh. Includes dedicated air-conditioned vehicle, vetted local drivers, and licensed guides.',
    features: ['Flexibility to pause or alter routes', 'Dedicated professional driver 24/7', 'Private airport transfers included', 'Government approved guides'],
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'golden-triangle',
    title: 'Golden Triangle Tours',
    iconName: 'MapPin',
    shortDesc: 'The classic circuit connecting Delhi, Agra, and Jaipur with luxury comfort.',
    fullDesc: 'Explore India’s most celebrated historic circuit featuring Mughal architecture, the UNESCO World Heritage Taj Mahal, and pink royal palaces of Jaipur.',
    features: ['Express highway travel', 'Sunrise Taj Mahal access', 'Elephant/Jeep rides at Amer Fort', 'Free spice market walking tour'],
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tiger-safari',
    title: 'Ranthambore Tiger Safari',
    iconName: 'Trees',
    shortDesc: 'Thrilling open-top 4x4 Jeep and Canter wildlife safaris in Ranthambore Reserve.',
    fullDesc: 'Get up close with Royal Bengal Tigers, leopards, and ancient fortress ruins inside Ranthambore National Park. Safari tickets & permits arranged guaranteed.',
    features: ['Guaranteed zone booking', 'Private 4x4 Jeep or 20-Seater Canter', 'Accompanied by certified naturalist', 'Resort transfers included'],
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'car-driver',
    title: 'Private Car & Driver Rental',
    iconName: 'Car',
    shortDesc: 'Luxury AC Sedans, SUVs, and Tempo Travellers with uniform commercial drivers.',
    fullDesc: 'Rent a private car with a courteous, English-speaking driver for intercity transfers or full India road trips. Clean vehicles, fuel, toll, and permits handled seamlessly.',
    features: ['Zero hidden fuel charges', 'All highway tolls & state permits paid', 'Punctual door-to-door service', 'Luggage assistance included'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hotel-booking',
    title: 'Heritage & Luxury Hotel Bookings',
    iconName: 'Building',
    shortDesc: 'Handpicked 3-star, 4-star, and 5-star palace hotels at discounted corporate rates.',
    fullDesc: 'Stay like royalty in authentic Rajasthani Haveli palaces, 5-star Oberoi / Taj properties, or comfortable budget boutique hotels with daily breakfast.',
    features: ['Exclusive Zaara Travels discount rates', 'Free room upgrade subject to availability', 'Early check-in assistance', 'Complimentary breakfast'],
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'airport-transfer',
    title: 'Airport Pickup & Drop Services',
    iconName: 'PlaneTakeoff',
    shortDesc: 'Reliable, 24/7 flight-tracked airport transfers in Delhi, Jaipur, Mumbai & Agra.',
    fullDesc: 'Never worry about missing a flight or finding a taxi at midnight. Our professional driver holds a personalized nameboard at arrival gates.',
    features: ['Live flight status tracking', 'Paging board at terminal exit', 'No surge pricing', 'Assistance with SIM cards & currency'],
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80',
  },
];

export const VEHICLES_DATA: VehicleOption[] = [
  {
    id: 'sedan-dzire',
    name: 'Dzire / Aura / Etios',
    category: 'Sedan',
    passengers: '1–4 Passengers',
    seatingCapacity: '4 Passengers',
    acDetails: 'Air Conditioned (Climate Control AC)',
    luggage: '2 Large + 2 Hand Bags',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    features: ['Air Conditioned (AC)', 'Clean Cloth Interiors', 'Bluetooth Music System', 'First Aid Kit & Water Bottles', 'Uniformed Professional Driver', 'Fuel & Toll Included'],
    idealFor: 'Couples, solo travelers & small families 1–4 Passengers.',
    ratePerDayINR: 2800,
    ratePerKmINR: 14,
    ratePerKmOneWayINR: 14,
    ratePerKmRoundTripINR: 14,
    discountPercentage: 10,
  },
  {
    id: 'suv-ertiga',
    name: 'Ertiga / Rumion / XUV700',
    category: 'SUV',
    passengers: '4–6 Passengers',
    seatingCapacity: '6 Passengers',
    acDetails: 'Front & Rear Dual Air Conditioned',
    luggage: '3 Large + 2 Small Bags',
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
    features: ['Dual Zone AC Vents', 'Spacious Legroom', 'USB Phone Chargers', 'Highway Toll & Tax Paid', 'Luggage Carrier', 'English-Speaking Driver'],
    idealFor: 'Families & small groups needing extra boot space 4–6 Passengers.',
    ratePerDayINR: 3800,
    ratePerKmINR: 20,
    ratePerKmOneWayINR: 20,
    ratePerKmRoundTripINR: 20,
    discountPercentage: 15,
  },
  {
    id: 'innova-crysta',
    name: 'Innova Crysta / Hycross',
    category: 'Toyota',
    passengers: '6–7 Passengers',
    seatingCapacity: '6–7 Passengers',
    acDetails: 'Automatic Climate Control AC (All Rows)',
    luggage: '4 Large + 3 Hand Suitcases',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    features: ['Captain Reclining Leather Seats', 'Individual AC Vents', 'Ultra Smooth Highway Suspension', 'First Aid & Mineral Water', 'Punctual Vetted Driver'],
    idealFor: 'Premium family road trips & VIP intercity transfers 6–7 Passengers.',
    ratePerDayINR: 4800,
    ratePerKmINR: 25,
    ratePerKmOneWayINR: 25,
    ratePerKmRoundTripINR: 25,
    discountPercentage: 25,
  },
  {
    id: 'tempo-traveller-12',
    name: 'Force Tempo Traveller',
    category: 'Force Tempo',
    passengers: '7–16 Passengers',
    seatingCapacity: '7–16 Passengers',
    acDetails: 'Heavy-Duty Roof Air Conditioner',
    luggage: '10 Large Suitcases + Roof Carrier',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    features: ['Pushback Recliner Seats', 'High Ceiling Standing Height', 'Powerful Heavy-Duty AC', 'Stereo Sound System with Mic', 'All Interstate Permits Included'],
    idealFor: 'Large families, corporate teams & tour groups 7–16 Passengers.',
    ratePerDayINR: 7500,
    ratePerKmINR: 30,
    ratePerKmOneWayINR: 30,
    ratePerKmRoundTripINR: 30,
    discountPercentage: 30,
  },
];

export function getVehiclePerKmRate(vehicle: VehicleOption): number {
  if (!vehicle) return 14;
  const nameCat = `${vehicle.name} ${vehicle.category}`.toLowerCase();
  if (nameCat.includes('tempo') || nameCat.includes('force')) {
    return 30;
  }
  if (nameCat.includes('crysta') || nameCat.includes('hycross') || nameCat.includes('toyota')) {
    return 25;
  }
  if (nameCat.includes('suv') || nameCat.includes('ertiga') || nameCat.includes('rumion') || nameCat.includes('xuv')) {
    return 20;
  }
  if (nameCat.includes('sedan') || nameCat.includes('dzire') || nameCat.includes('aura') || nameCat.includes('etios')) {
    return 14;
  }
  return vehicle.ratePerKmINR || 14;
}

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Mark & Sarah Thompson',
    country: 'United Kingdom 🇬🇧',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    tourTaken: '6-Day Golden Triangle with Ranthambore',
    rating: 5,
    date: 'February 2026',
    comment: 'The team at Zaara Travels provided exceptional service! Our driver Mr. Rajesh was punctual, friendly, and navigated India streets like a pro. The Taj Mahal sunrise tour and tiger safari in Ranthambore were unforgettable moments of our life!',
  },
  {
    id: 'test-2',
    name: 'Elena Rostova',
    country: 'Spain 🇪🇸',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    tourTaken: 'Taj Mahal Sunrise Day Tour from Delhi',
    rating: 5,
    date: 'January 2026',
    comment: 'Booked the Taj Mahal sunrise tour via WhatsApp with Zaara Travels. The Toyota Innova arrived at my hotel at 3 AM sharp. Guide in Agra was so knowledgeable and took amazing photos of me without crowd in background. Highly recommend Zaara Travels!',
  },
  {
    id: 'test-3',
    name: 'Dr. Vikram Malhotra',
    country: 'Australia 🇦🇺',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    tourTaken: 'Private Car & Driver 10 Days Rajasthan Circuit',
    rating: 5,
    date: 'December 2025',
    comment: 'GST invoices were provided instantly (GSTIN: 19ACUPH2897Q2ZA) for our corporate expenses. The vehicle was brand new, super clean, and stocked with chilled water daily. Zaara Travels is the most honest agency in India.',
  },
];
