import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { Alert, DonationHistory, DonorData, Notification } from '../lib/types';
import {
  createActionId,
  DemoApiError,
  fetchDemoSnapshot,
  mapDemoAlerts,
  mapDemoDonor,
  mapDemoHistory,
  mapDemoNotifications,
  performDemoAction,
  resetDemoSandbox,
  type DemoDonorAction,
  type DemoSnapshot,
} from '../lib/demoSandbox';

const DEMO_MODE_KEY = 'shared_demo_mode';
const DEMO_SNAPSHOT_KEY = 'shared_demo_snapshot';

interface DemoSandboxContextValue {
  active: boolean;
  initializing: boolean;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  snapshot: DemoSnapshot | null;
  donor: DonorData | null;
  alerts: Alert[];
  history: DonationHistory[];
  notifications: Notification[];
  enterDemo: () => Promise<void>;
  exitDemo: () => Promise<void>;
  refresh: (force?: boolean) => Promise<void>;
  act: (action: DemoDonorAction) => Promise<void>;
  reset: () => Promise<void>;
}

const DemoSandboxContext = createContext<DemoSandboxContextValue | undefined>(undefined);

export function DemoSandboxProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<DemoSnapshot | null>(null);
  const revision = useRef<number | undefined>(undefined);
  const snapshotRef = useRef<DemoSnapshot | null>(null);
  const activeRef = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const saveSnapshot = useCallback(async (next: DemoSnapshot) => {
    setSnapshot(next);
    snapshotRef.current = next;
    revision.current = next.revision;
    try {
      await SecureStore.setItemAsync(DEMO_SNAPSHOT_KEY, JSON.stringify(next));
    } catch (cacheError) {
      console.warn('Unable to cache the demo snapshot:', cacheError);
    }
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!activeRef.current) return;
    try {
      const next = await fetchDemoSnapshot(force ? undefined : revision.current);
      if (next) await saveSnapshot(next);
      setError(null);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : 'Unable to refresh the shared demo.';
      setError(message);
      if (!snapshotRef.current) throw refreshError;
    } finally {
      setLoading(false);
    }
  }, [saveSnapshot]);

  const enterDemo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchDemoSnapshot();
      if (!next) throw new DemoApiError('The shared demo did not return an initial snapshot.');
      activeRef.current = true;
      setActive(true);
      await SecureStore.setItemAsync(DEMO_MODE_KEY, 'true');
      await saveSnapshot(next);
    } catch (enterError) {
      activeRef.current = false;
      setActive(false);
      const message = enterError instanceof Error ? enterError.message : 'Unable to enter the shared demo.';
      setError(message);
      throw enterError;
    } finally {
      setLoading(false);
    }
  }, [saveSnapshot]);

  const exitDemo = useCallback(async () => {
    activeRef.current = false;
    setActive(false);
    setSnapshot(null);
    snapshotRef.current = null;
    revision.current = undefined;
    setError(null);
    await Promise.all([
      SecureStore.deleteItemAsync(DEMO_MODE_KEY),
      SecureStore.deleteItemAsync(DEMO_SNAPSHOT_KEY),
    ]);
  }, []);

  const act = useCallback(async (action: DemoDonorAction) => {
    setMutating(true);
    setError(null);
    const actionId = createActionId();
    try {
      await performDemoAction(action, actionId);
      await refresh(true);
    } catch (actionError) {
      const message = actionError instanceof Error ? actionError.message : 'Unable to update the shared demo.';
      setError(message);
      throw actionError;
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  const reset = useCallback(async () => {
    setMutating(true);
    setError(null);
    try {
      await resetDemoSandbox();
      await refresh(true);
    } catch (resetError) {
      const message = resetError instanceof DemoApiError && resetError.retryAfterSeconds
        ? `${resetError.message}. Try again in ${resetError.retryAfterSeconds} seconds.`
        : resetError instanceof Error
          ? resetError.message
          : 'Unable to reset the shared demo.';
      setError(message);
      throw new Error(message);
    } finally {
      setMutating(false);
    }
  }, [refresh]);

  useEffect(() => {
    let mounted = true;
    async function restore() {
      try {
        const mode = await SecureStore.getItemAsync(DEMO_MODE_KEY);
        if (mode !== 'true' || !mounted) return;
        const cached = await SecureStore.getItemAsync(DEMO_SNAPSHOT_KEY);
        if (cached && mounted) {
          const parsed = JSON.parse(cached) as DemoSnapshot;
          setSnapshot(parsed);
          snapshotRef.current = parsed;
          revision.current = parsed.revision;
        }
        activeRef.current = true;
        setActive(true);
        setLoading(true);
        await refresh(true);
      } catch (restoreError) {
        if (mounted) {
          setError(restoreError instanceof Error ? restoreError.message : 'Unable to restore the shared demo.');
          if (!snapshotRef.current) {
            activeRef.current = false;
            setActive(false);
            await SecureStore.deleteItemAsync(DEMO_MODE_KEY);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      }
    }
    void restore();
    return () => { mounted = false; };
  }, [refresh]);

  useEffect(() => {
    if (!active) return;
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasInactive = appState.current !== 'active';
      appState.current = nextState;
      if (wasInactive && nextState === 'active') void refresh(false);
    });
    const interval = setInterval(() => {
      if (appState.current === 'active') void refresh(false);
    }, 2_000);
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [active, refresh]);

  const mapped = useMemo(() => snapshot ? {
    donor: mapDemoDonor(snapshot.data.donor),
    alerts: mapDemoAlerts(snapshot.data),
    history: mapDemoHistory(snapshot.data),
    notifications: mapDemoNotifications(snapshot.data),
  } : { donor: null, alerts: [], history: [], notifications: [] }, [snapshot]);

  return (
    <DemoSandboxContext.Provider value={{
      active,
      initializing,
      loading,
      mutating,
      error,
      snapshot,
      ...mapped,
      enterDemo,
      exitDemo,
      refresh,
      act,
      reset,
    }}>
      {children}
    </DemoSandboxContext.Provider>
  );
}

export function useDemoSandbox() {
  const context = useContext(DemoSandboxContext);
  if (!context) throw new Error('useDemoSandbox must be used within DemoSandboxProvider');
  return context;
}
