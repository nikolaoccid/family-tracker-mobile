// Full family store with real APIs, location history, analytics, and throttling

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Family,
  FamilyMember,
  Location,
  SafeZone,
  LocationHistory,
  ZoneAnalytics,
} from '@/types';
import { familyController } from '@/api/familyController';
import { safeZoneController } from '@/api/safeZoneController';
import { alertController } from '@/api/alertController';
import { locationController } from '@/api/locationController';

interface FamilyStore {
  family: Family | null;
  safeZones: SafeZone[];
  alerts: Alert[];
  readAlertIds: Set<string>;
  locationHistory: LocationHistory[];
  zoneAnalytics: ZoneAnalytics[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: Record<string, number>;

  fetchFamily: () => Promise<void>;
  createFamily: (name: string) => Promise<void>;
  updateFamilyName: (name: string) => Promise<void>;
  deleteFamily: () => Promise<void>;
  addFamilyMember: (email: string) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;

  updateLocation: (location: Location) => Promise<void>;
  toggleLocationSharing: (isSharing: boolean) => Promise<void>;
  updateBatteryLevel: (level: number) => Promise<void>;

  fetchSafeZones: () => Promise<void>;
  addSafeZone: (zone: Omit<SafeZone, 'id' | 'createdAt'>) => Promise<void>;
  updateSafeZone: (zoneId: string, zone: Partial<SafeZone>) => Promise<void>;
  deleteSafeZone: (zoneId: string) => Promise<void>;

  fetchAlerts: () => Promise<void>;
  createAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  filteredAlerts: () => Alert[];

  fetchLocationHistory: (userId: string, startDate: string, endDate: string) => Promise<void>;
  clearLocationHistory: () => void;

  fetchZoneAnalytics: (zoneId: string, startDate: string, endDate: string, userId?: string) => Promise<void>;
  fetchAllZonesAnalytics: (startDate: string, endDate: string, userId?: string) => Promise<void>;
  clearZoneAnalytics: () => void;

  clearError: () => void;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      family: null,
      safeZones: [],
      alerts: [],
      readAlertIds: new Set<string>(),
      locationHistory: [],
      zoneAnalytics: [],
      isLoading: false,
      error: null,
      lastFetchTime: {
        family: 0,
        safeZones: 0,
        alerts: 0,
        locationHistory: 0,
        zoneAnalytics: 0,
      },

      fetchFamily: async () => {
        const now = Date.now();
        if (now - get().lastFetchTime.family < 10000 && get().family) return;
        set({ isLoading: true, error: null });
        try {
          const data = await familyController.getFamily('00000000-0000-0000-0000-000000000000');
          set({ family: data, isLoading: false, lastFetchTime: { ...get().lastFetchTime, family: now } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false, family: null });
        }
      },

      createFamily: async (name) => {
        set({ isLoading: true, error: null });
        try {
          const newFamily = await familyController.createFamily({ name });
          set({ family: newFamily, isLoading: false });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'An error occurred', isLoading: false });
        }
      },

      updateFamilyName: async (name) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const updated = await familyController.updateFamily(familyId, { name });
          set({ family: updated, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      deleteFamily: async () => {
        set({ isLoading: true, error: null });
        try {
          await familyController.deleteFamily({ id: get().family?.id });
          set({ family: null, isLoading: false });
        } catch (e) {
          set({ error: e instanceof Error ? e.message : 'An error occurred', isLoading: false });
        }
      },

      addFamilyMember: async (email) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const updated = await familyController.addFamilyMember(familyId, email);
          set({ family: updated, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      removeFamilyMember: async (memberId) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const updated = await familyController.removeFamilyMember(familyId, memberId);
          set({ family: updated, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      updateMemberRole: async (memberId, role) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const updated = await familyController.updateMemberRole(familyId, memberId, role);
          set({ family: updated, isLoading: false });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      updateLocation: async (location) => {
        try {
          await locationController.sendLocation(location);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      toggleLocationSharing: async (isSharing) => {
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const updated = await familyController.toggleLocationSharing(familyId, isSharing);
          set({ family: updated });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      updateBatteryLevel: async (level) => {
        try {
          await locationController.updateBatteryLevel(level);
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      fetchSafeZones: async () => {
        const now = Date.now();
        if (now - get().lastFetchTime.safeZones < 10000 && get().safeZones.length > 0) return;
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const zones = await safeZoneController.getSafeZones(familyId);
          set({ safeZones: zones, isLoading: false, lastFetchTime: { ...get().lastFetchTime, safeZones: now } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      addSafeZone: async (zone) => {
        set({ isLoading: true, error: null });
        try {
          const newZone = await safeZoneController.createSafeZone(zone, get().family?.id ?? '');
          set((state) => ({ safeZones: [...state.safeZones, newZone], isLoading: false }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      updateSafeZone: async (zoneId, zone) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id ?? '';
          const updated = await safeZoneController.updateSafeZone(zoneId, zone, familyId);
          set((state) => ({
            safeZones: state.safeZones.map((z) => (z.id === zoneId ? updated : z)),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      deleteSafeZone: async (zoneId) => {
        set({ isLoading: true, error: null });
        try {
          await safeZoneController.deleteSafeZone(zoneId);
          set((state) => ({
            safeZones: state.safeZones.filter((z) => z.id !== zoneId),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      fetchAlerts: async () => {
        const now = Date.now();
        if (now - get().lastFetchTime.alerts < 10000 && get().alerts.length > 0) return;
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const alerts = await alertController.getAlerts(familyId);
          set({ alerts, isLoading: false, lastFetchTime: { ...get().lastFetchTime, alerts: now } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      createAlert: async (alert) => {
        try {
          const newAlert: Alert = {
            ...alert,
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
          };
          set((state) => ({ alerts: [newAlert, ...state.alerts] }));
          if (alert.location) {
            const { latitude, longitude, timestamp, accuracy, speed, heading } = alert.location;
            if (alert.type === 'emergency') {
              await alertController.createEmergencyAlert({ ...alert, latitude, longitude, timestamp, accuracy, speed, heading });
            } else if (alert.type === 'heading_home') {
              await alertController.createHeadingHomeAlert({ ...alert, latitude, longitude, timestamp, accuracy, speed, heading });
            }
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      markAlertAsRead: async (alertId) => {
        try {
          set((state) => ({ readAlertIds: new Set(state.readAlertIds).add(alertId) }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      deleteAlert: async (alertId) => {
        try {
          await alertController.deleteAlert(alertId);
          set((state) => ({
            alerts: state.alerts.filter((a) => a.id !== alertId),
            readAlertIds: new Set([...state.readAlertIds].filter((id) => id !== alertId)),
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      filteredAlerts: () => {
        const { alerts, readAlertIds } = get();
        const now = new Date();
        return alerts
          .map((alert) => {
            const alertDate = new Date(alert.timestamp);
            const isOlderThan24Hours = now.getTime() - alertDate.getTime() > 86400000;
            return { ...alert, read: isOlderThan24Hours || readAlertIds.has(alert.id) };
          })
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      fetchLocationHistory: async (userId, startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const history = await locationController.getDetailedLocationHistory(userId, {
            startDate,
            endDate,
            includePrivacyInfo: true,
          });
          set({ locationHistory: history, isLoading: false, lastFetchTime: { ...get().lastFetchTime, locationHistory: Date.now() } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      clearLocationHistory: () => {
        set({ locationHistory: [] });
      },

      fetchZoneAnalytics: async (zoneId, startDate, endDate, userId) => {
        set({ isLoading: true, error: null });
        try {
          const analytics = await safeZoneController.getZoneAnalytics(zoneId, { startDate, endDate, userId });
          set({ zoneAnalytics: [analytics], isLoading: false, lastFetchTime: { ...get().lastFetchTime, zoneAnalytics: Date.now() } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      fetchAllZonesAnalytics: async (startDate, endDate, userId) => {
        set({ isLoading: true, error: null });
        try {
          const familyId = get().family?.id;
          if (!familyId) throw new Error('Family ID not found');
          const analytics = await safeZoneController.getAllZonesAnalytics(familyId, { startDate, endDate, userId });
          set({ zoneAnalytics: analytics, isLoading: false, lastFetchTime: { ...get().lastFetchTime, zoneAnalytics: Date.now() } });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'An error occurred', isLoading: false });
        }
      },

      clearZoneAnalytics: () => {
        set({ zoneAnalytics: [] });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'family-tracker-data',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        family: state.family,
        safeZones: state.safeZones,
        readAlertIds: Array.from(state.readAlertIds),
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<FamilyStore>;
        // Ensure required fields are never undefined
        return {
          ...current,
          ...p,
          family: p.family !== undefined ? p.family : current.family,
          safeZones: p.safeZones !== undefined ? p.safeZones : current.safeZones,
          alerts: p.alerts !== undefined ? p.alerts : current.alerts,
          readAlertIds: new Set((p.readAlertIds ?? []) as string[]),
          locationHistory: p.locationHistory !== undefined ? p.locationHistory : current.locationHistory,
          zoneAnalytics: p.zoneAnalytics !== undefined ? p.zoneAnalytics : current.zoneAnalytics,
          isLoading: p.isLoading !== undefined ? p.isLoading : current.isLoading,
          error: p.error !== undefined ? p.error : current.error,
          lastFetchTime: p.lastFetchTime !== undefined ? p.lastFetchTime : current.lastFetchTime,
          // Add all other required fields similarly if needed
          fetchFamily: current.fetchFamily,
          createFamily: current.createFamily,
          updateFamilyName: current.updateFamilyName,
          deleteFamily: current.deleteFamily,
          addFamilyMember: current.addFamilyMember,
          removeFamilyMember: current.removeFamilyMember,
          updateMemberRole: current.updateMemberRole,
          updateLocation: current.updateLocation,
          toggleLocationSharing: current.toggleLocationSharing,
          updateBatteryLevel: current.updateBatteryLevel,
          fetchSafeZones: current.fetchSafeZones,
          addSafeZone: current.addSafeZone,
          updateSafeZone: current.updateSafeZone,
          deleteSafeZone: current.deleteSafeZone,
          fetchAlerts: current.fetchAlerts,
          createAlert: current.createAlert,
          markAlertAsRead: current.markAlertAsRead,
          deleteAlert: current.deleteAlert,
          filteredAlerts: current.filteredAlerts,
          fetchLocationHistory: current.fetchLocationHistory,
          clearLocationHistory: current.clearLocationHistory,
          fetchZoneAnalytics: current.fetchZoneAnalytics,
          fetchAllZonesAnalytics: current.fetchAllZonesAnalytics,
          clearZoneAnalytics: current.clearZoneAnalytics,
          clearError: current.clearError,
        };
      },
    }
  )
);
