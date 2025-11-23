export function initNewsletterUnsubscribe(email: string, token: string, lang: string) {
  async function unsubscribe() {
    try {
      const response = await fetch(`/api/newsletter/unsubscribe?email=${email}&token=${token}`);
      const statusMessage = document.getElementById('status-message');
      
      if (response.ok) {
        if (statusMessage) {
          statusMessage.textContent = 'You have been successfully unsubscribed from our newsletter.';
          statusMessage.className = 'text-green-600';
        }
      } else {
        const error = await response.text();
        if (statusMessage) {
          statusMessage.textContent = error;
          statusMessage.className = 'text-red-600';
        }
      }
    } catch (error) {
      const statusMessage = document.getElementById('status-message');
      if (statusMessage) {
        statusMessage.textContent = 'An error occurred. Please try again later.';
        statusMessage.className = 'text-red-600';
      }
    }
  }

  if (email && token) {
    unsubscribe();
  }
}