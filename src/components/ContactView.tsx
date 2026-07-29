import React, { useState } from 'react';
import { Phone, Mail, MapPin, Globe, ShieldCheck, MessageSquare, Send, CheckCircle2, UserCheck } from 'lucide-react';

export const ContactView: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tourName, setTourName] = useState('6-Day Golden Triangle Tour with Ranthambore');
  const [travelers, setTravelers] = useState('2');
  const [notes, setNotes] = useState('');
  const [submittedLink, setSubmittedLink] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const waText = `*Inquiry - Zaara Travels Website*
*Name:* ${name}
*Phone:* ${phone}
*Email:* ${email || 'N/A'}
*Tour Interest:* ${tourName}
*Travelers:* ${travelers}
*Notes:* ${notes || 'None'}

Hello Zaara Travels, please contact me with best price quote!`;

    const link = `https://wa.me/919933992786?text=${encodeURIComponent(waText)}`;
    setSubmittedLink(link);
    window.open(link, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 text-center space-y-3">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
          Govt Registered Operator • GSTIN: 19ACUPH2897Q2ZA
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Contact Zaara Travels</h1>
        <p className="text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Reach out directly to <strong>Zaara Travels</strong> for immediate assistance, custom quotations, and private tour arrangements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Official Contact Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md">
                Z
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Zaara Travels</h3>
                <p className="text-xs text-sky-600 font-semibold">"Your Journey, Our Passion."</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Official Travel Desk</span>
                  <strong className="text-slate-900 text-sm">Zaara Travels</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Mobile & WhatsApp (24/7)</span>
                  <a href="https://wa.me/919933992786" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold hover:underline text-sm">
                    +91 99339 92786
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Email Inquiry</span>
                  <a href="mailto:info@zaaratravel.com" className="text-sky-700 font-bold hover:underline text-sm">
                    info@zaaratravel.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Website</span>
                  <span className="text-slate-800 font-bold text-sm">www.zaaratravel.com</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">GST Registration</span>
                  <strong className="text-slate-900 font-mono text-xs">19ACUPH2897Q2ZA</strong>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1 border-t border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                  💳
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">PayPal for Overseas Guests</span>
                  <a
                    href="https://paypal.me/JahangirHussain958"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-700 font-bold hover:underline text-xs flex items-center gap-1 mt-0.5"
                  >
                    <span>paypal.me/JahangirHussain958</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href="https://wa.me/919933992786?text=Hello%20Zaara%20Travels,%20I%20am%20contacting%20you%20from%20Zaara%20Travels%20website."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat Directly on WhatsApp</span>
              </a>

              <a
                href="https://paypal.me/JahangirHussain958"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-indigo-900 hover:bg-indigo-800 text-amber-300 font-extrabold py-2.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-2 border border-indigo-700"
              >
                <span>💳 Pay via PayPal (paypal.me/JahangirHussain958)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Send a Tour Inquiry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fill in your travel preferences below. You will receive an instant quote from Zaara Travels.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp No. *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210 or +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Tour Package</label>
                  <select
                    value={tourName}
                    onChange={(e) => setTourName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="6-Day Golden Triangle Tour with Ranthambore">6-Day Golden Triangle with Ranthambore</option>
                    <option value="Taj Mahal Sunrise Day Tour">Taj Mahal Sunrise Day Tour from Delhi</option>
                    <option value="Old & New Delhi Sightseeing">Old & New Delhi City Tour</option>
                    <option value="Jaipur Pink City Tour">Jaipur Sightseeing Tour</option>
                    <option value="Mumbai Half-Day City Tour">Mumbai Half-Day City Tour</option>
                    <option value="Haridwar & Rishikesh Day Tour">Haridwar & Rishikesh Day Tour</option>
                    <option value="Custom India Holiday">Customized India Holiday Package</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requests / Dates</label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your preferred arrival date, hotel tier, or specific landmarks you wish to visit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-extrabold py-3.5 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry & Open WhatsApp</span>
              </button>
            </form>

            {submittedLink && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-950">Inquiry Ready!</p>
                <a
                  href={submittedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Click Here if WhatsApp Did Not Open
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
