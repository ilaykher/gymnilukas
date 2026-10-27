const API_BASE_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const SESSION_KEY = 'fitnexxSession';

export function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function writeSession(session) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

async function request(path, { signal, method = 'GET', body, authenticated = true } = {}) {
  const headers = { Accept: 'application/json' };
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (authenticated) {
    const session = readSession();
    if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal,
  });
  const text = await response.text();
  let result;
  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('The server returned an invalid response.');
  }

  if (!response.ok || result.success === false) {
    if (response.status === 401 && authenticated) {
      writeSession(null);
      window.dispatchEvent(new Event('fitnexx:unauthorized'));
    }
    throw new Error(result.message || `Request failed with status ${response.status}.`);
  }
  return result;
}

const get = (path, options) => request(path, options);
const post = (path, body) => request(path, { method: 'POST', body });
const patch = (path, body) => request(path, { method: 'PATCH', body });

export async function login(credentials) {
  return (await request('/api/auth/login', { method: 'POST', body: credentials, authenticated: false })).data;
}

export function logout() {
  return post('/api/auth/logout', {});
}

export async function getCurrentUser() {
  return (await get('/api/auth/me')).data.user;
}

export function verifyCurrentPassword(password) {
  return post('/api/auth/verify-password', { password });
}

export function changePassword(currentPassword, newPassword) {
  return post('/api/auth/change-password', { currentPassword, newPassword });
}

export function getMembers(options) {
  return get('/api/members', options).then((result) => {
    if (!Array.isArray(result.data)) throw new Error('The members API returned an invalid response.');
    return result.data;
  });
}

export function getMember(memberId, options) {
  return get(`/api/members/${encodeURIComponent(memberId)}`, options).then((result) => result.data);
}

export function uploadMemberProfilePhoto(memberId, photo) {
  const body = new FormData();
  body.append('photo', photo);
  return post(`/api/members/${encodeURIComponent(memberId)}/profile-photo`, body).then((result) => result.data);
}

export function createMember(member) {
  return post('/api/members', member).then((result) => result.data);
}

export function checkInMember(credentials) {
  return post('/api/check-ins', credentials).then((result) => result.data);
}

export function registerWalkIn(walkIn) {
  return post('/api/walk-ins', walkIn).then((result) => result.data);
}

export function renewMember(memberId, details) {
  return post(`/api/members/${encodeURIComponent(memberId)}/renewals`, details).then((result) => result.data);
}

export function resetMemberPin(memberId, pin) {
  return patch(`/api/members/${encodeURIComponent(memberId)}/pin`, { pin }).then((result) => result.data);
}

export function addMemberWeight(memberId, weightKg) {
  return post(`/api/members/${encodeURIComponent(memberId)}/weights`, { weightKg }).then((result) => result.data);
}

export function getEmployees(options) {
  return get('/api/employees', options).then((result) => result.data);
}

export function getStaffAttendance({ signal, limit } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  const suffix = query.size ? `?${query.toString()}` : '';
  return get(`/api/staff-attendance${suffix}`, { signal }).then((result) => {
    if (!Array.isArray(result.data)) throw new Error('The staff attendance API returned an invalid response.');
    return result.data;
  });
}

export function createEmployee(employee) {
  return post('/api/employees', employee).then((result) => result.data);
}

export function updateEmployee(employeeId, employee) {
  return patch(`/api/employees/${encodeURIComponent(employeeId)}`, employee).then((result) => result.data);
}

export function resetEmployeePassword(employeeId, password, requireChange) {
  return patch(`/api/employees/${encodeURIComponent(employeeId)}/password`, { password, requireChange });
}

export function getTransactions({ signal, from, to } = {}) {
  const query = new URLSearchParams();
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  const suffix = query.size ? `?${query.toString()}` : '';
  return get(`/api/transactions${suffix}`, { signal }).then((result) => result.data);
}

export function getActivity({ signal, limit, from, to } = {}) {
  const query = new URLSearchParams();
  if (limit) query.set('limit', String(limit));
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  const suffix = query.size ? `?${query.toString()}` : '';
  return get(`/api/activity${suffix}`, { signal }).then((result) => result.data);
}

export function getDashboard(options) {
  return get('/api/dashboard', options).then((result) => result.data);
}

export function getReport(timeframe, { signal, from, to } = {}) {
  const query = new URLSearchParams({ timeframe });
  if (from) query.set('from', from);
  if (to) query.set('to', to);
  return get(`/api/reports?${query}`, { signal }).then((result) => result.data);
}

export function getPricing(options) {
  return get('/api/pricing', options).then((result) => result.data);
}

export function updatePricing(prices) {
  return request('/api/pricing', { method: 'PUT', body: prices }).then((result) => result.data);
}
