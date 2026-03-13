import { get, post, patch, del } from './apiClient';

// ─── Analytics ──────────────────────────────────────────────────────────────
export async function fetchPlatformAnalytics(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const response = await get(`/analytics/platform${qs ? `?${qs}` : ''}`);
    return response.data;
}

export async function fetchOutletAnalytics(outletId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const response = await get(`/analytics/outlets/${outletId}${qs ? `?${qs}` : ''}`);
    return response.data;
}

// ─── Outlets ─────────────────────────────────────────────────────────────────
export async function fetchOutlets(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const response = await get(`/outlets${qs ? `?${qs}` : ''}`);
    return response.data;
}

export async function fetchOutlet(id) {
    const response = await get(`/outlets/${id}`);
    return response.data;
}

export async function createOutlet(data) {
    const response = await post('/outlets', data);
    return response.data;
}

export async function updateOutlet(id, data) {
    const response = await patch(`/outlets/${id}`, data);
    return response.data;
}
