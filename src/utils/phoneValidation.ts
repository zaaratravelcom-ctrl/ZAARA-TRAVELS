import React from 'react';

/**
 * Phone Number Validation & Formatting Utility
 * Enforces numeric digits, optional leading '+', and validates mobile number length and series format.
 */

export interface PhoneValidationResult {
  isValid: boolean;
  cleaned: string;
  error?: string;
}

export const sanitizePhoneNumber = (value: string): string => {
  if (!value) return '';
  // Keep only a leading '+' if present at position 0, and numeric digits
  let clean = value.replace(/(?!^\+)[^\d]/g, '');
  // Limit maximum length to 16 chars (+ followed by up to 15 digits)
  if (clean.startsWith('+')) {
    clean = '+' + clean.slice(1, 16).replace(/\+/g, '');
  } else {
    clean = clean.slice(0, 15).replace(/\+/g, '');
  }
  return clean;
};

export const validatePhoneFormat = (value: string): PhoneValidationResult => {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { isValid: false, cleaned: '', error: 'Phone number is required.' };
  }

  const trimmed = value.trim();

  // Check for allowed characters: digits, leading +, spaces, hyphens, parentheses, dots
  if (!/^[+]?[0-9\s\-().]{7,25}$/.test(trimmed)) {
    return {
      isValid: false,
      cleaned: trimmed,
      error: 'Phone number contains invalid characters. Only digits, +, -, and spaces are allowed.',
    };
  }

  // Strip all non-digit characters
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return {
      isValid: false,
      cleaned: trimmed,
      error: 'Phone number must contain between 7 and 15 numeric digits.',
    };
  }

  // Specific check for 10-digit Indian numbers (or +91 / 0 prefix)
  if (digitsOnly.length === 10) {
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: '10-digit Indian mobile numbers must start with 6, 7, 8, or 9 (e.g. 9876543210).',
      };
    }
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const indianMobile = digitsOnly.slice(2);
    if (!/^[6-9]\d{9}$/.test(indianMobile)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: 'Indian phone numbers (+91) must have a valid 10-digit mobile number starting with 6-9.',
      };
    }
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const indianMobile = digitsOnly.slice(1);
    if (!/^[6-9]\d{9}$/.test(indianMobile)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: 'Indian phone numbers starting with 0 must be followed by 10 digits starting with 6-9.',
      };
    }
  }

  return { isValid: true, cleaned: trimmed };
};

export const isValidPhoneNumber = (value: string): boolean => {
  return validatePhoneFormat(value).isValid;
};

export const PHONE_ERROR_MESSAGE =
  'Please enter a valid phone number with 7 to 15 numeric digits (e.g., 9876543210 or +919876543210). Indian numbers must start with 6, 7, 8, or 9.';

/**
 * KeyDown handler to physically block typing non-numeric keys (except control keys and leading +)
 */
export const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow control keys: Backspace, Delete, Tab, Escape, Enter, Arrow keys, Home, End
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ];

  if (allowedKeys.includes(e.key)) {
    return;
  }

  // Allow Ctrl/Cmd key combinations (Copy, Paste, Select All, Cut, Undo)
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  const target = e.currentTarget;
  // Allow '+' only at the start (selectionStart === 0) and if '+' isn't already present
  if (e.key === '+' && target.selectionStart === 0 && !target.value.includes('+')) {
    return;
  }

  // Block any key that is not a numeric digit 0-9
  if (!/^[0-9]$/.test(e.key)) {
    e.preventDefault();
  }
};

