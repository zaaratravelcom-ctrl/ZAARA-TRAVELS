/**
 * Server-Side Phone Number Validation Helper
 * Validates customer phone numbers before writing to MySQL database or initiating gateway orders.
 */

export interface ServerPhoneValidationResult {
  isValid: boolean;
  cleaned: string;
  error?: string;
}

export function validateServerPhoneNumber(value: any): ServerPhoneValidationResult {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return {
      isValid: false,
      cleaned: '',
      error: 'Customer phone number is required.',
    };
  }

  const trimmed = value.trim();

  // Allow only digits, +, -, spaces, parentheses, dots
  if (!/^[+]?[0-9\s\-().]{7,25}$/.test(trimmed)) {
    return {
      isValid: false,
      cleaned: trimmed,
      error: 'Phone number contains invalid characters. Only digits, +, -, and spaces are permitted.',
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

  // Validate Indian mobile numbers (10 digits starting with 6-9, or +91 / 0 prefix)
  if (digitsOnly.length === 10) {
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: '10-digit Indian mobile numbers must start with 6, 7, 8, or 9 (e.g., 9876543210).',
      };
    }
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const indianMobile = digitsOnly.slice(2);
    if (!/^[6-9]\d{9}$/.test(indianMobile)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: 'Indian phone numbers with +91 country code must contain a valid 10-digit mobile number starting with 6-9.',
      };
    }
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    const indianMobile = digitsOnly.slice(1);
    if (!/^[6-9]\d{9}$/.test(indianMobile)) {
      return {
        isValid: false,
        cleaned: trimmed,
        error: 'Indian phone numbers starting with 0 prefix must be followed by a valid 10-digit mobile number starting with 6-9.',
      };
    }
  }

  return { isValid: true, cleaned: trimmed };
}
