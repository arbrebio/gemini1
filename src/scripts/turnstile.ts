declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

/**
 * Renders a Cloudflare Turnstile widget into `container` and returns a
 * getter for its current token. Waits for the async api.js script (loaded
 * globally in Layout.astro) if it hasn't finished loading yet.
 */
export function mountTurnstile(container: HTMLElement): { getToken: () => string } {
  const siteKey = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY as string | undefined;
  const state = { token: '' };

  if (!siteKey) {
    console.warn('Turnstile site key is not configured');
    return { getToken: () => state.token };
  }

  const render = () => {
    window.turnstile!.render(container, {
      sitekey: siteKey,
      callback: (token: string) => { state.token = token; },
      'expired-callback': () => { state.token = ''; },
      'error-callback': () => { state.token = ''; },
    });
  };

  if (window.turnstile) {
    render();
  } else {
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        render();
      }
    }, 100);
  }

  return { getToken: () => state.token };
}
