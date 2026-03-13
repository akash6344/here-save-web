import { get, post } from './apiClient';

export async function fetchEmployees(outletId, params = {}) {
    const qs = new URLSearchParams(params).toString();
    const response = await get(`/outlets/${outletId}/employees${qs ? `?${qs}` : ''}`);
    return response.data;
}

export async function createEmployee(data) {
    // data: { user_id, outlet_id, shift_start, shift_end, status }
    const response = await post('/employees', data);
    return response.data;
}
