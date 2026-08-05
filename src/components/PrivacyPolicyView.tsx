import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowLeft, Phone, Mail, Globe } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onNavigate?: (tab: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
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
        </div>

        {/* Hero Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Protection & Privacy Commitment</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              At <strong>Zaara Travels</strong>, we respect your privacy and are committed to protecting all personal information you share with us during tour inquiries, cab reservations, and payment processing.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800/80">
              <span>Last Updated: January 2026</span>
              <span>•</span>
              <span>Official GSTIN: 19ACUPH2897Q2ZA</span>
              <span>•</span>
              <span className="text-sky-400 font-bold">Encrypted & Secure</span>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-500" />
              <span>1. Information We Collect</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When you submit a tour inquiry, book a private cab, or request a custom itinerary, we collect necessary details such as your Full Name, Email Address, Phone/WhatsApp Number, Preferred Pickup Location, Flight/Train details, and Travel Dates.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              <span>2. How We Use Your Information</span>
            </h2>
            <ul className="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1.5">
              <li>To issue official booking vouchers, GST invoices, and driver details for your trip.</li>
              <li>To contact you via WhatsApp or Email regarding pickup schedules, flight status tracking, or emergency travel assistance.</li>
              <li>To comply with legal obligations, hotel registration policies, and Government of India tourist security mandates.</li>
            </ul>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>3. Data Protection & Security</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We do NOT sell, rent, or trade your personal data to third-party marketers. Payment transactions conducted on our site utilize SSL-encrypted payment gateways (PayU, PayPal, Razorpay) compliant with PCI-DSS banking security standards.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>4. Contact Our Privacy Desk</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If you have any questions about our privacy policy or wish to update/delete your stored contact details, please contact us at:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 text-slate-700 font-medium border border-slate-200">
              <div><strong>Zaara Travels Privacy Office</strong></div>
              <div>Address: Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031</div>
              <div>Email: <a href="mailto:info@zaaratravel.com" className="text-sky-600 hover:underline">info@zaaratravel.com</a></div>
              <div>WhatsApp: +91 99339 92786</div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
