/**
 * Validation Utilities
 * Common validation functions used across the application
 */

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Name validation (only letters and spaces)
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(name) && name.trim().length >= 2;
}

/**
 * Password strength validation
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Phone number validation (basic)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if string is empty or whitespace
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return !isNaN(value) && !isNaN(parseFloat(value));
}

/**
 * Check if date is valid
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return isValidDate(date) && date > new Date();
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  return isValidDate(date) && date < new Date();
}

/**
 * Validate age (must be between min and max)
 */
export function isValidAge(age: number, min = 0, max = 150): boolean {
  return isValidNumber(age) && age >= min && age <= max;
}

/**
 * Custom validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate user data
 */
export function validateUserData(userData: {
  email?: string;
  firstName?: string;
  lastName?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (userData.email !== undefined) {
    if (isEmpty(userData.email)) {
      errors.push('Email is required');
    } else if (!isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }
  }

  if (userData.firstName !== undefined) {
    if (isEmpty(userData.firstName)) {
      errors.push('First name is required');
    } else if (!isValidName(userData.firstName)) {
      errors.push(
        'First name must contain only letters and spaces, and be at least 2 characters long',
      );
    }
  }

  if (userData.lastName !== undefined) {
    if (isEmpty(userData.lastName)) {
      errors.push('Last name is required');
    } else if (!isValidName(userData.lastName)) {
      errors.push(
        'Last name must contain only letters and spaces, and be at least 2 characters long',
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
