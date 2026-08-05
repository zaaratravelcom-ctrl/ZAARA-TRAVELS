import React from 'react';
import { Tag } from 'lucide-react';

interface OfferBadgeProps {
  discountPercentage?: number;
  offerTag?: string;
  className?: string;
}

export const getOfferText = (discountPercentage?: number, offerTag?: string): string | null => {
  if (offerTag && offerTag.trim() !== '') {
    const cleanTag = offerTag.trim();
    if (cleanTag.toLowerCase().includes('off')) return cleanTag.toUpperCase();
    return `${cleanTag} OFF`.toUpperCase();
  }
  if (discountPercentage && discountPercentage > 0) {
    return `-${discountPercentage}% OFF`;
  }
  return null;
};

export const OfferBadge: React.FC<OfferBadgeProps> = ({
  discountPercentage,
  offerTag,
  className = '',
}) => {
  const offerText = getOfferText(discountPercentage, offerTag);

  if (!offerText) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-black text-[11px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md border border-blue-400/50 backdrop-blur-sm z-10 transition-transform duration-300 hover:scale-105 select-none ${className}`}
      title={`Special Offer: ${offerText}`}
    >
      <Tag className="w-3.5 h-3.5 text-blue-100 fill-blue-100/30 shrink-0" />
      <span className="tracking-wide uppercase whitespace-nowrap">{offerText}</span>
    </div>
  );
};
