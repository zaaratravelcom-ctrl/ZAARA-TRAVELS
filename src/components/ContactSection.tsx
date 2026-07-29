import React, { useState } from 'react';
import { Phone, Mail, MapPin, Globe, MessageSquare, ShieldCheck, UserCheck, Send, CheckCircle2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tourName, setTourName] = useState('General Tour Inquiry');
  const [travelers, setTravelers] = useState('2');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const waMessage = encodeURIComponent(
    `Hello Zaara Travels,\nMy Name: ${name || 'Guest'}\nPhone: ${phone}\nTour Inquiry: ${tourName}\nGuests: ${travelers}\nNotes: ${notes || 'Looking for tour details'}`
  );

  return (
    <section className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="bg-sky-100 text-sky-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
            Official Travel Desk
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Contact Zaara Travels
          </h2>
          <p className="text-sm text-slate-600">
            Have questions about your upcoming trip to India? Get in touch directly with Zaara Travels for instant custom quotes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-5 border border-slate-800">
              <div className="space-y-1 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-extrabold text-white">Zaara Travels</h3>
                <p className="text-xs text-sky-400 font-semibold">Your Journey, Our Passion.</p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Official Travel Desk</span>
                    <strong className="text-white text-base">Zaara Travels</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Govt. GST Identification Number</span>
                    <strong className="text-emerald-400 font-mono text-sm">19ACUPH2897Q2ZA</strong>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Mobile / WhatsApp 24/7</span>
                    <a href="tel:+919933992786" className="text-white font-black text-base hover:text-amber-400">
                      +91 99339 92786
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Official Email</span>
                    <a href="mailto:info@zaaratravel.com" className="text-white font-medium hover:text-amber-400">
                      info@zaaratravel.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-xs">Official Website</span>
                    <a href="https://www.zaaratravel.com" target="_blank" rel="noopener noreferrer" className="text-white font-medium hover:text-amber-400">
                      www.zaaratravel.com
                    </a>
                  </div>
                </div>
              </div>

              <a
                href="https://wa.me/919933992786"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition shadow-lg"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat on WhatsApp (+91 99339 92786)</span>
              </a>
            </div>
          </div>

          {/* Right: Quick Direct Contact Form */}
          <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            {formSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900">Inquiry Sent Successfully!</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                  Your inquiry has been registered. For immediate confirmation, click below to message Zaara Travels on WhatsApp with your pre-filled details.
                </p>

                <a
                  href={`https://wa.me/919933992786?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-3.5 rounded-xl shadow-lg transition text-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Open WhatsApp Direct Chat</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Send Tour Inquiry</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 890 or +91..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Tour Package</label>
                    <select
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="6-Day Golden Triangle Tour with Ranthambore">6-Day Golden Triangle with Ranthambore</option>
                      <option value="Taj Mahal Sunrise Tour">Taj Mahal Sunrise Tour</option>
                      <option value="Old & New Delhi City Tour">Old & New Delhi City Tour</option>
                      <option value="Jaipur Sightseeing Tour">Jaipur Sightseeing Tour</option>
                      <option value="Mumbai Half-Day City Tour">Mumbai Half-Day City Tour</option>
                      <option value="Haridwar & Rishikesh Day Tour">Haridwar & Rishikesh Day Tour</option>
                      <option value="Custom Private India Tour">Custom Private India Tour</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Notes or Specific Dates</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell us about your preferred travel dates, pickup location, or special requests..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow transition text-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry to Zaara Travels</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
