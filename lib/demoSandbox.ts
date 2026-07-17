import type { Alert, BloodTypeFormat, DonationHistory, DonorData, Notification } from './types';
import { API_BASE_URL } from './config';

export const DEMO_SANDBOX_ID = 'global' as const;

export type DemoResponseOutcome = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT';

export interface DemoDonor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: BloodTypeFormat;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  available: boolean;
  suspended: boolean;
  isPrimary: boolean;
  lastDonationAt: string | null;
  donationCount: number;
  hemoglobin: number;
  bmi: number;
  recentVaccinations: boolean;
  medications: string | null;
  latitude: number;
  longitude: number;
}

export interface DemoAlertResponse {
  id: string;
  alertId: string;
  donorId: string;
  outcome: DemoResponseOutcome;
  automatic: boolean;
  confirmed: boolean;
  score: number;
  distanceKm: number;
  etaMinutes: number;
  respondedAt: string | null;
}

export interface DemoDonorAlert {
  id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  hospitalLatitude: number;
  hospitalLongitude: number;
  distanceKm: number;
  bloodType: BloodTypeFormat;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  unitsNeeded: number;
  description: string;
  createdAt: string;
  status: 'PENDING' | 'NOTIFIED' | 'MATCHED' | 'FULFILLED';
  response?: DemoAlertResponse;
}

export interface DemoDonorView {
  donor: DemoDonor;
  alerts: DemoDonorAlert[];
  history: Array<{
    id: string;
    date: string;
    hospitalName: string;
    type: string;
    units: number;
    status: 'Completed' | 'Cancelled';
  }>;
  notifications: Array<{
    id: string;
    alertId?: string;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

export interface DemoSnapshot {
  sandboxId: typeof DEMO_SANDBOX_ID;
  revision: number;
  expiresAt: string;
  serverTime: string;
  data: DemoDonorView;
}

export type DemoDonorAction =
  | { type: 'DONOR_SET_AVAILABILITY'; payload: { available: boolean } }
  | { type: 'DONOR_RESPOND'; payload: { alertId: string; outcome: 'ACCEPTED' | 'DECLINED' } };

export class DemoApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryAfterSeconds?: number
  ) {
    super(message);
    this.name = 'DemoApiError';
  }
}

async function parseError(response: Response, fallback: string): Promise<DemoApiError> {
  let body: { error?: string; retryAfterSeconds?: number } = {};
  try {
    body = await response.json();
  } catch {
    // The fallback remains useful when a proxy returns a non-JSON error page.
  }
  return new DemoApiError(body.error || fallback, response.status, body.retryAfterSeconds);
}

function networkMessage(error: unknown): string {
  if (error instanceof DemoApiError) return error.message;
  return `Unable to reach the shared demo at ${API_BASE_URL}. Check your internet connection and try again.`;
}

export async function fetchDemoSnapshot(since?: number): Promise<DemoSnapshot | null> {
  try {
    const query = new URLSearchParams({ view: 'donor' });
    if (since !== undefined) query.set('since', String(since));
    const response = await fetch(`${API_BASE_URL}/api/demo/state?${query.toString()}`, {
      headers: { Accept: 'application/json' },
    });
    if (response.status === 204) return null;
    if (!response.ok) throw await parseError(response, 'Unable to load the shared donor demo.');
    const snapshot = (await response.json()) as DemoSnapshot;
    if (snapshot.sandboxId !== DEMO_SANDBOX_ID) {
      throw new DemoApiError('The server returned an unexpected demo sandbox.');
    }
    return snapshot;
  } catch (error) {
    if (error instanceof DemoApiError) throw error;
    throw new DemoApiError(networkMessage(error));
  }
}

export async function performDemoAction(action: DemoDonorAction, actionId: string): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/demo/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ actionId, action }),
      });
      if (!response.ok) throw await parseError(response, 'Unable to update the shared donor demo.');
      return;
    } catch (error) {
      if (error instanceof DemoApiError) throw error;
      if (attempt === 1) throw new DemoApiError(networkMessage(error));
    }
  }
}

export async function resetDemoSandbox(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/demo/reset`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw await parseError(response, 'Unable to reset the shared donor demo.');
  } catch (error) {
    if (error instanceof DemoApiError) throw error;
    throw new DemoApiError(networkMessage(error));
  }
}

export function createActionId(): string {
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (character) => {
    const value = Math.floor(Math.random() * 16);
    return (character === 'x' ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export function mapDemoDonor(donor: DemoDonor): DonorData {
  return {
    id: donor.id,
    firstName: donor.firstName,
    lastName: donor.lastName,
    email: donor.email,
    phone: donor.phone,
    address: donor.address,
    bloodGroup: donor.bloodGroup,
    status: donor.status,
    isAvailable: donor.available,
    lastDonation: donor.lastDonationAt,
    donationCount: String(donor.donationCount),
    hemoglobin: String(donor.hemoglobin),
    bmi: String(donor.bmi),
    recentVaccinations: donor.recentVaccinations,
    medications: donor.medications || undefined,
    latitude: String(donor.latitude),
    longitude: String(donor.longitude),
  };
}

export function mapDemoAlerts(view: DemoDonorView): Alert[] {
  return view.alerts.map((alert) => ({
    id: alert.id,
    hospitalName: alert.hospitalName,
    hospitalId: alert.hospitalId,
    bloodType: alert.bloodType,
    urgency: alert.urgency,
    unitsNeeded: alert.unitsNeeded,
    description: alert.description,
    location: alert.hospitalAddress,
    contactPhone: alert.hospitalPhone,
    timePosted: alert.createdAt,
    distance: `${alert.distanceKm.toFixed(1)} km`,
    responded: Boolean(alert.response && alert.response.outcome !== 'PENDING'),
    response:
      alert.response?.outcome === 'ACCEPTED'
        ? 'accept'
        : alert.response?.outcome === 'DECLINED'
          ? 'decline'
          : undefined,
    latitude: String(alert.hospitalLatitude),
    longitude: String(alert.hospitalLongitude),
    status: alert.status,
  }));
}

export function mapDemoHistory(view: DemoDonorView): DonationHistory[] {
  return view.history.map((entry) => ({
    id: entry.id,
    date: entry.date,
    hospital: entry.hospitalName,
    bloodType: view.donor.bloodGroup,
    units: entry.units,
    status: entry.status === 'Cancelled' ? 'Cancelled' : 'Completed',
  }));
}

export function mapDemoNotifications(view: DemoDonorView): Notification[] {
  return view.notifications.map((notification) => ({
    id: notification.id,
    type: 'alert',
    title: notification.title,
    message: notification.message,
    timestamp: notification.createdAt,
    read: false,
    alertId: notification.alertId,
  }));
}
