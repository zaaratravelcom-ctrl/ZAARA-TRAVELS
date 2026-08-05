import React, { useState } from 'react';
import { MessageSquare, Compass, MapPin, Calendar, Car, Sparkles, Menu, X, CheckCircle2, Phone, FileText, ShieldCheck, Lock } from 'lucide-react';
import { ZaaraLogo } from './ZaaraLogo';
import { CurrencyCode, SUPPORTED_CURRENCIES } from '../utils/currencyConverter';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  setRates: (rates: Record<CurrencyCode, number>) => void;
  onOpenAIPlanner: () => void;
  onOpenLetterhead?: () => void;
  onOpenAdminLogin?: () => void;
  isAdminLoggedIn?: boolean;
  bookingsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  rates,
  setRates,
  onOpenAIPlanner,
  onOpenLetterhead,
  onOpenAdminLogin,
  isAdminLoggedIn = false,
  bookingsCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'packages', label: 'Tours' },
    { id: 'golden-triangle', label: 'Golden' },
    { id: 'same-day', label: 'Day Tours' },
    { id: 'fleet', label: 'Cab Rental' },
    { id: 'my-bookings', label: `Bookings${bookingsCount > 0 ? ` (${bookingsCount})` : ''}` },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      {/* Top Announcements & Contact Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="text-amber-400 font-semibold flex items-center">Zaara Travels<sup className="text-[9px] font-bold text-amber-400 ml-0.5">®</sup></span>
            <span className="text-slate-600">•</span>
            <span className="hidden sm:inline italic text-slate-300">"Your Journey, Our Passion."</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-slate-300 font-semibold text-[11px] sm:text-xs">
            {/* Currency Selector Dropdown */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold hidden sm:inline">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-transparent text-amber-400 text-[11px] font-extrabold focus:outline-none cursor-pointer"
                title="Select Currency"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-slate-900 text-white font-medium">
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <a href="tel:+919933992786" className="flex items-center gap-1 hover:text-amber-400 transition" title="Primary Mobile & WhatsApp">
              <Phone className="w-3 h-3 text-amber-400" />
              <span>+91 99339 92786</span>
            </a>
            <span className="hidden md:inline text-slate-600">•</span>
            <a href="tel:+01169296175" className="hidden lg:flex items-center gap-1 hover:text-amber-400 transition" title="Office Landline">
              <span>+011 69296175</span>
            </a>
            {onOpenAdminLogin && (
              <>
                <span className="hidden md:inline text-slate-600">•</span>
                <button
                  type="button"
                  onClick={onOpenAdminLogin}
                  className="flex items-center gap-1 text-amber-300 hover:text-amber-200 transition font-bold bg-slate-800/90 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700/80"
                  title="Administrator Portal & Management Console"
                >
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center text-left focus:outline-none group py-1"
          aria-label="Zaara Travels Home"
        >
          <ZaaraLogo size="md" className="group-hover:scale-[1.02] transition-transform duration-200" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-semibold transition ${
                activeTab === item.id
                  ? 'bg-sky-50 text-sky-700 border-b-2 border-sky-600'
                  : 'text-slate-700 hover:text-sky-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action CTA Buttons */}
        <div className="hidden xl:flex items-center gap-2">
          {onOpenAdminLogin && (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-lg text-xs transition border border-amber-500/30 shadow-sm"
              title="Administrator Sign In"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAdminLoggedIn ? 'Admin' : 'Admin Login'}</span>
            </button>
          )}
          {onOpenLetterhead && (
            <button
              onClick={onOpenLetterhead}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg text-xs transition border border-slate-300 shadow-sm"
              title="View & Generate Official Zaara Travels Letterhead"
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>Letterhead</span>
            </button>
          )}
          <button
            onClick={() => handleNavClick('contact')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold px-3.5 py-2 rounded-lg text-xs shadow-md transition hover:shadow-lg"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => handleNavClick('contact')}
            className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1.5 rounded text-xs"
          >
            Book Now
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 text-white border-t border-slate-800 py-4 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
                activeTab === item.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {onOpenAdminLogin && (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-amber-300 font-bold py-2.5 rounded-lg text-sm border border-amber-500/30"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>{isAdminLoggedIn ? 'Admin Portal' : 'Admin Login'}</span>
              </button>
            )}
            <button
              onClick={() => {
                handleNavClick('contact');
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold py-2.5 rounded-lg text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Now / Instant Inquiry</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
