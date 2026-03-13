const DEFAULT_BASE_URL = 'http://localhost:3000/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

function getAuthToken() {
  return window.localStorage.getItem('accessToken');
}

async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
  const url = `${API_BASE_URL}${path}`;

  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  if (body && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  const authToken = token || getAuthToken();
  if (authToken) {
    finalHeaders.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok || json === null || json.success === false) {
    const message =
      (json && json.error && json.error.message) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = json;
    throw error;
  }

  return json;
}

export function post(path, body, options = {}) {
  return request(path, { ...options, method: 'POST', body });
}

export function get(path, options = {}) {
  return request(path, { ...options, method: 'GET' });
}

export function patch(path, body, options = {}) {
  return request(path, { ...options, method: 'PATCH', body });
}

export function del(path, options = {}) {
  return request(path, { ...options, method: 'DELETE' });
}
