/**
 * Client-side session helper for the Terrain field-operations platform.
 *
 * Terrain has its own account system (terrain_profiles), separate from
 * the main site's Supabase-session-based admin panel and the sales-agent
 * portal's localStorage-token pattern (which this mirrors, for the same
 * reason: works well offline/PWA-style on field devices without needing
 * the full supabase-js SDK bundled into every page).
 */

export interface TerrainProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'engineer' | 'technician';
  phone: string | null;
  avatar_url: string | null;
  active: boolean;
  must_change_password: boolean;
}

const TOKEN_KEY = 'terrainToken';
const PROFILE_KEY = 'terrainProfile';

export function getTerrainToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getTerrainProfile(): TerrainProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setTerrainSession(token: string, profile: TerrainProfile) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function terrainLogout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

function loginPath(): string {
  // Always absolute — relative-path math here previously broke on nested
  // pages (e.g. /terrain/admin/dashboard/ resolved '../login/' to
  // /terrain/admin/login/, a 404, instead of /terrain/login/).
  return '/terrain/login/';
}

/**
 * Guard a page: redirects to login if there's no session or the role
 * isn't allowed. Returns the profile on success (never returns on failure
 * — the redirect happens first).
 */
export function requireTerrainAuth(allowedRoles?: Array<TerrainProfile['role']>): TerrainProfile | null {
  const token = getTerrainToken();
  const profile = getTerrainProfile();
  if (!token || !profile) {
    window.location.href = loginPath();
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    window.location.href = loginPath();
    return null;
  }
  return profile;
}

/**
 * Authenticated fetch for /api/terrain/* and /api/admin/terrain-users/
 * routes — attaches the Bearer token and clears the session + redirects
 * to login on a 401 (expired/invalid token).
 */
export async function terrainFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getTerrainToken();
  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    terrainLogout();
    window.location.href = loginPath();
  }
  return res;
}

export function roleLabel(role: string): string {
  return ({ super_admin: 'Super Admin', engineer: 'Ingénieur Agronome', technician: 'Technicien' } as Record<string, string>)[role] || role;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const projectTypeLabels: Record<string, string> = {
  greenhouse: 'Serre tropicale',
  irrigation: "Système d'irrigation",
  substrate: 'Substrat (coco/fibres)',
  crops: 'Installation cultures',
  consulting: 'Consulting agronomique',
  equipment: 'Équipements agricoles',
};

export const taskStatusLabels: Record<string, string> = {
  todo: 'À faire', in_progress: 'En cours', review: 'En révision', done: 'Terminé',
};

export const taskPriorityLabels: Record<string, string> = {
  high: 'Haute', medium: 'Moyenne', low: 'Basse',
};

// XSS-safe text escaping for innerHTML interpolation.
export function esc(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
