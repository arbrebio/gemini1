export function initContactForm() {
  const form = document.getElementById('contact-form');
  const successMessage = form ? form.querySelector('.success-message') : null;
  const errorMessage = form ? form.querySelector('.error-message') : null;
  const loadingSpinner = form ? form.querySelector('.loading-spinner') : null;
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;

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
        const formData = new FormData(form as HTMLFormElement);
        const data = {
          firstName: formData.get('firstName'),
          lastName: formData.get('lastName'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          interest: formData.get('interest'),
          message: formData.get('message'),
        };
        
        // Client-side validation
        if (!data.firstName || !data.lastName || !data.email || !data.phone || !data.interest || !data.message) {
          throw new Error('All fields are required');
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email as string)) {
          throw new Error('Please enter a valid email address');
        }

        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          if (response.ok) {
            // If response was OK but JSON parsing failed, assume success
            if (successMessage) {
              successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
              successMessage.classList.remove('hidden');
            }
            (form as HTMLFormElement).reset();
            return;
          } else {
            throw new Error('Failed to process your request. Please try again.');
          }
        }

        if (!response.ok) {
          throw new Error(result.error || 'Failed to send message');
        }

        // Show success message
        if (successMessage) {
          successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
          successMessage.classList.remove('hidden');
        }
        (form as HTMLFormElement).reset();
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