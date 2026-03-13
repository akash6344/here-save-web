import { get } from './apiClient';

export async function fetchRedemptions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await get(`/redemptions${queryString ? `?${queryString}` : ''}`, { token: window.localStorage.getItem('accessToken') });
    return response.data;
}
