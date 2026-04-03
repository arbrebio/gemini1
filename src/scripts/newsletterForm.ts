export function initNewsletterForm(formId: string = 'newsletter-form') {
  const form = document.getElementById(formId);
  const successMessage = form?.querySelector('.success-message');
  const errorMessage = form?.querySelector('.error-message');
  const loadingSpinner = form?.querySelector('.loading-spinner');
  const submitButton = form?.querySelector('button[type="submit"]');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Reset messages
      successMessage?.classList.add('hidden');
      errorMessage?.classList.add('hidden');
      
      // Show loading state
      loadingSpinner?.classList.remove('hidden');
      if (submitButton) {
        (submitButton as HTMLButtonElement).disabled = true;
      }
      
      try {
        const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
        const email = emailInput?.value;
        
        if (!email) {
          throw new Error('Email is required');
        }
        
        // Basic client-side email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        // Send data to our API endpoint
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            source: formId.includes('footer') ? 'footer' : 'blog',
            consent: true
          }),
        });
        
        try {
          const result = await response.json();
          
          if (!response.ok || !result.success) {
            throw new Error(result.message || 'Failed to subscribe');
          }
          
          // Show success message
          if (successMessage) {
            successMessage.textContent = result.message || 'Thank you for subscribing! Please check your email to confirm your subscription.';
            successMessage.classList.remove('hidden');
          }
          (form as HTMLFormElement).reset();
        } catch (jsonError) {
          // If JSON parsing fails, create a more user-friendly error
          if (response.ok) {
            // If the response was OK but JSON parsing failed, show success
            if (successMessage) {
              successMessage.textContent = 'Thank you for subscribing! Please check your email to confirm your subscription.';
              successMessage.classList.remove('hidden');
            }
            (form as HTMLFormElement).reset();
            return;
          } else {
            throw new Error('Failed to process subscription. Please try again.');
          }
        }
      } catch (error) {
        // Show error message
        if (errorMessage) {
          errorMessage.textContent = error instanceof Error 
            ? error.message 
            : 'An error occurred. Please try again.';
          errorMessage.classList.remove('hidden');
        }
      } finally {
        // Reset loading state
        loadingSpinner?.classList.add('hidden');
        if (submitButton) {
          (submitButton as HTMLButtonElement).disabled = false;
        }
      }
    });
  }
}