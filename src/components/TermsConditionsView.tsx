import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  Clock, 
  Car, 
  Compass, 
  Phone, 
  Mail, 
  ArrowLeft,
  Printer,
  ChevronDown,
  ChevronUp,
  UserCheck,
  User,
  FolderCheck,
  RefreshCw,
  Heart
} from 'lucide-react';

interface TermsConditionsViewProps {
  onNavigate?: (tab: string) => void;
}

export const TermsConditionsView: React.FC<TermsConditionsViewProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<string>('all');
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const sections = [
    {
      id: 'booking',
      title: '1. Booking Confirmation',
      icon: <CheckCircle2 className="w-5 h-5 text-amber-500" />,
      bullets: [
        'A booking is considered confirmed only after receiving the required payment or confirmation approval.',
        'Customers will receive booking confirmation details through email or WhatsApp.',
        'Please verify all travel details at the time of booking.'
      ]
    },
    {
      id: 'payments',
      title: '2. Payment Terms',
      icon: <CreditCard className="w-5 h-5 text-sky-500" />,
      bullets: [
        'Payment terms depend on the selected service and payment option.',
        'Online payments must be successfully verified before the booking is confirmed.',
        'Any pending balance amount must be paid according to the agreed payment schedule.',
        'Applicable taxes, including Goods & Services Tax (GST), will be charged as per government regulations.'
      ]
    },
    {
      id: 'cancellation',
      title: '3. Cancellation & Refund Policy',
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      bullets: [
        'Cancellation charges depend on the cancellation date and service booked.',
        'Some services, including safari tickets, attraction tickets, hotels, and special activities, may be non-refundable.',
        'Refunds (if applicable) will be processed after deducting applicable charges.'
      ]
    },
    {
      id: 'tours',
      title: '4. Tour Services',
      icon: <Compass className="w-5 h-5 text-indigo-500" />,
      bullets: [
        'Tour itineraries may be adjusted due to weather conditions, traffic, government regulations, or unforeseen circumstances.',
        'Zaara Travels will make reasonable efforts to provide the services mentioned in the booking confirmation.',
        'Entry tickets, activities, and special services are subject to availability.'
      ]
    },
    {
      id: 'cabs',
      title: '5. Cab Rental Services',
      icon: <Car className="w-5 h-5 text-purple-500" />,
      bullets: [
        'Vehicle availability is subject to confirmation.',
        'The vehicle provided will be as per the selected category or equivalent.',
        'Additional usage beyond the agreed package, extra kilometers, parking, entry fees, and additional charges will be payable by the customer.',
        'Customers are responsible for personal belongings during the journey.'
      ]
    },
    {
      id: 'responsibilities',
      title: '6. Customer Responsibilities',
      icon: <UserCheck className="w-5 h-5 text-blue-500" />,
      intro: 'Customers must:',
      bullets: [
        'Provide correct booking information.',
        'Carry valid identification documents where required.',
        'Follow local rules and regulations.',
        'Respect driver, guide, hotel, and service staff.'
      ]
    },
    {
      id: 'drivers',
      title: '7. Driver & Guide Services',
      icon: <User className="w-5 h-5 text-teal-500" />,
      bullets: [
        'Zaara Travels provides professional drivers and experienced local guides.',
        'Driver and guide availability depends on the selected package and language requirements.',
        'Any inappropriate behavior towards staff may result in service termination without refund.'
      ]
    },
    {
      id: 'documents',
      title: '8. Travel Documents',
      icon: <FolderCheck className="w-5 h-5 text-amber-600" />,
      bullets: [
        'Guests must carry valid passports, ID proof, permits, and required travel documents.',
        'Zaara Travels is not responsible for issues caused by missing or invalid documents.'
      ]
    },
    {
      id: 'liability',
      title: '9. Liability',
      icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
      bullets: [
        'Zaara Travels is not responsible for delays, cancellations, weather conditions, natural events, government restrictions, or circumstances beyond our control.',
        'We always try to provide a safe and comfortable travel experience.'
      ]
    },
    {
      id: 'privacy',
      title: '10. Privacy Policy',
      icon: <ShieldCheck className="w-5 h-5 text-sky-600" />,
      bullets: [
        'Customer information is used only for booking management, communication, and service improvement.',
        'We do not sell or share customer information with unauthorized parties.'
      ]
    },
    {
      id: 'changes',
      title: '11. Changes to Terms',
      icon: <RefreshCw className="w-5 h-5 text-slate-700" />,
      bullets: [
        'Zaara Travels reserves the right to update these terms and conditions when required. Updated terms will apply to future bookings.'
      ]
    }
  ];

  const filteredSections = activeSection === 'all' 
    ? sections 
    : sections.filter(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate ? onNavigate('home') : window.scrollTo(0, 0)}
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition border border-amber-200/60 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Terms</span>
          </button>
        </div>

        {/* Hero Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Welcome to Zaara Travels</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Terms & Conditions
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Thank you for choosing <strong>Zaara Travels</strong>. We provide private tours, cab rentals, and customized travel experiences across India. By booking our services, you agree to the following terms and conditions.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
              <span>Private Tours</span>
              <span>•</span>
              <span>Cab Rental</span>
              <span>•</span>
              <span>Customized Travel Experiences</span>
            </div>
          </div>
        </div>

        {/* Filter / Quick Jump Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Sections
          </button>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sec.title.split('.')[1] || sec.title}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-4">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                    {sec.icon}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {sec.title}
                  </h2>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 text-slate-700 text-xs sm:text-sm leading-relaxed space-y-2">
                {sec.intro && <p className="font-semibold text-slate-900">{sec.intro}</p>}
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  {sec.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Us Footer Section */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-xl font-black text-amber-400">Contact Us</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Zaara Travels — Private Tours | Cab Rental | Customized Travel Experiences
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-3.5 py-2 rounded-xl border border-amber-500/20">
              <Heart className="w-4 h-4 fill-amber-400" />
              <span>Your Journey, Our Passion.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[11px]">Email Support</div>
                <a href="mailto:info@zaaratravel.com" className="text-amber-400 font-bold hover:underline">
                  info@zaaratravel.com
                </a>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold text-[11px]">Phone & WhatsApp Desk</div>
                <div className="text-white font-bold space-x-2">
                  <a href="https://wa.me/919933992786" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
                    +91 99339 92786
                  </a>
                  <span className="text-slate-600">/</span>
                  <a href="https://wa.me/919932999786" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition">
                    +91 99329 99786
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

