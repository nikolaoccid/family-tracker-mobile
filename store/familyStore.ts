import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Family, FamilyMember, Location, SafeZone } from '@/types';
import { alerts, family, safeZones } from '@/mocks/data';

interface FamilyStore {
  family: Family | null;
  safeZones: SafeZone[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  
  // Family actions
  fetchFamily: () => Promise<void>;
  updateFamilyName: (name: string) => Promise<void>;
  addFamilyMember: (email: string) => Promise<void>;
  removeFamilyMember: (memberId: string) => Promise<void>;
  updateMemberRole: (memberId: string, role: 'admin' | 'member') => Promise<void>;
  
  // Location actions
  updateLocation: (userId: string, location: Location) => Promise<void>;
  toggleLocationSharing: (userId: string, isSharing: boolean) => Promise<void>;
  updateBatteryLevel: (userId: string, level: number) => Promise<void>;
  
  // Safe zone actions
  fetchSafeZones: () => Promise<void>;
  addSafeZone: (zone: Omit<SafeZone, 'id' | 'createdAt'>) => Promise<void>;
  updateSafeZone: (zoneId: string, zone: Partial<SafeZone>) => Promise<void>;
  deleteSafeZone: (zoneId: string) => Promise<void>;
  
  // Alert actions
  fetchAlerts: () => Promise<void>;
  createAlert: (alert: Omit<Alert, 'id' | 'timestamp' | 'read'>) => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  
  clearError: () => void;
}

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set, get) => ({
      family: null,
      safeZones: [],
      alerts: [],
      isLoading: false,
      error: null,
      
      // Family actions
      fetchFamily: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ 
            family, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      updateFamilyName: async (name) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            family: state.family ? { ...state.family, name } : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      addFamilyMember: async (email) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          // Mock new member
          const newMember: FamilyMember = {
            id: Math.random().toString(36).substring(2, 9),
            name: 'New Member',
            email,
            isPremium: false,
            createdAt: new Date().toISOString(),
            role: 'member',
            isSharing: false,
          };
          
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: [...state.family.members, newMember] 
                } 
              : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      removeFamilyMember: async (memberId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: state.family.members.filter(m => m.id !== memberId) 
                } 
              : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      updateMemberRole: async (memberId, role) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: state.family.members.map(m => 
                    m.id === memberId ? { ...m, role } : m
                  ) 
                } 
              : null,
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      // Location actions
      updateLocation: async (userId, location) => {
        try {
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: state.family.members.map(m => 
                    m.id === userId 
                      ? { 
                          ...m, 
                          location,
                          lastSeen: new Date().toISOString() 
                        } 
                      : m
                  ) 
                } 
              : null,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      toggleLocationSharing: async (userId, isSharing) => {
        try {
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: state.family.members.map(m => 
                    m.id === userId ? { ...m, isSharing } : m
                  ) 
                } 
              : null,
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      updateBatteryLevel: async (userId, level) => {
        try {
          set((state) => ({
            family: state.family 
              ? { 
                  ...state.family, 
                  members: state.family.members.map(m => 
                    m.id === userId ? { ...m, batteryLevel: level } : m
                  ) 
                } 
              : null,
          }));
          
          // Create low battery alert if below 20%
          if (level < 20) {
            const member = get().family?.members.find(m => m.id === userId);
            if (member) {
              get().createAlert({
                type: 'low_battery',
                userId,
                message: `${member.name}'s battery is low (${level}%)`,
              });
            }
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      // Safe zone actions
      fetchSafeZones: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ 
            safeZones, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      addSafeZone: async (zone) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const newZone: SafeZone = {
            ...zone,
            id: Math.random().toString(36).substring(2, 9),
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            safeZones: [...state.safeZones, newZone],
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      updateSafeZone: async (zoneId, zone) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            safeZones: state.safeZones.map(z => 
              z.id === zoneId ? { ...z, ...zone } : z
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      deleteSafeZone: async (zoneId) => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set((state) => ({
            safeZones: state.safeZones.filter(z => z.id !== zoneId),
            isLoading: false
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
        }
      },
      
      // Alert actions
      fetchAlerts: async () => {
        set({ isLoading: true, error: null });
        try {
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          set({ 
            alerts, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred', 
            isLoading: false 
          });
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
          
          set((state) => ({
            alerts: [newAlert, ...state.alerts],
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      markAlertAsRead: async (alertId) => {
        try {
          set((state) => ({
            alerts: state.alerts.map(a => 
              a.id === alertId ? { ...a, read: true } : a
            ),
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      deleteAlert: async (alertId) => {
        try {
          set((state) => ({
            alerts: state.alerts.filter(a => a.id !== alertId),
          }));
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred'
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'family-tracker-data',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        family: state.family,
        safeZones: state.safeZones,
        // Don't persist alerts as they should be fetched fresh
      }),
    }
  )
);