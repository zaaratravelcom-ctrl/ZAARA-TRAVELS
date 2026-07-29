import React from 'react';
import { Phone, Mail, MapPin, Globe, ShieldCheck, MessageSquare, Award, Clock, Heart } from 'lucide-react';
import { ZaaraLogo } from './ZaaraLogo';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAIPlanner: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAIPlanner }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Proposition Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Govt Approved & GST Registered</h4>
              <p className="text-xs text-slate-400 mt-1">Official GSTIN: 19ACUPH2897Q2ZA. Tax-compliant billing & vouchers.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Owner-Managed Service</h4>
              <p className="text-xs text-slate-400 mt-1">Directly overseen by Zaara Travels team for 100% satisfaction.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">24/7 WhatsApp Assistance</h4>
              <p className="text-xs text-slate-400 mt-1">Instant updates, flight delay tracking & emergency driver dispatches.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Custom Private Itineraries</h4>
              <p className="text-xs text-slate-400 mt-1">Private AC vehicle, flexible schedules, and verified English-speaking guides.</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <ZaaraLogo size="lg" variant="dark" />
              <p className="text-xs text-amber-400 font-semibold tracking-wide mt-1">Your Journey, Our Passion.</p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              Zaara Travels is a leading private India tour operator based in India. Specialized in Golden Triangle Tours (Delhi, Agra, Jaipur), Ranthambore Tiger Safaris, heritage hotel bookings, and luxury private car transfers with personal drivers.
            </p>

            <div className="pt-2 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span><strong>GSTIN:</strong> 19ACUPH2897Q2ZA</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span><strong>Official Travel Desk:</strong> Zaara Travels</span>
              </div>
            </div>

            {/* Social Media & Trust Profiles */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider shrink-0 mr-1">
                  Follow Us & Verified Reviews:
                </span>
                {/* Instagram */}
                <a
                  href="https://instagram.com/zaaratravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 text-pink-300 border border-pink-800/60 text-[11px] font-semibold transition shrink-0"
                  title="Follow Zaara Travels on Instagram"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>

                {/* Facebook */}
                <a
                  href="https://facebook.com/zaaratravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/60 text-[11px] font-semibold transition shrink-0"
                  title="Visit Zaara Travels Facebook Page"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
                  </svg>
                  <span>Facebook</span>
                </a>

                {/* YouTube */}
                <a
                  href="https://youtube.com/@zaaratravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-[11px] font-semibold transition shrink-0"
                  title="Watch Zaara Travels Videos on YouTube"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  <span>Youtube</span>
                </a>

                {/* GETYOURGUIDE */}
                <a
                  href="https://getyourguide.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-950/60 hover:bg-orange-900/80 text-orange-300 border border-orange-800/60 text-[11px] font-semibold transition shrink-0"
                  title="Verified Tours on GetYourGuide"
                >
                  <span className="text-xs">🎫</span>
                  <span>GETYOURGUIDE</span>
                </a>

                {/* TripAdvisor */}
                <a
                  href="https://tripadvisor.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[11px] font-semibold transition shrink-0"
                  title="Read Reviews on TripAdvisor"
                >
                  <span className="text-xs">🦉</span>
                  <span>Tripadvisor</span>
                </a>
              </div>
            </div>
          </div>

          {/* Popular Destinations */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Popular Circuits</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={() => { setActiveTab('golden-triangle'); window.scrollTo(0,0); }} className="hover:text-amber-400 transition">
                  Golden Triangle (6 Days)
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('same-day'); window.scrollTo(0,0); }} className="hover:text-amber-400 transition">
                  Taj Mahal Sunrise Express
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('tiger-safari'); window.scrollTo(0,0); }} className="hover:text-amber-400 transition">
                  Ranthambore Tiger Reserve
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('packages'); window.scrollTo(0,0); }} className="hover:text-amber-400 transition">
                  Jaipur Pink City Heritage
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('packages'); window.scrollTo(0,0); }} className="hover:text-amber-400 transition">
                  Haridwar & Rishikesh Ganges
                </button>
              </li>
            </ul>
          </div>

          {/* Services Offered */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Services Offered</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Private India Tour Packages</li>
              <li>Golden Triangle Tours</li>
              <li>Ranthambore Tiger Safaris</li>
              <li>Airport Pickup & Drop-off</li>
              <li>
                <button onClick={() => { setActiveTab('fleet'); window.scrollTo(0,0); }} className="hover:text-amber-400 text-sky-400 font-semibold transition">
                  Private Car & Chauffeur
                </button>
              </li>
              <li>Licensed Tour Guides</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4 tracking-wider uppercase">Contact Office</h5>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Direct / WhatsApp:</div>
                  <a href="https://wa.me/919933992786" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">
                    +91 99339 92786
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Email Us:</div>
                  <a href="mailto:info@zaaratravel.com" className="text-sky-300 hover:underline">
                    info@zaaratravel.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Official Website:</div>
                  <span className="text-slate-400">www.zaaratravel.com</span>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                onClick={onOpenAIPlanner}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold py-2 px-3 rounded-lg text-xs transition"
              >
                ✨ Customize with AI
              </button>
            </div>
          </div>
        </div>

        {/* Global Languages Section at Footer Bottom */}
        <div className="py-6 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Globe className="w-4 h-4 text-sky-400" />
              <span>Select Website Language:</span>
            </div>
            <span className="text-[11px] text-slate-500">Auto-translates all tour details, prices & itineraries</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs">
            {[
              { code: 'en', name: 'English', flag: '🇺🇸' },
              { code: 'hi', name: 'हिंदी (Hindi)', flag: '🇮🇳' },
              { code: 'fr', name: 'Français (French)', flag: '🇫🇷' },
              { code: 'de', name: 'Deutsch (German)', flag: '🇩🇪' },
              { code: 'es', name: 'Español (Spanish)', flag: '🇪🇸' },
              { code: 'ja', name: '日本語 (Japanese)', flag: '🇯🇵' },
              { code: 'it', name: 'Italiano (Italian)', flag: '🇮🇹' },
              { code: 'ru', name: 'Русский (Russian)', flag: '🇷🇺' },
              { code: 'ar', name: 'العربية (Arabic)', flag: '🇸🇦' },
              { code: 'zh-CN', name: '中文 (Chinese)', flag: '🇨🇳' },
              { code: 'ko', name: '한국어 (Korean)', flag: '🇰🇷' },
              { code: 'pt', name: 'Português (Portuguese)', flag: '🇵🇹' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  const domain = window.location.hostname;
                  const cookieValue = `/en/${lang.code}`;
                  document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
                  document.cookie = `googtrans=${cookieValue}; path=/;`;
                  const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
                  if (selectElem) {
                    selectElem.value = lang.code;
                    selectElem.dispatchEvent(new Event('change'));
                  } else {
                    window.location.reload();
                  }
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition text-left"
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="text-[11px] font-semibold truncate">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Rights & GST */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} <strong>Zaara Travels</strong>. All rights reserved.
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <a
              href="https://paypal.me/JahangirHussain958"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-indigo-950 text-indigo-200 border border-indigo-800 px-2.5 py-1 rounded-md text-[11px] font-bold hover:text-white hover:border-indigo-600 transition"
            >
              <span>💳 PayPal: paypal.me/JahangirHussain958</span>
            </a>
            <span>•</span>
            <span>GSTIN: 19ACUPH2897Q2ZA</span>
            <span>•</span>
            <button onClick={() => { setActiveTab('contact'); window.scrollTo(0,0); }} className="hover:text-slate-300">
              Terms & Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
