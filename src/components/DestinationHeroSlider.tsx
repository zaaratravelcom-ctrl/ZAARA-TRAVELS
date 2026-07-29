import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Sparkles, Compass, Play, Pause, ArrowRight, ShieldCheck, Camera } from 'lucide-react';

export interface DestinationSlide {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  state: string;
  image: string;
  badge: string;
  description: string;
  highlights: string[];
}

export const DESTINATION_SLIDES: DestinationSlide[] = [
  {
    id: 'taj-mahal',
    title: 'The Iconic Taj Mahal',
    subtitle: 'Wonder of the World & Sunrise Monument of Love',
    location: 'Agra',
    state: 'Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1800&q=85',
    badge: '★ #1 Most Visited Landmark',
    description: 'Witness the breathtaking ivory-white marble mausoleum bathed in golden early morning sunlight with expert private guides.',
    highlights: ['Sunrise Skip-the-Line Entry', 'Agra Fort & Mehtab Bagh', 'Express Yamuna Highway Transfer'],
  },
  {
    id: 'jaipur',
    title: 'Jaipur Pink City & Royal Palaces',
    subtitle: 'Majestic Amber Fort & Intricate Hawa Mahal',
    location: 'Jaipur',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1800&q=85',
    badge: '👑 UNESCO World Heritage',
    description: 'Immerse yourself in royal Rajasthani culture, pink sandstone palaces, heritage havelis, and vibrant artisan bazaars.',
    highlights: ['Amber Fort Elephant / Jeep Hill Drive', 'City Palace & Jantar Mantar', 'Traditional Block Printing Workshops'],
  },
  {
    id: 'ranthambore',
    title: 'Ranthambore Tiger Safari',
    subtitle: 'Track Royal Bengal Tigers in Ancient Forests',
    location: 'Ranthambore',
    state: 'Rajasthan',
    image: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=1800&q=85',
    badge: '🐅 Wild Tiger Sanctuary',
    description: 'Experience thrilling open 4x4 Jeep safaris inside Ranthambore National Park beneath 1,000-year-old fort ruins.',
    highlights: ['Guaranteed Core Zone Permits', 'Open 6-Seater 4x4 Gypsies', 'Naturalist & Wildlife Guides'],
  },
  {
    id: 'varanasi',
    title: 'Varanasi Spiritual Ghats',
    subtitle: 'Sacred Ganga Aarti & Ancient Riverside Traditions',
    location: 'Varanasi',
    state: 'Uttar Pradesh',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1800&q=85',
    badge: '🪔 3000+ Year Spiritual Capital',
    description: 'Boat along the holy River Ganges during sunrise and witness the evening grand Ganga Aarti lamp ceremonies on the ghats.',
    highlights: ['Sunrise Boat Ride on River Ganges', 'Evening Grand Aarti Ceremony', 'Sarnath Buddhist Stupa Excursion'],
  },
  {
    id: 'kerala',
    title: 'Kerala Backwaters & Houseboats',
    subtitle: 'God\'s Own Country & Tropical Palm Canals',
    location: 'Alleppey & Munnar',
    state: 'Kerala',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1800&q=85',
    badge: '🌴 Tropical Paradise',
    description: 'Glide through tranquil backwaters on private luxury houseboats, flanked by lush tea gardens and spice plantations.',
    highlights: ['Private Houseboat Overnight Cruise', 'Munnar Tea Estate Walk', 'Ayurvedic Wellness Massages'],
  },
  {
    id: 'kashmir',
    title: 'Kashmir Valley & Gulmarg',
    subtitle: 'Paradise on Earth & Alpine Himalayan Beauty',
    location: 'Srinagar & Gulmarg',
    state: 'Jammu & Kashmir',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1800&q=85',
    badge: '🏔️ Himalayan Paradise',
    description: 'Stay in carved wooden houseboats on Dal Lake, ride the Gulmarg Gondola cable car, and walk through Mughal flower gardens.',
    highlights: ['Shikara Boat Ride on Dal Lake', 'Gulmarg Gondola Snow Ride', 'Pahalgam Pine Valley Tours'],
  },
  {
    id: 'mumbai',
    title: 'Mumbai Coastal Metropolis',
    subtitle: 'Gateway of India, Marine Drive & Bollywood Glamour',
    location: 'Mumbai',
    state: 'Maharashtra',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=85',
    badge: '🏙️ India\'s Bustling Financial Hub',
    description: 'Explore grand Victorian architecture, waterfront promenades, Elephanta Caves island, and rich street food culture.',
    highlights: ['Gateway of India & Taj Palace Hotel', 'Marine Drive Queen\'s Necklace', 'Elephanta Caves UNESCO Ferry'],
  },
];

interface DestinationHeroSliderProps {
  onSelectDestination?: (locationName: string) => void;
}

export const DestinationHeroSlider: React.FC<DestinationHeroSliderProps> = ({ onSelectDestination }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slide = DESTINATION_SLIDES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DESTINATION_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DESTINATION_SLIDES.length) % DESTINATION_SLIDES.length);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  return (
    <div className="w-full relative bg-slate-950 text-white overflow-hidden rounded-3xl border border-slate-800/80 shadow-2xl group">
      {/* Background Image Container with Crossfade */}
      <div
        className="relative w-full h-[450px] sm:h-[490px] lg:h-[520px] overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {DESTINATION_SLIDES.map((item, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
              }`}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center transform transition-transform duration-10000 ease-out group-hover:scale-105"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Gradient Overlays for High Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent" />
            </div>
          );
        })}

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 p-4 sm:p-6 flex flex-col justify-between max-w-7xl mx-auto">
          {/* Top Bar inside Slider */}
          <div className="flex items-center justify-between gap-2">
            {/* Location Pill */}
            <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-white font-extrabold text-[11px] sm:text-xs px-3 py-1.5 rounded-full shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>{slide.location}, {slide.state}</span>
            </div>

            {/* Controls: Play/Pause & Slide Count */}
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-900/80 backdrop-blur border border-slate-700/80 text-amber-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                {currentIndex + 1} / {DESTINATION_SLIDES.length}
              </span>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-slate-900/80 hover:bg-slate-800 backdrop-blur border border-slate-700 text-slate-200 p-1.5 rounded-full shadow transition"
                title={isPlaying ? 'Pause Auto-Slideshow' : 'Start Auto-Slideshow'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Middle Main Text Info */}
          <div className="space-y-2.5 max-w-xl mt-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-md">
              <Sparkles className="w-3 h-3" />
              <span>{slide.badge}</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="truncate">{slide.subtitle}</span>
            </p>

            {/* Description */}
            <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
              {slide.description}
            </p>

            {/* Highlight Pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-0.5">
              {slide.highlights.slice(0, 2).map((hl, i) => (
                <span
                  key={i}
                  className="bg-slate-900/80 border border-slate-700 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur"
                >
                  ✓ {hl}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectDestination && onSelectDestination(slide.location)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-xl transition flex items-center gap-1.5 text-xs transform active:scale-95"
              >
                <span>Explore {slide.location} Tours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-[11px] text-slate-300 font-bold hidden md:flex items-center gap-1 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Camera className="w-3.5 h-3.5 text-sky-400" />
                <span>HD Destination Gallery</span>
              </div>
            </div>
          </div>

          {/* Bottom City Navigation Tabs */}
          <div className="pt-4 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
              {DESTINATION_SLIDES.map((item, idx) => {
                const isSel = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 border ${
                      isSel
                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg ring-2 ring-amber-400/50 scale-105'
                        : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 backdrop-blur'
                    }`}
                  >
                    <span className="text-[10px] opacity-75">{idx + 1}.</span>
                    <span>{item.location}</span>
                  </button>
                );
              })}
            </div>

            {/* Prev / Next Manual Arrows */}
            <div className="flex items-center gap-1.5 shrink-0 pl-2">
              <button
                type="button"
                onClick={() => {
                  handlePrev();
                  setIsPlaying(false);
                }}
                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-white flex items-center justify-center transition shadow backdrop-blur"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  handleNext();
                  setIsPlaying(false);
                }}
                className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 text-white flex items-center justify-center transition shadow backdrop-blur"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Animated Progress Bar along the bottom edge */}
        {isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 z-30">
            <div
              key={currentIndex}
              className="h-full bg-gradient-to-r from-amber-500 to-sky-400 animate-progressBar"
              style={{ animationDuration: '5000ms' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
