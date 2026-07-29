import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TourCard } from './components/TourCard';
import { TourDetailsModal } from './components/TourDetailsModal';
import { AIPlannerModal } from './components/AIPlannerModal';
import { MyBookingsView } from './components/MyBookingsView';
import { ContactView } from './components/ContactView';
import { FleetView } from './components/FleetView';
import { RegionalClimateSection } from './components/RegionalClimateSection';
import { CompareToursModal } from './components/CompareToursModal';
import { DestinationHeroSlider } from './components/DestinationHeroSlider';
import { LanguageSwitcherBottom } from './components/LanguageSwitcher';
import { FloatingSupportChat } from './components/FloatingSupportChat';
import { POPULAR_TOURS } from './data/toursData';
import { TESTIMONIALS_DATA } from './data/vehiclesData';
import { TourPackage } from './types';
import { CurrencyCode, FALLBACK_RATES_FROM_USD } from './utils/currencyConverter';
import { Search, Sparkles, ShieldCheck, MapPin, Compass, Award, Star, MessageSquare, ArrowRight, CheckCircle2, UserCheck, Phone, ArrowRightLeft } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES_FROM_USD);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ITEMS_PER_PAGE = 6;

  // Selected Tour for Modal
  const [selectedTourModal, setSelectedTourModal] = useState<TourPackage | null>(null);

  // Compare Tours Modal State
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [compareTourA, setCompareTourA] = useState<string | undefined>(undefined);

  // AI Planner Modal Open State
  const [isAIPlannerOpen, setIsAIPlannerOpen] = useState<boolean>(false);

  const handleOpenCompare = (tour?: TourPackage) => {
    if (tour) {
      setCompareTourA(tour.id);
    }
    setIsCompareOpen(true);
  };

  // Bookings state initialized from localStorage
  const [bookings, setBookings] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('zaara_travels_bookings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        bookingId: 'ZT-892410',
        guestName: 'Sarah Thompson',
        guestPhone: '+1 555-0199',
        guestEmail: 'sarah.t@example.com',
        tourTitle: '6-Day Golden Triangle Tour with Ranthambore Tiger Safari',
        travelDate: '2026-08-15',
        travelers: { adults: 2, children: 0 },
        vehicleType: 'Toyota Innova Crysta (6+1 Seater)',
        hotelOption: '4-Star Boutique & Heritage Haveli',
        totalAmountINR: 68000,
        totalAmountUSD: 820,
        paymentMethod: 'RAZORPAY (Paid in Full)',
        paymentStatus: 'PAID IN FULL',
        bookingDate: 'Jul 28, 2026',
        specialRequests: 'Taj Mahal sunrise tour guide requested',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('zaara_travels_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  const handleAddBooking = (newBooking: any) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  const handleRemoveBooking = (id: string) => {
    if (window.confirm('Are you sure you want to remove this booking from your local list?')) {
      setBookings((prev) => prev.filter((b) => b.bookingId !== id));
    }
  };

  // Filter tours based on search, activeTab, and selected category
  const filteredTours = POPULAR_TOURS.filter((tour) => {
    // Search matching
    const matchesSearch =
      tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tour.cities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      tour.overview.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab specific filter
    if (activeTab === 'golden-triangle') return tour.category === 'golden-triangle';
    if (activeTab === 'same-day') return tour.category === 'day-tour';
    if (activeTab === 'tiger-safari') return tour.category === 'safari';

    // Category filter in Packages view
    if (selectedCategory !== 'all') {
      return tour.category === selectedCategory;
    }

    return true;
  });

  // Reset page when filter or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE);
  const paginatedTours = filteredTours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        rates={rates}
        setRates={setRates}
        onOpenAIPlanner={() => setIsAIPlannerOpen(true)}
        bookingsCount={bookings.length}
      />

      {/* Main Content Render */}
      <main className="flex-1">
        {/* HOME TAB VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-slate-950 text-white overflow-hidden pt-12 pb-20 px-4 sm:px-6">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_50%)] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(2,132,199,0.15),transparent_50%)] pointer-events-none" />

              <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Text & Search Column (Half-Width) */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-amber-400 font-extrabold text-xs px-3.5 py-1.5 rounded-full shadow">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Government Registered Operator • Zaara Travels</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                    Experience India with <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-sky-400 bg-clip-text text-transparent">
                      Private Tours & Local Guides
                    </span>
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Explore the Golden Triangle, witness sunrise at the Taj Mahal, track Bengal Tigers in Ranthambore, and discover ancient palaces in ultimate air-conditioned comfort.
                  </p>

                  {/* Search Bar */}
                  <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
                    <div className="pl-3 text-slate-300">
                      <Search className="w-5 h-5 text-amber-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Taj Mahal, Jaipur, Tiger Safari..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent w-full px-2 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => setActiveTab('packages')}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-4 sm:px-5 py-2.5 rounded-xl text-xs transition shadow shrink-0"
                    >
                      Find Packages
                    </button>
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => setIsAIPlannerOpen(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black px-5 py-3 rounded-xl shadow-lg transition text-xs sm:text-sm"
                    >
                      <Sparkles className="w-4 h-4 fill-slate-950" />
                      <span>AI Custom Tour</span>
                    </button>

                    <a
                      href="https://wa.me/919933992786?text=Hello%20Zaara%20Travels,%20I%20want%20to%20plan%20a%20tour%20package."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-3 rounded-xl shadow transition text-xs sm:text-sm"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      <span>WhatsApp Support</span>
                    </a>
                  </div>

                  {/* Verified Agency Note */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      GSTIN: 19ACUPH2897Q2ZA
                    </span>
                    <span className="text-amber-400 font-extrabold">📞 24/7: +91 99339 92786</span>
                  </div>
                </div>

                {/* Right Column: Half-Width Interactive Destination Image Slider */}
                <div className="lg:col-span-6">
                  <DestinationHeroSlider
                    onSelectDestination={(loc) => {
                      setSearchQuery(loc);
                      setActiveTab('packages');
                    }}
                  />
                </div>
              </div>
            </section>

            {/* Popular Tours Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-sky-600 uppercase tracking-widest block">
                    Handcrafted India Holidays
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Popular Tour Packages</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenCompare()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                    <span>Compare Any 2 Tours</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('packages')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800 transition"
                  >
                    <span>View All Packages</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of Tours */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {POPULAR_TOURS.slice(0, 6).map((tour) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    currency={currency}
                    rates={rates}
                    onSelectTour={(t) => setSelectedTourModal(t)}
                    onQuickBook={(t) => setSelectedTourModal(t)}
                    onCompareTour={(t) => handleOpenCompare(t)}
                  />
                ))}
              </div>
            </section>

            {/* Regional Climate & Best Travel Season Component */}
            <RegionalClimateSection />

            {/* Services Offered Section */}
            <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Everything You Need</span>
                  <h2 className="text-3xl font-black text-slate-900">Services Offered by Zaara Travels</h2>
                  <p className="text-xs text-slate-600">
                    Managed directly by Jahangir Khan for seamless travel across India.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xl">
                      🏛️
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Golden Triangle & Sightseeing</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Comprehensive private sightseeing of Delhi monuments, Agra Taj Mahal, Jaipur Forts, Mumbai coastal landmarks, and Varanasi ghats.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xl">
                      🐅
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Ranthambore Tiger Safaris</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Guaranteed safari zone booking with open-top 4x4 Jeeps and Canters accompanied by naturalists inside Ranthambore National Park.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-bold text-xl">
                      🚗
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg">Private Car & Chauffeur</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Chauffeur-driven Maruti Dzire Sedans, Toyota Innova Crysta SUVs, and Tempo Travellers for intercity transfers with zero hidden toll fees.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-widest">Traveler Reviews</span>
                <h2 className="text-3xl font-black text-slate-900">What Our Guests Say</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS_DATA.map((t) => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>

                    <p className="text-xs text-slate-700 italic leading-relaxed">"{t.comment}"</p>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                      <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500">{t.country} • {t.tourTaken}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* PACKAGES / GOLDEN TRIANGLE / SAME DAY / TIGER SAFARI TAB */}
        {['packages', 'golden-triangle', 'same-day', 'tiger-safari'].includes(activeTab) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">
                  Zaara Travels Catalog
                </span>
                <h1 className="text-3xl font-black text-white mt-2">
                  {activeTab === 'golden-triangle'
                    ? 'Golden Triangle Tours'
                    : activeTab === 'same-day'
                    ? 'Same Day Express Tours'
                    : activeTab === 'tiger-safari'
                    ? 'Ranthambore Tiger Safaris'
                    : 'All India Tour Packages'}
                </h1>
                <p className="text-xs text-slate-300 mt-1">
                  Private air-conditioned transfers, expert guides, flexible dates, and custom choices.
                </p>
              </div>

              {/* Search in Catalog */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter by city, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 text-white text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Category Filter Pills (Only on main packages view) */}
            {activeTab === 'packages' && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: 'All Packages' },
                  { id: 'golden-triangle', label: 'Golden Triangle' },
                  { id: 'safari', label: 'Tiger Safaris' },
                  { id: 'day-tour', label: 'Same Day Tours' },
                  { id: 'sightseeing', label: 'City Sightseeing' },
                  { id: 'spiritual', label: 'Spiritual & Ganges' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      selectedCategory === cat.id
                        ? 'bg-sky-600 text-white shadow'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {filteredTours.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
                <p className="text-slate-600 text-sm font-semibold">No tour packages matched your filter criteria.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  className="mt-3 text-xs text-sky-600 font-bold hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      currency={currency}
                      rates={rates}
                      onSelectTour={(t) => setSelectedTourModal(t)}
                      onQuickBook={(t) => setSelectedTourModal(t)}
                      onCompareTour={(t) => handleOpenCompare(t)}
                    />
                  ))}
                </div>

                {/* Pagination Bar (Page 1, Page 2) */}
                {totalPages > 1 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="text-xs font-semibold text-slate-600">
                      Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–
                      <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredTours.length)}</span> of{' '}
                      <span className="font-bold text-slate-900">{filteredTours.length}</span> Tour Packages
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage((p) => p - 1);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage === 1}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        ← Prev
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
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                              currentPage === pageNum
                                ? 'bg-sky-600 text-white shadow-md'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            Page {pageNum}
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
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FLEET TAB VIEW */}
        {activeTab === 'fleet' && (
          <FleetView
            currency={currency}
            rates={rates}
            onBookVehicle={(vName) => {
              setActiveTab('contact');
            }}
          />
        )}

        {/* MY BOOKINGS TAB VIEW */}
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            onRemoveBooking={handleRemoveBooking}
            onExploreTours={() => setActiveTab('packages')}
          />
        )}

        {/* CONTACT TAB VIEW */}
        {activeTab === 'contact' && <ContactView />}
      </main>

      {/* Modals */}
      <TourDetailsModal
        tour={selectedTourModal}
        onClose={() => setSelectedTourModal(null)}
        currency={currency}
        rates={rates}
        onAddBooking={handleAddBooking}
      />

      <AIPlannerModal
        isOpen={isAIPlannerOpen}
        onClose={() => setIsAIPlannerOpen(false)}
        currency={currency}
        onAddCustomBooking={handleAddBooking}
      />

      <CompareToursModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        initialTourAId={compareTourA}
        currency={currency}
        rates={rates}
        onBookTour={(tour) => setSelectedTourModal(tour)}
      />

      {/* Floating Bottom Language Switcher */}
      <LanguageSwitcherBottom />

      {/* Floating Support Chat */}
      <FloatingSupportChat
        onNavigateToContact={() => {
          setActiveTab('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} onOpenAIPlanner={() => setIsAIPlannerOpen(true)} />
    </div>
  );
}
