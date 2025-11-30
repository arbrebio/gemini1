// Enhanced client-side form validation
import { createClientValidator } from '../lib/validation';

export interface ValidationRule {
  field: string;
  rules: Array<{
    type: 'required' | 'email' | 'phone' | 'minLength' | 'maxLength' | 'pattern';
    value?: any;
    message: string;
  }>;
}

export class FormValidationManager {
  private form: HTMLFormElement;
  private rules: ValidationRule[];
  private validator = createClientValidator();
  
  constructor(formSelector: string, rules: ValidationRule[]) {
    const form = document.querySelector(formSelector) as HTMLFormElement;
    if (!form) {
      throw new Error(`Form not found: ${formSelector}`);
    }
    
    this.form = form;
    this.rules = rules;
    this.init();
  }
  
  private init(): void {
    // Add real-time validation
    this.rules.forEach(({ field }) => {
      const input = this.form.querySelector(`[name="${field}"]`) as HTMLInputElement;
      if (input) {
        input.addEventListener('blur', () => this.validateField(field));
        input.addEventListener('input', () => this.clearFieldError(field));
      }
    });
    
    // Add form submission validation
    this.form.addEventListener('submit', (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
      }
    });
  }
  
  private validateField(fieldName: string): boolean {
    const rule = this.rules.find(r => r.field === fieldName);
    if (!rule) return true;
    
    const input = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!input) return true;
    
    const value = input.value.trim();
    let isValid = true;
    
    for (const validation of rule.rules) {
      switch (validation.type) {
        case 'required':
          if (!this.validator.validateRequired(value)) {
            this.showFieldError(fieldName, validation.message);
            isValid = false;
          }
          break;
          
        case 'email':
          if (value && !this.validator.validateEmail(value)) {
            this.showFieldError(fieldName, validation.message);
            isValid = false;
          }
          break;
          
        case 'phone':
          if (value && !this.validator.validatePhone(value)) {
            this.showFieldError(fieldName, validation.message);
            isValid = false;
          }
          break;
          
        case 'minLength':
          if (value && !this.validator.validateLength(value, validation.value, Infinity)) {
            this.showFieldError(fieldName, validation.message.replace('{min}', validation.value));
            isValid = false;
          }
          break;
          
        case 'maxLength':
          if (value && !this.validator.validateLength(value, 0, validation.value)) {
            this.showFieldError(fieldName, validation.message.replace('{max}', validation.value));
            isValid = false;
          }
          break;
          
        case 'pattern':
          if (value && !new RegExp(validation.value).test(value)) {
            this.showFieldError(fieldName, validation.message);
            isValid = false;
          }
          break;
      }
      
      if (!isValid) break;
    }
    
    if (isValid) {
      this.clearFieldError(fieldName);
    }
    
    return isValid;
  }
  
  private validateForm(): boolean {
    let isValid = true;
    
    this.rules.forEach(({ field }) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });
    
    return isValid;
  }
  
  private showFieldError(fieldName: string, message: string): void {
    const input = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!input) return;
    
    // Remove existing error
    this.clearFieldError(fieldName);
    
    // Add error styling
    input.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    input.classList.remove('border-gray-300', 'focus:border-primary', 'focus:ring-primary');
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'text-red-600 text-sm mt-1';
    errorElement.textContent = message;
    errorElement.setAttribute('data-error-for', fieldName);
    
    // Insert error message after input
    input.parentNode?.insertBefore(errorElement, input.nextSibling);
  }
  
  private clearFieldError(fieldName: string): void {
    const input = this.form.querySelector(`[name="${fieldName}"]`) as HTMLInputElement;
    if (!input) return;
    
    // Remove error styling
    input.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
    input.classList.add('border-gray-300', 'focus:border-primary', 'focus:ring-primary');
    
    // Remove error message
    const errorElement = this.form.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// Pre-configured validation rules
export const contactFormRules: ValidationRule[] = [
  {
    field: 'firstName',
    rules: [
      { type: 'required', message: 'First name is required' },
      { type: 'maxLength', value: 50, message: 'First name too long (max {max} characters)' },
      { type: 'pattern', value: '^[a-zA-ZÀ-ÿ\\s\'-]+$', message: 'First name contains invalid characters' }
    ]
  },
  {
    field: 'lastName',
    rules: [
      { type: 'required', message: 'Last name is required' },
      { type: 'maxLength', value: 50, message: 'Last name too long (max {max} characters)' },
      { type: 'pattern', value: '^[a-zA-ZÀ-ÿ\\s\'-]+$', message: 'Last name contains invalid characters' }
    ]
  },
  {
    field: 'email',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
      { type: 'maxLength', value: 100, message: 'Email too long (max {max} characters)' }
    ]
  },
  {
    field: 'phone',
    rules: [
      { type: 'required', message: 'Phone number is required' },
      { type: 'phone', message: 'Please enter a valid phone number' },
      { type: 'maxLength', value: 20, message: 'Phone number too long (max {max} characters)' }
    ]
  },
  {
    field: 'message',
    rules: [
      { type: 'required', message: 'Message is required' },
      { type: 'minLength', value: 10, message: 'Message too short (min {min} characters)' },
      { type: 'maxLength', value: 1000, message: 'Message too long (max {max} characters)' }
    ]
  }
];

export const newsletterFormRules: ValidationRule[] = [
  {
    field: 'email',
    rules: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' },
      { type: 'maxLength', value: 100, message: 'Email too long (max {max} characters)' }
    ]
  },
  {
    field: 'full_name',
    rules: [
      { type: 'maxLength', value: 100, message: 'Name too long (max {max} characters)' },
      { type: 'pattern', value: '^[a-zA-ZÀ-ÿ\\s\'-]*$', message: 'Name contains invalid characters' }
    ]
  }
];