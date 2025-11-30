export function initQuoteForm(formId: string = 'quote-form-element') {
  const quoteForm = document.getElementById(formId);
  const successMessage = quoteForm?.querySelector('.success-message');
  const errorMessage = quoteForm?.querySelector('.error-message');
  
  if (quoteForm) {
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Reset messages
      successMessage?.classList.add('hidden');
      errorMessage?.classList.add('hidden');
      
      try {
        const formData = new FormData(quoteForm as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        
        // Basic validation
        const required = ['firstName', 'lastName', 'email', 'phone'];
        for (const field of required) {
          if (!data[field]) {
            throw new Error(`${field} is required`);
          }
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email as string)) {
          throw new Error('Please enter a valid email address');
        }
        
        // Send data to quote API endpoint
        const response = await fetch('/api/quote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            quoteType: getQuoteTypeFromForm(quoteForm)
          }),
        });

        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          if (response.ok) {
            // If response was OK but JSON parsing failed, assume success
            if (successMessage) {
              successMessage.textContent = 'Thank you for your quote request! We\'ll get back to you soon.';
              successMessage.classList.remove('hidden');
            }
            (quoteForm as HTMLFormElement).reset();
            return;
          } else {
            throw new Error('Failed to process your request. Please try again.');
          }
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to send quote request');
        }

        // Show success message
        if (successMessage) {
          successMessage.textContent = result.message || 'Thank you for your quote request! We\'ll get back to you soon.';
          successMessage.classList.remove('hidden');
        }
        (quoteForm as HTMLFormElement).reset();
        
      } catch (error) {
        if (errorMessage) {
          errorMessage.textContent = error instanceof Error ? error.message : 'An error occurred';
          errorMessage.classList.remove('hidden');
        }
      }
    });
  }
}

function getQuoteTypeFromForm(form: HTMLElement): string {
  // Determine quote type based on form context or hidden field
  const formId = form.id;
  
  if (formId.includes('greenhouse') || window.location.pathname.includes('greenhouse')) {
    return 'greenhouse';
  }
  if (formId.includes('irrigation') || window.location.pathname.includes('irrigation')) {
    return 'irrigation';
  }
  if (formId.includes('substrate') || window.location.pathname.includes('substrate')) {
    return 'substrate';
  }
  
  return 'general';
}