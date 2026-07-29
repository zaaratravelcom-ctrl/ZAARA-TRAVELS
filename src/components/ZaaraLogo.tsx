import React from 'react';

interface ZaaraLogoProps {
  className?: string;
  showWebsite?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const ZaaraLogo: React.FC<ZaaraLogoProps> = ({
  className = '',
  showWebsite = true,
  size = 'md',
  variant = 'light',
}) => {
  const isDark = variant === 'dark';

  const textSizeClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const regSizeClasses = {
    sm: 'text-[9px] sm:text-[10px] -top-1.5',
    md: 'text-[10px] sm:text-[11px] -top-2',
    lg: 'text-[11px] sm:text-[12px] -top-2.5',
  };

  const urlSizeClasses = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[9px] sm:text-[10px] tracking-[0.25em]',
    lg: 'text-[11px] tracking-[0.3em]',
  };

  return (
    <div className={`flex flex-col items-start justify-center select-none font-sans ${className}`}>
      <div className={`flex items-baseline gap-1 font-black tracking-tight leading-none ${textSizeClasses[size]}`}>
        <span className={isDark ? 'text-sky-400 font-black' : 'text-sky-600 font-black'}>
          Zaara
        </span>
        <span className="text-red-600 font-black relative inline-flex items-baseline">
          <span>Travels</span>
          <sup
            className={`font-black text-red-600 ml-0.5 relative select-none ${regSizeClasses[size]}`}
            title="Registered Trademark"
          >
            ®
          </sup>
        </span>
      </div>

      {showWebsite && (
        <span
          className={`font-bold uppercase mt-0.5 ${urlSizeClasses[size]} ${
            isDark ? 'text-sky-300' : 'text-sky-600'
          }`}
        >
          www.zaaratravel.com
        </span>
      )}
    </div>
  );
};

export default ZaaraLogo;

