export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  isPremium: boolean;
  createdAt: string;
  expoPushToken?: string;
  hasNotificationsEnabled?: boolean;
  hasLocationEnabled?: boolean;
}

export interface FamilyMember extends User {
  role: 'admin' | 'member';
  location?: Location;
  batteryLevel?: number;
  lastSeen?: string;
  isSharing: boolean;
  isInvited?: boolean
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  createdAt: string;
  ownerId: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
  accuracy?: number;
  speed?: number;
  heading?: number;
}

export interface SafeZone {
  id: string;
  name: string;
  color: string;
  radius: number;
  centerLatitude: number;
  centerLongitude: number;
  membersToTrack: string[]; // User IDs
  isActive: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'emergency' | 'zone_exit' | 'zone_entry' | 'low_battery' | 'heading_home';
  userId: string;
  familyId: string;
  message: string;
  location?: Location;
  timestamp: string;
  read: boolean;
}

export interface BackendAlert {
  id: string;
  type: 'emergency' | 'zone_exit' | 'zone_entry' | 'low_battery' | 'heading_home';
  userId: string;
  familyId: string;
  message: string;
  latitude: number,
  longitude: number,
  accuracy?: number,
  speed?: number,
  heading?: number,
  timestamp: string;
  read: boolean;
}

export interface Subscription {
  id: string;
  name: 'Free' | 'Premium';
  price: number;
  features: string[];
  isPopular?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: string;
  read: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}
