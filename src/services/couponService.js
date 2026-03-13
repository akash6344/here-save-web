import { get, post, patch } from './apiClient';

export async function fetchCoupons(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const response = await get(`/coupons${qs ? `?${qs}` : ''}`);
    return response.data;
}

export async function fetchCoupon(id) {
    const response = await get(`/coupons/${id}`);
    return response.data;
}

export async function createCoupon(data) {
    const response = await post('/coupons', data);
    return response.data;
}

export async function approveCoupon(id) {
    const response = await patch(`/coupons/${id}/approve`, {});
    return response.data;
}

export async function rejectCoupon(id, reason = '') {
    const response = await patch(`/coupons/${id}/reject`, { reason });
    return response.data;
}
