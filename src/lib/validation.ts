// Enhanced validation utilities
import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .max(100, 'Email address too long')
  .toLowerCase()
  .trim();

export const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name too long')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Name contains invalid characters')
  .trim();

export const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .max(20, 'Phone number too long')
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Phone number contains invalid characters')
  .trim();

export const messageSchema = z.string()
  .min(10, 'Message must be at least 10 characters')
  .max(1000, 'Message too long')
  .trim();

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

// Form validation utilities
export class FormValidator {
  private errors: Record<string, string[]> = {};
  
  addError(field: string, message: string): void {
    if (!this.errors[field]) {
      this.errors[field] = [];
    }
    this.errors[field].push(message);
  }
  
  hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }
  
  getErrors(): Record<string, string[]> {
    return this.errors;
  }
  
  getFirstError(): string | null {
    const firstField = Object.keys(this.errors)[0];
    return firstField ? this.errors[firstField][0] : null;
  }
  
  clear(): void {
    this.errors = {};
  }
  
  validateField(field: string, value: any, schema: z.ZodSchema): boolean {
    try {
      schema.parse(value);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          this.addError(field, err.message);
        });
      }
      return false;
    }
  }
}

// Client-side validation helpers
export function createClientValidator() {
  return {
    validateEmail: (email: string) => validateEmail(email),
    validatePhone: (phone: string) => validatePhone(phone),
    validateRequired: (value: string) => validateRequired(value),
    validateLength: (value: string, min: number, max: number) => 
      value.length >= min && value.length <= max
  };
}