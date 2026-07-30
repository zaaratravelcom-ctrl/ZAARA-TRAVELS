import React, { useState } from 'react';
import { X, Sparkles, MapPin, Calendar, Users, Compass, DollarSign, MessageSquare, CheckCircle, RefreshCw, Send, ArrowRight } from 'lucide-react';
import { CustomItineraryResult } from '../types';

interface AICustomItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICustomItineraryModal: React.FC<AICustomItineraryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [destinations, setDestinations] = useState('Delhi, Agra, Jaipur & Ranthambore Safari');
  const [duration, setDuration] = useState('6');
  const [travelers, setTravelers] = useState('2');
  const [travelType, setTravelType] = useState('Private Tour with Car & Chauffeur');
  const [interests, setInterests] = useState('Taj Mahal Sunrise, Bengal Tigers, Royal Palaces, Local Handicrafts');
  const [budget, setBudget] = useState('Comfort / Luxury');
  const [specialRequests, setSpecialRequests] = useState('English speaking local guide and air-conditioned Innova Crysta.');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CustomItineraryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const response = await fetch('/api/custom-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations,
          duration,
          travelers: parseInt(travelers) || 2,
          travelType,
          interests,
          budget,
          specialRequests,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setErrorMsg('Could not generate AI plan. Please try again or chat with Zaara Travels directly on WhatsApp.');
      }
    } catch (err) {
      console.error('Error fetching AI custom itinerary:', err);
      setErrorMsg('Network error while connecting to AI Engine. Please contact Zaara Travels directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-bold shadow-md">
              <Sparkles className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                AI Custom India Tour Planner
              </h2>
              <p className="text-xs text-sky-300 font-medium">
                Tailored in seconds by Zaara Travels Gemini AI Engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {!result ? (
            /* Input Form */
            <form onSubmit={handleGenerateItinerary} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" /> Preferred Cities / Regions
                  </label>
                  <input
                    type="text"
                    required
                    value={destinations}
                    onChange={(e) => setDestinations(e.target.value)}
                    placeholder="e.g. Delhi, Agra, Jaipur, Udaipur, Varanasi"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> Tour Duration (Days)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((d) => (
                      <option key={d} value={d}>
                        {d} {d === 1 ? 'Day Tour' : 'Days Tour'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-sky-600" /> Number of Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-sky-600" /> Budget & Comfort Level
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Comfort Deluxe">Comfort Deluxe (3/4-Star Hotels + Sedan/SUV)</option>
                    <option value="Royal Luxury Palace">Royal Luxury Palace (5-Star Heritage + Innova Crysta)</option>
                    <option value="Budget Smart Travel">Budget Smart Travel (Clean Hotels + Private Driver)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-sky-600" /> Key Interests & Highlights
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Taj Mahal Sunrise, Wildlife Safaris, Heritage Food, Shopping"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes or Requirements
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Elderly travelers, vegetarian food preference, airport pickup at 2 AM"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {errorMsg && (
                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 px-6 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Gemini AI is crafting your day-by-day plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Custom Itinerary Instantly</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* AI Results View */
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-2">
                <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  AI Custom Itinerary
                </span>
                <h3 className="text-xl font-black text-white">{result.itineraryTitle}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{result.overview}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400">Recommended Vehicle:</span>{' '}
                    <strong className="text-amber-400">{result.recommendedVehicle}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Est. Price Range:</span>{' '}
                    <strong className="text-sky-400">{result.estimatedPriceRange}</strong>
                  </div>
                </div>
              </div>

              {/* Day-by-Day Cards */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-sm">Day-by-Day Plan:</h4>
                {result.days.map((day) => (
                  <div key={day.day} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs flex items-center justify-center font-black">
                          {day.day}
                        </span>
                        {day.title}
                      </span>
                      <span className="text-xs bg-white text-slate-600 px-2.5 py-1 rounded-md border font-semibold">
                        📍 {day.stayLocation}
                      </span>
                    </div>

                    <ul className="text-xs text-slate-600 space-y-1 pl-8 list-disc">
                      {day.activities.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>

                    {day.insiderTip && (
                      <div className="mt-2 text-[11px] bg-sky-50 text-sky-800 p-2 rounded-lg font-medium border border-sky-100">
                        💡 <strong>Zaara Travels Insider Tip:</strong> {day.insiderTip}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Modify Inputs</span>
                </button>

                <a
                  href={`https://wa.me/919933992786?text=${encodeURIComponent(
                    `Hello Zaara Travels, I generated an AI Custom Itinerary on your website: "${result.itineraryTitle}" (${duration} Days, ${travelers} guests). Please send me your best final price quote!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 px-5 rounded-xl shadow-lg transition text-xs flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Get Official Quote on WhatsApp (+91 99339 92786)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
