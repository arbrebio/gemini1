/**
 * Meta Conversions API — server-side event delivery.
 *
 * Pairs with the browser Meta Pixel (src/layouts/Layout.astro) so conversions
 * still get reported when the pixel is blocked by ad blockers or Safari/iOS
 * privacy restrictions. Silently no-ops when not configured.
 */
import { createHash } from 'node:crypto';

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

export interface ContactEventInput {
  email?: string;
  phone?: string;
  clientIp?: string | null;
  userAgent?: string | null;
  /** Meta click ID cookie (_fbc) and browser ID cookie (_fbp), if present. */
  fbc?: string | null;
  fbp?: string | null;
  sourceUrl: string;
}

/** Send a "Contact" event (e.g. contact form submission) to Meta's Conversions API. */
export async function sendContactEvent(input: ContactEventInput): Promise<void> {
  const pixelId = import.meta.env.PUBLIC_META_PIXEL_ID;
  const accessToken = import.meta.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !accessToken) return;

  const userData: Record<string, unknown> = {};
  if (input.email) userData.em = [sha256(input.email)];
  if (input.phone) userData.ph = [sha256(input.phone.replace(/[^\d]/g, ''))];
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbc) userData.fbc = input.fbc;
  if (input.fbp) userData.fbp = input.fbp;

  const body = {
    data: [
      {
        event_name: 'Contact',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: input.sourceUrl,
        user_data: userData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    if (!res.ok) {
      const text = await res.text();
      console.error('Meta Conversions API error:', res.status, text);
    }
  } catch (err) {
    console.error('Meta Conversions API request failed:', err);
  }
}

/** Parse the `_fbc` / `_fbp` cookies Meta's pixel sets, from a raw Cookie header. */
export function parseFacebookCookies(cookieHeader: string | null): { fbc: string | null; fbp: string | null } {
  if (!cookieHeader) return { fbc: null, fbp: null };
  const match = (name: string) => {
    const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : null;
  };
  return { fbc: match('_fbc'), fbp: match('_fbp') };
}
