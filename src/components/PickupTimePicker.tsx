import React, { useState } from 'react';
import { Clock, Check, ChevronDown, Sparkles, Sun, Moon, Sunrise, Sunset, X } from 'lucide-react';

interface PickupTimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

const PRESET_TIMES = [
  { time: '05:00 AM', label: 'Sunrise & Early Departure', icon: '🌅', tag: 'Taj Sunrise Special' },
  { time: '05:30 AM', label: 'Early Express Drive', icon: '⚡', tag: 'Fast Highway Transit' },
  { time: '06:00 AM', label: 'Recommended Standard', icon: '🚗', tag: 'Most Popular' },
  { time: '06:30 AM', label: 'Morning Departure', icon: '☀️', tag: 'Smooth Traffic' },
  { time: '07:00 AM', label: 'Standard Morning', icon: '🏙️', tag: 'Hotel Breakfast Ready' },
  { time: '08:00 AM', label: 'Late Morning', icon: '🍳', tag: 'Post Breakfast' },
  { time: '09:00 AM', label: 'City Sightseeing', icon: '🏛️', tag: 'Delhi / Agra Local' },
  { time: '10:00 AM', label: 'Mid-Morning', icon: '☕', tag: 'Relaxed Departure' },
  { time: '02:00 PM', label: 'Afternoon Departure', icon: '🌆', tag: 'Half-Day / Evening' },
];

export const PickupTimePicker: React.FC<PickupTimePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Parse current value or fallback
  const parseTime = (str: string) => {
    const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      return {
        hour: match[1].padStart(2, '0'),
        minute: match[2],
        period: match[3].toUpperCase(),
      };
    }
    return { hour: '06', minute: '00', period: 'AM' };
  };

  const currentParsed = parseTime(value);
  const [customHour, setCustomHour] = useState<string>(currentParsed.hour);
  const [customMinute, setCustomMinute] = useState<string>(currentParsed.minute);
  const [customPeriod, setCustomPeriod] = useState<string>(currentParsed.period);

  const handleApplyCustomTime = (h = customHour, m = customMinute, p = customPeriod) => {
    const formatted = `${h.padStart(2, '0')}:${m} ${p}`;
    onChange(formatted);
    setIsOpen(false);
  };

  // Convert "06:00 AM" to "06:00" for native input[type="time"]
  const getNative24hValue = (str: string) => {
    const { hour, minute, period } = parseTime(str);
    let h = parseInt(hour, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${minute}`;
  };

  // Handle native time input change
  const handleNativeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "14:30"
    if (!val) return;
    const [hStr, mStr] = val.split(':');
    let h = parseInt(hStr, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    const formatted = `${String(h).padStart(2, '0')}:${mStr} ${period}`;
    onChange(formatted);
  };

  return (
    <div className="relative space-y-2">
      {/* Main Selected Input Trigger Bar */}
      <div className="flex items-center gap-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 bg-slate-50 hover:bg-sky-50/50 border border-slate-300 hover:border-sky-400 rounded-xl px-3.5 py-2.5 cursor-pointer transition flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center font-bold shrink-0 group-hover:scale-105 transition">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Pickup Time
              </div>
              <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                <span>{value || '06:00 AM'}</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Confirmed Slot
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sky-600 font-bold text-xs group-hover:translate-x-0.5 transition">
            <span>Choose</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Native Mobile / Desktop HTML Time Input Quick Icon Trigger */}
        <div className="relative shrink-0">
          <input
            type="time"
            value={getNative24hValue(value)}
            onChange={handleNativeTimeChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            title="Click to open system time clock"
          />
          <button
            type="button"
            className="w-11 h-11 bg-slate-100 hover:bg-amber-100 border border-slate-300 text-slate-700 hover:text-amber-700 rounded-xl flex items-center justify-center transition shadow-sm"
            title="Open System Clock Picker"
          >
            <Clock className="w-5 h-5 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Popover Selector Modal / Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl p-4 space-y-4 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white">Select Preferred Pickup Time</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Preset Slots */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
              <span>Popular Tour Pickup Slots:</span>
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-amber-400 hover:underline capitalize"
              >
                {isCustomMode ? '← Back to Presets' : 'Custom Time Picker 🕒'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {PRESET_TIMES.map((preset) => {
                  const isSelected = value === preset.time;
                  return (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => {
                        onChange(preset.time);
                        setIsOpen(false);
                      }}
                      className={`p-2 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-950 border-sky-500 text-white ring-2 ring-sky-500/40 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{preset.icon}</span>
                        <div className="truncate">
                          <div className="font-bold flex items-center gap-1.5">
                            <span>{preset.time}</span>
                            <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                              {preset.tag}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">{preset.label}</div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom Time Dial / Wheels */
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="text-xs text-slate-300 font-semibold text-center">
                  Pick Hour, Minute & Period (AM/PM):
                </div>

                <div className="flex items-center justify-center gap-2">
                  {/* Hours */}
                  <select
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white font-extrabold text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <span className="text-xl font-bold text-slate-400">:</span>

                  {/* Minutes */}
                  <select
                    value={customMinute}
                    onChange={(e) => setCustomMinute(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white font-extrabold text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {['00', '15', '30', '45'].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* Period */}
                  <div className="flex rounded-lg overflow-hidden border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCustomPeriod('AM')}
                      className={`px-3 py-2 text-xs font-black transition ${
                        customPeriod === 'AM' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomPeriod('PM')}
                      className={`px-3 py-2 text-xs font-black transition ${
                        customPeriod === 'PM' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyCustomTime()}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition shadow"
                >
                  Set {customHour}:{customMinute} {customPeriod} ✓
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>📍 Doorstep Chauffeur Pick-up</span>
            <span className="text-amber-400 font-semibold">Placard Arrival 10m Prior</span>
          </div>
        </div>
      )}
    </div>
  );
};
