import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DemoApiError,
  fetchDemoSnapshot,
  mapDemoAlerts,
  mapDemoDonor,
  mapDemoHistory,
  mapDemoNotifications,
  performDemoAction,
  resetDemoSandbox,
  type DemoSnapshot,
} from './demoSandbox';

const snapshot: DemoSnapshot = {
  sandboxId: 'global',
  revision: 7,
  expiresAt: '2026-07-15T12:00:00.000Z',
  serverTime: '2026-07-15T10:00:00.000Z',
  data: {
    donor: {
      id: 'demo-donor-primary',
      firstName: 'Aarav',
      lastName: 'Demo',
      email: 'primary.donor@example.com',
      phone: '+91-00000-10000',
      address: 'Demo Kolkata',
      bloodGroup: 'O+',
      status: 'APPROVED',
      available: true,
      suspended: false,
      isPrimary: true,
      lastDonationAt: '2026-03-01T10:00:00.000Z',
      donationCount: 3,
      hemoglobin: 13.5,
      bmi: 22,
      recentVaccinations: false,
      medications: null,
      latitude: 22.58,
      longitude: 88.34,
    },
    alerts: [{
      id: 'demo-alert-active',
      hospitalId: 'demo-hospital-primary',
      hospitalName: 'HaemoLogix Demo Medical Centre',
      hospitalAddress: 'AJC Bose Road, Kolkata',
      hospitalPhone: '+91-00000-20001',
      hospitalLatitude: 22.54,
      hospitalLongitude: 88.34,
      distanceKm: 4.6,
      bloodType: 'B+',
      urgency: 'HIGH',
      unitsNeeded: 3,
      description: 'Synthetic alert',
      createdAt: '2026-07-15T09:00:00.000Z',
      status: 'NOTIFIED',
    }],
    history: [{
      id: 'history-1',
      date: '2026-03-01T10:00:00.000Z',
      hospitalName: 'HaemoLogix Demo Medical Centre',
      type: 'Whole Blood',
      units: 1,
      status: 'Completed',
    }],
    notifications: [{
      id: 'notification-1',
      alertId: 'demo-alert-active',
      title: 'Shared demo alert',
      message: 'A demo hospital needs blood.',
      createdAt: '2026-07-15T09:00:00.000Z',
    }],
  },
};

test('maps the shared donor snapshot into the existing mobile screen types', () => {
  const donor = mapDemoDonor(snapshot.data.donor);
  const alerts = mapDemoAlerts(snapshot.data);
  const history = mapDemoHistory(snapshot.data);
  const notifications = mapDemoNotifications(snapshot.data);

  assert.equal(donor.id, 'demo-donor-primary');
  assert.equal(donor.isAvailable, true);
  assert.equal(alerts[0].distance, '4.6 km');
  assert.equal(alerts[0].contactPhone, '+91-00000-20001');
  assert.equal(alerts[0].latitude, '22.54');
  assert.equal(history[0].hospital, 'HaemoLogix Demo Medical Centre');
  assert.equal(notifications[0].title, 'Shared demo alert');
  assert.equal(notifications[0].alertId, 'demo-alert-active');
});

test('handles unchanged polling responses without replacing state', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(null, { status: 204 });
  try {
    assert.equal(await fetchDemoSnapshot(7), null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('retries a network failure with the same idempotency action ID', async () => {
  const originalFetch = globalThis.fetch;
  const bodies: string[] = [];
  let attempts = 0;
  globalThis.fetch = async (_input, init) => {
    attempts += 1;
    bodies.push(String(init?.body));
    if (attempts === 1) throw new TypeError('connection interrupted');
    return new Response(JSON.stringify({ ok: true, revision: 8, duplicate: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };
  try {
    await performDemoAction(
      { type: 'DONOR_SET_AVAILABILITY', payload: { available: false } },
      'same-action-id'
    );
    assert.equal(attempts, 2);
    assert.equal(JSON.parse(bodies[0]).actionId, 'same-action-id');
    assert.equal(JSON.parse(bodies[1]).actionId, 'same-action-id');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('preserves reset cooldown details for the mobile confirmation flow', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'The shared demo was reset recently', retryAfterSeconds: 12 }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
  try {
    await assert.rejects(
      resetDemoSandbox(),
      (error: unknown) => error instanceof DemoApiError && error.status === 429 && error.retryAfterSeconds === 12
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
