/**
 * Document Verification Library
 * Handles age verification through government-issued ID documents
 * Privacy-first: Only extracts/stores age verification, never stores documents
 */

export type DocumentType = 'passport' | 'drivers_license' | 'national_id';

export interface DocumentVerificationRequest {
  userId: string;
  documentType: DocumentType;
  birthdate: string; // ISO format: YYYY-MM-DD
  documentFile?: File; // Optional for preview/context
}

export interface DocumentVerificationResult {
  isValid: boolean;
  isOver18: boolean;
  age?: number;
  error?: string;
  verificationType: 'document_upload';
}

export interface RateLimitInfo {
  remainingAttempts: number;
  resetTime: string;
}

/**
 * Validate that a date string is in valid format and represents a real date
 */
export function validateDateFormat(dateString: string): boolean {
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  // Check if it's a valid date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return false;
  }

  // Check if date is not in the future
  if (date > new Date()) {
    return false;
  }

  // Check if date is reasonable (not more than 150 years ago)
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 150);
  if (date < minDate) {
    return false;
  }

  return true;
}

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  // Adjust if birthday hasn't occurred this year yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Verify if user is 18 or older based on birthdate
 */
export function verifyAgeFromBirthdate(birthdate: string): DocumentVerificationResult {
  // Validate date format
  if (!validateDateFormat(birthdate)) {
    return {
      isValid: false,
      isOver18: false,
      error: 'Invalid date format. Please use YYYY-MM-DD format.',
      verificationType: 'document_upload'
    };
  }

  // Calculate age
  const age = calculateAge(birthdate);

  // Check if negative age (future date)
  if (age < 0) {
    return {
      isValid: false,
      isOver18: false,
      error: 'Birthdate cannot be in the future.',
      verificationType: 'document_upload'
    };
  }

  // Check if unreasonably old
  if (age > 150) {
    return {
      isValid: false,
      isOver18: false,
      error: 'Invalid birthdate.',
      verificationType: 'document_upload'
    };
  }

  // Verify age requirement
  const isOver18 = age >= 18;

  return {
    isValid: true,
    isOver18,
    age,
    error: isOver18 ? undefined : 'You must be 18 or older to verify your age.',
    verificationType: 'document_upload'
  };
}

/**
 * Validate uploaded document file
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const maxSizeBytes = (parseInt(process.env.MAX_DOCUMENT_SIZE_MB || '5') * 1024 * 1024);
  const allowedTypes = (process.env.ALLOWED_DOCUMENT_TYPES || 'jpg,jpeg,png,pdf')
    .split(',')
    .map(t => t.trim().toLowerCase());

  // Check file size
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeBytes / (1024 * 1024)}MB`
    };
  }

  // Check file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  const isValidExtension = fileExtension && allowedTypes.includes(fileExtension);
  const isValidMime =
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf';

  if (!isValidExtension || !isValidMime) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
}

/**
 * Rate limiting for document verification attempts
 * Stores attempts in localStorage (in production, use database)
 */
export class DocumentVerificationRateLimiter {
  private readonly storageKey = 'doc_verification_attempts';
  private readonly maxAttemptsPerDay: number;

  constructor(maxAttemptsPerDay: number = 3) {
    this.maxAttemptsPerDay = maxAttemptsPerDay;
  }

  /**
   * Check if user has remaining attempts
   */
  getRemainingAttempts(userId: string): RateLimitInfo {
    const attempts = this.getAttempts(userId);
    const now = new Date();

    // Filter attempts from last 24 hours
    const recentAttempts = attempts.filter(timestamp => {
      const attemptDate = new Date(timestamp);
      const hoursSinceAttempt = (now.getTime() - attemptDate.getTime()) / (1000 * 60 * 60);
      return hoursSinceAttempt < 24;
    });

    const remaining = Math.max(0, this.maxAttemptsPerDay - recentAttempts.length);

    // Calculate reset time (24 hours from oldest attempt)
    let resetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    if (recentAttempts.length > 0) {
      const oldestAttempt = new Date(Math.min(...recentAttempts.map(t => new Date(t).getTime())));
      resetTime = new Date(oldestAttempt.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }

    return {
      remainingAttempts: remaining,
      resetTime
    };
  }

  /**
   * Record a verification attempt
   */
  recordAttempt(userId: string): void {
    const attempts = this.getAttempts(userId);
    attempts.push(new Date().toISOString());

    // Keep only last 10 attempts to prevent storage bloat
    const recentAttempts = attempts.slice(-10);

    try {
      localStorage.setItem(
        `${this.storageKey}_${userId}`,
        JSON.stringify(recentAttempts)
      );
    } catch (error) {
      console.error('Failed to record verification attempt:', error);
    }
  }

  /**
   * Check if user can make another attempt
   */
  canAttempt(userId: string): boolean {
    const info = this.getRemainingAttempts(userId);
    return info.remainingAttempts > 0;
  }

  /**
   * Get all attempts for a user
   */
  private getAttempts(userId: string): string[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get verification attempts:', error);
      return [];
    }
  }

  /**
   * Clear all attempts for a user (admin use only)
   */
  clearAttempts(userId: string): void {
    try {
      localStorage.removeItem(`${this.storageKey}_${userId}`);
    } catch (error) {
      console.error('Failed to clear attempts:', error);
    }
  }
}

/**
 * Get document type display name
 */
export function getDocumentTypeName(type: DocumentType): string {
  switch (type) {
    case 'passport':
      return 'Passport';
    case 'drivers_license':
      return "Driver's License";
    case 'national_id':
      return 'National ID';
    default:
      return 'ID Document';
  }
}

/**
 * Sanitize file name for security
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path separators and special characters
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 100); // Limit length
}

/**
 * Convert file to base64 (for preview only, never stored)
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Redact sensitive information from error messages
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove any potential PII from error messages
    return error.message
      .replace(/\b\d{9,}\b/g, '[REDACTED]') // Remove long numbers
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[EMAIL]'); // Remove emails
  }
  return 'An error occurred during verification';
}
