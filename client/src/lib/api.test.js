import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {
  checkInMember,
  getReport,
  getStaffAttendance,
  getTransactions,
  logout,
  readSession,
  writeSession,
} from './api.js';

function createSessionStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

function withBrowserMocks(run) {
  const originalSessionStorage = globalThis.sessionStorage;
  const originalWindow = globalThis.window;
  const originalFetch = globalThis.fetch;
  const storage = createSessionStorage();
  const events = [];
  globalThis.sessionStorage = storage;
  globalThis.window = { dispatchEvent: (event) => events.push(event.type) };
  return Promise.resolve()
    .then(() => run({ events, storage }))
    .finally(() => {
      globalThis.sessionStorage = originalSessionStorage;
      globalThis.window = originalWindow;
      globalThis.fetch = originalFetch;
    });
}

function mockResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

test('member credential failure preserves the authenticated staff session and displays the server message', async () => {
  await withBrowserMocks(async ({ events }) => {
    writeSession({ token: 'staff-session-token', user: { role: 'employee' } });
    globalThis.fetch = async () => mockResponse(403, {
      success: false,
      message: 'Invalid username or PIN, or no active membership was found.',
    });

    await assert.rejects(
      checkInMember({ username: 'member.one', pin: '2468' }),
      /Invalid username or PIN/
    );
    assert.equal(readSession()?.user.role, 'employee');
    assert.deepEqual(events, []);
  });
});

test('duplicate check-in response preserves staff session and exposes the duplicate message', async () => {
  await withBrowserMocks(async ({ events }) => {
    writeSession({ token: 'staff-session-token', user: { role: 'employee' } });
    globalThis.fetch = async () => mockResponse(409, {
      success: false,
      message: 'This member has already checked in today.',
    });

    await assert.rejects(
      checkInMember({ username: 'member.one', pin: '2468' }),
      /already checked in today/
    );
    assert.equal(readSession()?.user.role, 'employee');
    assert.deepEqual(events, []);
  });
});

test('genuine staff authentication failure still clears the session and dispatches unauthorized', async () => {
  await withBrowserMocks(async ({ events }) => {
    writeSession({ token: 'expired-staff-session', user: { role: 'employee' } });
    globalThis.fetch = async () => mockResponse(401, {
      success: false,
      message: 'Your session has expired. Please sign in again.',
    });

    await assert.rejects(checkInMember({ username: 'member.one', pin: '2468' }), /session has expired/);
    assert.equal(readSession(), null);
    assert.deepEqual(events, ['fitnexx:unauthorized']);
  });
});

test('check-in backend failures reject instead of producing a success result', async () => {
  await withBrowserMocks(async () => {
    writeSession({ token: 'staff-session-token', user: { role: 'employee' } });
    globalThis.fetch = async () => mockResponse(500, {
      success: false,
      message: 'An unexpected server error occurred.',
    });

    await assert.rejects(
      checkInMember({ username: 'member.one', pin: '2468' }),
      /unexpected server error/
    );
    assert.equal(readSession()?.user.role, 'employee');
  });
});

test('check-in page retains success modal and displays API failures in its alert UI', () => {
  const checkInPage = fs.readFileSync(
    path.join(import.meta.dirname, '../pages/Staff/MemberCheckin.jsx'),
    'utf8'
  );
  assert.match(checkInPage, /setCheckedInMember\(result\)/);
  assert.match(checkInPage, /setIsSuccessModalOpen\(true\)/);
  assert.match(checkInPage, /title: 'Check-In Failed', message: error\.message/);
  assert.match(checkInPage, /<AlertModal alert=\{alertState\}/);
});

test('report and transaction API requests carry the same inclusive date range', async () => {
  await withBrowserMocks(async () => {
    writeSession({ token: 'admin-session-token', user: { role: 'admin' } });
    const urls = [];
    globalThis.fetch = async (url) => {
      urls.push(url);
      return mockResponse(200, { success: true, data: [] });
    };

    await getReport('Monthly', { from: '2026-01-01', to: '2026-03-31' });
    await getTransactions({ from: '2026-01-01', to: '2026-03-31' });
    assert.equal(
      new URL(urls[0]).searchParams.toString(),
      'timeframe=Monthly&from=2026-01-01&to=2026-03-31'
    );
    assert.equal(
      new URL(urls[1]).searchParams.toString(),
      'from=2026-01-01&to=2026-03-31'
    );
  });
});

test('staff attendance and logout use authenticated API requests', async () => {
  await withBrowserMocks(async () => {
    writeSession({ token: 'employee-session-token', user: { role: 'employee' } });
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, method: options.method, authorization: options.headers.Authorization });
      return mockResponse(200, { success: true, data: [] });
    };

    assert.deepEqual(await getStaffAttendance({ limit: 50 }), []);
    await logout();
    assert.equal(new URL(calls[0].url).pathname, '/api/staff-attendance');
    assert.equal(new URL(calls[0].url).searchParams.get('limit'), '50');
    assert.equal(calls[0].authorization, 'Bearer employee-session-token');
    assert.equal(new URL(calls[1].url).pathname, '/api/auth/logout');
    assert.equal(calls[1].method, 'POST');
    assert.equal(calls[1].authorization, 'Bearer employee-session-token');
  });
});

test('failed logout requests are sent once with the current token and are never retried unauthenticated', async () => {
  await withBrowserMocks(async () => {
    writeSession({ token: 'employee-session-token', user: { role: 'employee' } });
    const calls = [];
    globalThis.fetch = async (url, options) => {
      calls.push({ url, authorization: options.headers.Authorization });
      return mockResponse(500, { success: false, message: 'Logout failed.' });
    };

    await assert.rejects(logout(), /Logout failed/);
    assert.equal(calls.length, 1);
    assert.equal(new URL(calls[0].url).pathname, '/api/auth/logout');
    assert.equal(calls[0].authorization, 'Bearer employee-session-token');
    assert.equal(readSession()?.token, 'employee-session-token');
  });
});
