export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';

export interface CurrencyDetails {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyDetails[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦' },
];

export const FALLBACK_RATES_FROM_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 155.0,
  AUD: 1.52,
  CAD: 1.37,
};

let cachedRates: Record<CurrencyCode, number> = { ...FALLBACK_RATES_FROM_USD };
let lastFetchedTime: number | null = null;

export async function fetchLiveExchangeRates(): Promise<{ rates: Record<CurrencyCode, number>; isLive: boolean; lastUpdated: string }> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Failed to fetch live exchange rates');
    const data = await res.json();
    if (data && data.rates) {
      const liveRates: Record<CurrencyCode, number> = {
        USD: 1.0,
        INR: data.rates.INR || FALLBACK_RATES_FROM_USD.INR,
        EUR: data.rates.EUR || FALLBACK_RATES_FROM_USD.EUR,
        GBP: data.rates.GBP || FALLBACK_RATES_FROM_USD.GBP,
        JPY: data.rates.JPY || FALLBACK_RATES_FROM_USD.JPY,
        AUD: data.rates.AUD || FALLBACK_RATES_FROM_USD.AUD,
        CAD: data.rates.CAD || FALLBACK_RATES_FROM_USD.CAD,
      };
      cachedRates = liveRates;
      lastFetchedTime = Date.now();
      return {
        rates: liveRates,
        isLive: true,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
  } catch (e) {
    console.warn('Using static exchange rate cache for currency converter:', e);
  }

  return {
    rates: cachedRates,
    isLive: false,
    lastUpdated: 'Cached Rates',
  };
}

export function formatConvertedPrice(
  usdPrice: number,
  inrPrice: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, number> = FALLBACK_RATES_FROM_USD
): string {
  if (currency === 'INR') {
    return `₹${inrPrice.toLocaleString('en-IN')}`;
  }

  const rate = rates[currency] || FALLBACK_RATES_FROM_USD[currency] || 1.0;
  const convertedAmount = usdPrice * rate;

  const details = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || { symbol: currency };

  if (currency === 'JPY') {
    return `${details.symbol}${Math.round(convertedAmount).toLocaleString()}`;
  }

  return `${details.symbol}${Math.round(convertedAmount).toLocaleString()}`;
}
