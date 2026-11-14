// API client for the web app (called from loaders/actions server-side)
import type { ListingFilters, ListingSummary, ListingDetail } from '@treg/types';

const API_URL = process.env['PUBLIC_API_URL'] ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error ${status}`);
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export async function getListings(filters: Partial<ListingFilters>, token?: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) {
      if (Array.isArray(v)) {
        for (const item of v) params.append(k, String(item));
      } else {
        params.set(k, String(v));
      }
    }
  }
  return apiFetch<{
    items: ListingSummary[];
    nextCursor: string | null;
    geo: unknown;
    facets: Record<string, Record<string, number>>;
  }>(`/listings?${params}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
}

export async function getListing(slug: string, token?: string) {
  return apiFetch<ListingDetail>(
    `/listings/${encodeURIComponent(slug)}`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : {},
  );
}

export async function getRegions(country?: string) {
  const params = country ? `?country=${country}` : '';
  return apiFetch<{
    items: Array<{
      id: string;
      name: string;
      slug: string;
      country: string;
      parentId: string | null;
    }>;
  }>(`/regions${params}`);
}

export async function getFeatures() {
  return apiFetch<{ items: Array<{ id: string; key: string }> }>('/features');
}

export async function loginUser(email: string, password: string) {
  return apiFetch<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
  role: string;
}) {
  return apiFetch<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMe(token: string) {
  return apiFetch<{ user: unknown }>('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getFavorites(token: string) {
  return apiFetch<{ items: ListingSummary[] }>('/me/favorites', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function toggleFavorite(listingId: string, token: string, add: boolean) {
  return apiFetch(`/me/favorites/${listingId}`, {
    method: add ? 'PUT' : 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function submitContact(
  listingId: string,
  data: { name: string; email: string; phone?: string; message: string },
) {
  return apiFetch(`/listings/${listingId}/contact`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyListings(token: string) {
  return apiFetch<{ items: ListingSummary[] }>('/me/listings', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createListing(data: unknown, token: string) {
  return apiFetch<{ id: string; slug: string }>('/listings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function updateListing(id: string, data: unknown, token: string) {
  return apiFetch<{ id: string; slug: string }>(`/listings/${id}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
}

export async function submitListing(id: string, token: string) {
  return apiFetch(`/listings/${id}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}
