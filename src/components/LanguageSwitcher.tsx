import React, { useEffect, useState } from 'react';
import { Globe, Check, ChevronUp, ChevronDown, Sparkles, Languages } from 'lucide-react';

export interface LanguageOption {
  code: string; // ISO language code for Google Translate
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
];

export const LanguageSwitcherBottom: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<string>('en');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Initialize Google Translate Script
  useEffect(() => {
    // Check if script already exists
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi,fr,de,es,ja,it,ru,ar,zh-CN,ko,pt',
              autoDisplay: false,
            },
            'google_translate_element'
          );
          setIsLoaded(true);
        }
      };

      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }

    // Check for existing cookie or saved state
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setSelectedLang(match[1]);
    }
  }, []);

  const changeLanguage = (langCode: string) => {
    setSelectedLang(langCode);

    // Set Google Translate Cookie
    const domain = window.location.hostname;
    const cookieValue = `/en/${langCode}`;

    document.cookie = `googtrans=${cookieValue}; path=/; domain=${domain}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;

    // Trigger select element in Google Translate widget if present
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      // Reload page to apply translation if cookie set
      window.location.reload();
    }

    setIsExpanded(false);
  };

  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Hidden container for Google Translate default widget */}
      <div id="google_translate_element" className="hidden"></div>

      {/* Fixed Bottom Language Switcher Bar at Bottom-Left */}
      <div className="fixed bottom-4 left-4 sm:left-6 z-40 max-w-xs sm:max-w-md animate-fade-in">
        {/* Expanded Drawer / Dropdown Panel */}
        {isExpanded && (
          <div className="mb-2 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-amber-400" />
                <span className="font-extrabold text-xs tracking-wide">Select Your Language</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto pr-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                        : 'bg-slate-800/80 border-slate-700/60 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="truncate">
                        <div className="text-xs font-bold leading-tight truncate">{lang.nativeName}</div>
                        <div className="text-[10px] opacity-75 truncate">{lang.name}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto-translates entire website</span>
              <span className="text-amber-400 font-bold">12 Languages</span>
            </div>
          </div>
        )}

        {/* Floating Bar Button at the bottom */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between gap-3 bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-xl backdrop-blur-md transition group"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{activeLangObj.flag}</span>
            <div className="text-left">
              <div className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                <span>{activeLangObj.nativeName}</span>
                <span className="text-[10px] text-slate-400 font-normal">({activeLangObj.name})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-300 group-hover:text-amber-400">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Change</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>
    </>
  );
};

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}
