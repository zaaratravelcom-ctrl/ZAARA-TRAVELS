import React, { useState, useMemo } from 'react';
import { TourPackage } from '../types';
import { TourCard } from './TourCard';
import { CurrencyCode, formatConvertedPrice } from '../utils/currencyConverter';
import { getTourGalleryImages } from '../utils/galleryHelper';
import { OfferBadge } from './OfferBadge';
import {
  Search,
  SlidersHorizontal,
  Grid,
  List,
  X,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Filter,
  Sparkles,
  Camera,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

interface TourListingViewProps {
  tours: TourPackage[];
  currency: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  activeCategoryFilter?: string;
  onSelectTour: (tour: TourPackage) => void;
  onQuickBook: (tour: TourPackage) => void;
  onOpenAIPlanner?: () => void;
}

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'duration-short' | 'duration-long' | 'rating';
type ViewMode = 'grid' | 'list';
type DurationFilter = 'all' | '1-day' | '2-3-days' | '4-6-days' | '7-plus-days';

export const TourListingView: React.FC<TourListingViewProps> = ({
  tours,
  currency,
  rates,
  activeCategoryFilter = 'all',
  onSelectTour,
  onQuickBook,
  onOpenAIPlanner,
}) => {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategoryFilter);
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [maxPriceINR, setMaxPriceINR] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(9);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Sync category if prop changes
  React.useEffect(() => {
    setSelectedCategory(activeCategoryFilter);
    setCurrentPage(1);
  }, [activeCategoryFilter]);

  // Extract all unique cities for city filter tags
  const allCities = useMemo(() => {
    const citySet = new Set<string>();
    tours.forEach((t) => t.cities.forEach((c) => citySet.add(c)));
    return Array.from(citySet).sort();
  }, [tours]);

  // Parse duration in days helper
  const getDurationDays = (durationStr: string): number => {
    const match = durationStr.match(/(\d+)\s*Day/i);
    if (match) return parseInt(match[1], 10);
    if (durationStr.toLowerCase().includes('half day') || durationStr.toLowerCase().includes('same day')) return 1;
    return 1;
  };

  // Filtered & Sorted Tours Computation (Memoized for high performance)
  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        // Search matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesTitle = tour.title.toLowerCase().includes(q);
          const matchesCity = tour.cities.some((c) => c.toLowerCase().includes(q));
          const matchesOverview = tour.overview.toLowerCase().includes(q);
          const matchesTag = tour.popularTag?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCity && !matchesOverview && !matchesTag) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all') {
          if (tour.category !== selectedCategory) return false;
        }

        // City filter
        if (selectedCity !== 'all') {
          if (!tour.cities.includes(selectedCity)) return false;
        }

        // Duration filter
        const days = getDurationDays(tour.duration);
        if (durationFilter === '1-day' && days !== 1) return false;
        if (durationFilter === '2-3-days' && (days < 2 || days > 3)) return false;
        if (durationFilter === '4-6-days' && (days < 4 || days > 6)) return false;
        if (durationFilter === '7-plus-days' && days < 7) return false;

        // Max price filter
        if (tour.priceFromINR > maxPriceINR) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceFromINR - b.priceFromINR;
        if (sortBy === 'price-high') return b.priceFromINR - a.priceFromINR;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'duration-short') return getDurationDays(a.duration) - getDurationDays(b.duration);
        if (sortBy === 'duration-long') return getDurationDays(b.duration) - getDurationDays(a.duration);
        // Default recommended / rating * reviews
        return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
      });
  }, [tours, searchQuery, selectedCategory, selectedCity, durationFilter, maxPriceINR, sortBy]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCity, durationFilter, maxPriceINR, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTours.length / pageSize);
  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTours.slice(start, start + pageSize);
  }, [filteredTours, currentPage, pageSize]);

  // Active filters count
  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedCity !== 'all' ? 1 : 0) +
    (durationFilter !== 'all' ? 1 : 0) +
    (maxPriceINR < 150000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCity('all');
    setDurationFilter('all');
    setMaxPriceINR(150000);
    setSortBy('recommended');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-slate-800 text-amber-400 font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              <span>Zaara Travels Official Tour Catalog ({tours.length}+ Packages)</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Private Tour Packages in India
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore Golden Triangle circuits, tiger safaris, spiritual ghats, and hill stations with private AC driver cars, expert local guides, and 100% customizable dates.
            </p>
          </div>

          {onOpenAIPlanner && (
            <button
              onClick={onOpenAIPlanner}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-lg transition flex items-center gap-2 text-xs sm:text-sm shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Generate AI Custom Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Search & Filtering Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by tour title, city (e.g., Agra, Jaipur), or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls: Sorting, View Mode, Mobile Filter Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="recommended">⭐ Recommended & Rating</option>
                <option value="price-low">₹ Price: Low to High</option>
                <option value="price-high">₹ Price: High to Low</option>
                <option value="duration-short">⏱ Duration: Shortest First</option>
                <option value="duration-long">⏱ Duration: Longest First</option>
                <option value="rating">🏆 Highest Customer Rating</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Compact List View"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {[
            { id: 'all', label: `All Tours (${tours.length})` },
            { id: 'golden-triangle', label: `Golden Triangle (${tours.filter((t) => t.category === 'golden-triangle').length})` },
            { id: 'day-tour', label: `Same Day Express (${tours.filter((t) => t.category === 'day-tour').length})` },
            { id: 'safari', label: `Tiger Safaris (${tours.filter((t) => t.category === 'safari').length})` },
            { id: 'spiritual', label: `Spiritual & Ganges (${tours.filter((t) => t.category === 'spiritual').length})` },
            { id: 'sightseeing', label: `City Sightseeing (${tours.filter((t) => t.category === 'sightseeing').length})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-amber-400 shadow-md ring-2 ring-slate-900'
                  : 'bg-slate-100 border border-slate-200/80 text-slate-700 hover:bg-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Detailed Filters (City, Duration, Price) - Desktop Bar & Mobile Dropdown */}
        <div
          className={`${
            showMobileFilters ? 'block' : 'hidden lg:block'
          } pt-3 border-t border-slate-100 space-y-4`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Duration Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Duration
              </label>
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as DurationFilter)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Durations</option>
                <option value="1-day">1 Same Day Tour</option>
                <option value="2-3-days">2 to 3 Days</option>
                <option value="4-6-days">4 to 6 Days</option>
                <option value="7-plus-days">7+ Days Grand Circuit</option>
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Filter by City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Destination Cities</option>
                {allCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Price Filter Slider */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                <span>Max Starting Price</span>
                <span className="text-sky-600 font-extrabold text-xs">
                  {maxPriceINR >= 150000 ? 'Any Price' : `₹${maxPriceINR.toLocaleString('en-IN')}`}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={150000}
                step={5000}
                value={maxPriceINR}
                onChange={(e) => setMaxPriceINR(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Page Size & Reset Button */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Items / Page
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={18}>18 per page</option>
                  <option value={36}>All {tours.length} per page</option>
                </select>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-slate-500 font-semibold">Active Filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  Category: {selectedCategory}
                  <X onClick={() => setSelectedCategory('all')} className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" />
                </span>
              )}
              {selectedCity !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  City: {selectedCity}
                  <X onClick={() => setSelectedCity('all')} className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" />
                </span>
              )}
              {durationFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  Duration: {durationFilter}
                  <X onClick={() => setDurationFilter('all')} className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" />
                </span>
              )}
              {maxPriceINR < 150000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  Max ₹{maxPriceINR.toLocaleString('en-IN')}
                  <X onClick={() => setMaxPriceINR(150000)} className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                  "{searchQuery}"
                  <X onClick={() => setSearchQuery('')} className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Bar */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredTours.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span>–
          <span className="font-bold text-slate-900">{Math.min(currentPage * pageSize, filteredTours.length)}</span> of{' '}
          <span className="font-extrabold text-sky-600">{filteredTours.length}</span> Matching Tour Packages
        </div>

        <div className="text-slate-500 hidden sm:block">
          All tours include Private AC Vehicle & Certified Guide options
        </div>
      </div>

      {/* No Results State */}
      {filteredTours.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto text-2xl font-bold">
            🔍
          </div>
          <h3 className="text-lg font-black text-slate-900">No Tours Matched Your Search</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We couldn't find any tour packages matching your exact criteria. Try adjusting your price slider or clearing filters.
          </p>
          <button
            onClick={resetAllFilters}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition shadow"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  currency={currency}
                  rates={rates}
                  onSelectTour={onSelectTour}
                  onQuickBook={onQuickBook}
                />
              ))}
            </div>
          )}

          {/* COMPACT LIST VIEW */}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {paginatedTours.map((tour) => {
                const displayPrice = formatConvertedPrice(
                  tour.priceFromUSD,
                  tour.priceFromINR,
                  currency,
                  rates
                );
                const galleryImages = getTourGalleryImages(tour);

                return (
                  <div
                    key={tour.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row gap-5 items-stretch group notranslate"
                    translate="no"
                  >
                    {/* Thumbnail Image */}
                    <div
                      onClick={() => onSelectTour(tour)}
                      className="relative w-full md:w-64 h-48 md:h-auto rounded-xl overflow-hidden bg-slate-900 shrink-0 cursor-pointer select-none"
                    >
                      <img
                        src={galleryImages[0]}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                      {tour.discountPercentage || tour.offerTag ? (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <OfferBadge discountPercentage={tour.discountPercentage} offerTag={tour.offerTag} />
                        </div>
                      ) : tour.popularTag ? (
                        <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow z-10">
                          {tour.popularTag}
                        </span>
                      ) : null}

                      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-white text-[11px] font-semibold bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>{tour.cities.slice(0, 3).join(' • ')}</span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-white text-[11px] font-bold bg-slate-900/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                        <Camera className="w-3 h-3 text-sky-400" />
                        <span>{galleryImages.length} Photos</span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Rating & Duration */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{tour.rating.toFixed(1)}</span>
                              <span className="text-slate-400 font-normal">({tour.reviewsCount})</span>
                            </span>
                            <span className="flex items-center gap-1 text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {tour.duration}
                            </span>
                          </div>

                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Private AC Driver
                          </span>
                        </div>

                        {/* Title */}
                        <h3
                          onClick={() => onSelectTour(tour)}
                          className="text-base sm:text-lg font-black text-slate-900 hover:text-sky-600 cursor-pointer transition leading-snug"
                        >
                          {tour.title}
                        </h3>

                        {/* Overview snippet */}
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                          {tour.overview}
                        </p>

                        {/* Top Highlights */}
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {tour.highlights.slice(0, 3).map((hl, i) => (
                            <span
                              key={i}
                              className="text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg"
                            >
                              ✓ {hl}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price & Action Row */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Starting From
                          </span>
                          <div className="text-lg font-black text-slate-900">
                            {displayPrice}
                            <span className="text-xs font-normal text-slate-500 ml-1">/ person</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectTour(tour)}
                            className="h-10 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center whitespace-nowrap"
                          >
                            Tour Details
                          </button>

                          <button
                            onClick={() => onQuickBook(tour)}
                            className="h-10 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center whitespace-nowrap gap-1"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-8">
              <div className="text-xs font-semibold text-slate-600">
                Page <span className="font-extrabold text-slate-900">{currentPage}</span> of{' '}
                <span className="font-extrabold text-slate-900">{totalPages}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage((p) => p - 1);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition ${
                        currentPage === pageNum
                          ? 'bg-sky-600 text-white shadow-md'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    if (currentPage < totalPages) {
                      setCurrentPage((p) => p + 1);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
