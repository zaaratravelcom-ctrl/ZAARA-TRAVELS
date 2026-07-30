import React, { useState } from 'react';
import { X, Sparkles, Send, MessageSquare, ShieldCheck, MapPin, Calendar, Clock, Car, CheckCircle } from 'lucide-react';
import { CustomItineraryResult } from '../types';
import { CurrencyCode } from '../utils/currencyConverter';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: CurrencyCode;
  onAddCustomBooking?: (booking: any) => void;
}

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  currency,
  onAddCustomBooking,
}) => {
  if (!isOpen) return null;

  const [destinations, setDestinations] = useState('Delhi, Agra, Jaipur & Ranthambore');
  const [duration, setDuration] = useState('6');
  const [travelers, setTravelers] = useState('2');
  const [travelType, setTravelType] = useState('Private Tour with Car & Driver');
  const [interests, setInterests] = useState('Taj Mahal, Tiger Safari, Heritage Forts & Local Foods');
  const [budget, setBudget] = useState('Luxury 4-Star & 5-Star');
  const [specialRequests, setSpecialRequests] = useState('Prefer early morning sunrise at Taj Mahal and open jeep safari');

  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<CustomItineraryResult | null>(null);

  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAiResult(null);

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
        setAiResult(data);
      } else {
        alert('Could not generate AI itinerary. Please try again or chat with Zaara Travels directly on WhatsApp.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to Zaara Travels AI server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendToWhatsApp = () => {
    if (!aiResult) return;
    const text = `*Custom Tour Request - Zaara Travels AI*
*Title:* ${aiResult.itineraryTitle}
*Destinations:* ${destinations}
*Duration:* ${duration} Days (${travelers} Travelers)
*Estimated Price:* ${aiResult.estimatedPriceRange}

Hello Zaara Travels, I generated this custom travel plan on your website. Please send me the final price quote and driver availability!`;

    window.open(`https://wa.me/919933992786?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6 flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
              <Sparkles className="w-4 h-4 fill-amber-400" /> Gemini 3.6 AI Tour Customizer
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Create Your Custom India Dream Tour
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Personalized day-by-day itinerary with Zaara Travels private vehicle & driver.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {!aiResult ? (
            <form onSubmit={handleGenerateItinerary} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destinations You Wish to Visit *
                  </label>
                  <input
                    type="text"
                    required
                    value={destinations}
                    onChange={(e) => setDestinations(e.target.value)}
                    placeholder="e.g. Delhi, Agra, Jaipur, Varanasi, Ranthambore"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Number of Guests *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Accommodation / Comfort Style
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Luxury 5-Star (Oberoi, Taj, Leela)">Luxury 5-Star (Oberoi, Taj, Leela)</option>
                    <option value="4-Star Heritage Haveli & Boutique Resorts">4-Star Heritage Haveli & Boutique Resorts</option>
                    <option value="Comfort 3-Star Deluxe">Comfort 3-Star Deluxe</option>
                    <option value="Transport & Driver Only">Transport & Driver Only (No Hotel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Interests & Activities
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Wildlife Tiger Safari, Taj Mahal Sunrise, Culinary Food Walk, Yoga"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Notes / Accessibility / Flight Times
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. Need airport pickup at midnight, elderly guest requiring minimal stair climbs"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black py-3.5 rounded-xl shadow-md transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Gemini AI is crafting your private tour...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-slate-950" />
                    <span>Generate Private AI Itinerary</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* AI Results View */
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-5 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Generated by Zaara AI</span>
                  <span className="text-xs font-bold bg-sky-600 px-2.5 py-0.5 rounded text-white">Recommended Vehicle: {aiResult.recommendedVehicle}</span>
                </div>

                <h3 className="text-xl font-black text-white">{aiResult.itineraryTitle}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{aiResult.overview}</p>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Estimated Price Range:</span>
                  <span className="text-amber-400 font-extrabold text-sm">{aiResult.estimatedPriceRange}</span>
                </div>
              </div>

              {/* Day-by-Day List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">Day-by-Day Travel Plan</h4>
                {(aiResult.days || []).map((d) => (
                  <div key={d.day} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold bg-sky-600 text-white px-2 py-0.5 rounded">
                        Day {d.day}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">📍 {d.stayLocation}</span>
                    </div>
                    <h5 className="font-bold text-slate-900 text-sm">{d.title}</h5>
                    <ul className="space-y-1 text-xs text-slate-700">
                      {(d.activities || []).map((act, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                    {d.insiderTip && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 italic">
                        💡 <strong>Zaara Travels Tip:</strong> {d.insiderTip}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Inclusions */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Included In This Custom Quotation</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {(aiResult.includedServices || []).map((srv, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setAiResult(null)}
                  className="flex-1 border border-slate-300 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  ← Edit Specifications
                </button>

                <button
                  onClick={handleSendToWhatsApp}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Get Official Quote on WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
