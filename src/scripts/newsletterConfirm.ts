export function initNewsletterConfirm(token: string, lang: string) {
  async function confirmSubscription() {
    try {
      const response = await fetch(`/api/newsletter/confirm?token=${token}`);
      const statusMessage = document.getElementById('status-message');
      
      if (response.ok) {
        if (statusMessage) {
          statusMessage.textContent = 'Your subscription has been confirmed! You can close this window.';
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

  if (token) {
    confirmSubscription();
  }
}