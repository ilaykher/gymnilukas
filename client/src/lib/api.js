const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function request(path, { signal } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

export async function getMembers({ signal } = {}) {
  const result = await request('/api/members', { signal });

  if (!Array.isArray(result.data)) {
    throw new Error('The members API returned an invalid response.');
  }

  return result.data;
}
