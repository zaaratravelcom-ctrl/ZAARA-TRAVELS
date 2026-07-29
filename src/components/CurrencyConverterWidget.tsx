import React, { useState, useEffect } from 'react';
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  FALLBACK_RATES_FROM_USD,
  fetchLiveExchangeRates,
  formatConvertedPrice,
} from '../utils/currencyConverter';
import {
  DollarSign,
  RefreshCw,
  Sparkles,
  ArrowRightLeft,
  X,
  ChevronDown,
  Info,
  Globe,
  Calculator,
  CheckCircle2,
} from 'lucide-react';

interface CurrencyConverterWidgetProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (code: CurrencyCode) => void;
  rates: Record<CurrencyCode, number>;
  setRates: (rates: Record<CurrencyCode, number>) => void;
}

export const CurrencyConverterWidget: React.FC<CurrencyConverterWidgetProps> = ({
  currentCurrency,
  onCurrencyChange,
  rates,
  setRates,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [calcAmountUSD, setCalcAmountUSD] = useState<number>(250); // Default tour price sample
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRates = async () => {
    setIsRefreshing(true);
    const result = await fetchLiveExchangeRates();
    setRates(result.rates);
    setIsLive(result.isLive);
    setLastUpdated(result.lastUpdated);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadRates();
  }, []);

  const selectedCurrencyObj =
    SUPPORTED_CURRENCIES.find((c) => c.code === currentCurrency) || SUPPORTED_CURRENCIES[0];

  return (
    <div className="relative inline-block">
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-sm"
        title="Open Live Currency Converter Helper"
      >
        <span className="text-base leading-none">{selectedCurrencyObj.flag}</span>
        <span className="text-amber-400 font-extrabold">{selectedCurrencyObj.symbol} {selectedCurrencyObj.code}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Popover Drawer / Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in text-xs">
          {/* Header */}
          <div className="bg-slate-900 text-white p-3.5 px-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="font-extrabold text-sm">Real-Time Currency Helper</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadRates}
                disabled={isRefreshing}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Refresh Live Exchange Rates"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Active Display Currency Selection */}
            <div>
              <div className="font-extrabold text-slate-800 mb-2 flex items-center justify-between">
                <span>Select Display Currency:</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {isLive ? 'Live Market API' : 'Cached Rates'} ({lastUpdated})
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {SUPPORTED_CURRENCIES.map((c) => {
                  const isSelected = currentCurrency === c.code;
                  return (
                    <button
                      key={c.code}
                      onClick={() => {
                        onCurrencyChange(c.code);
                      }}
                      className={`p-2 rounded-xl border text-left flex flex-col items-start transition ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-base">{c.flag}</span>
                        <span className="text-[10px] uppercase font-black">{c.symbol}</span>
                      </div>
                      <span className="text-xs font-black mt-1">{c.code}</span>
                      <span className="text-[9px] opacity-80 truncate w-full">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Currency Converter Calculator */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-3 border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold">
                <Calculator className="w-4 h-4" />
                <span>Custom Price Calculator</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">USD Amount:</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    value={calcAmountUSD}
                    onChange={(e) => setCalcAmountUSD(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-6 pr-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Calculated Results Table */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                {SUPPORTED_CURRENCIES.filter((c) => c.code !== 'USD').map((c) => {
                  const converted = calcAmountUSD * (rates[c.code] || FALLBACK_RATES_FROM_USD[c.code] || 1);
                  return (
                    <div key={c.code} className="bg-slate-800/80 p-2 rounded-xl flex items-center justify-between border border-slate-700">
                      <span className="text-slate-300 font-medium flex items-center gap-1">
                        <span>{c.flag}</span>
                        <span>{c.code}:</span>
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {c.symbol}{Math.round(converted).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Exchange Rate Reference Table */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-sky-600" /> Live USD Exchange Rates (Approx)
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500">
                <div>1 USD = <strong className="text-slate-800">₹{rates.INR.toFixed(2)} INR</strong></div>
                <div>1 USD = <strong className="text-slate-800">€{rates.EUR.toFixed(2)} EUR</strong></div>
                <div>1 USD = <strong className="text-slate-800">£{rates.GBP.toFixed(2)} GBP</strong></div>
                <div>1 USD = <strong className="text-slate-800">¥{rates.JPY.toFixed(0)} JPY</strong></div>
                <div>1 USD = <strong className="text-slate-800">A${rates.AUD.toFixed(2)} AUD</strong></div>
                <div>1 USD = <strong className="text-slate-800">C${rates.CAD.toFixed(2)} CAD</strong></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 px-4 text-[10px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
            <span>Rates updated via OpenExchange API</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sky-700 font-bold hover:underline"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
