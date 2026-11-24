process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.test';

// Native modules the app touches. Each mock keeps just enough behaviour for the code under test.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(async () => false),
}));

jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3, Highest: 6 },
  ActivityType: { Other: 1 },
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  getForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getBackgroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestBackgroundPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(async () => ({
    coords: { latitude: 48.8584, longitude: 2.2945, accuracy: 5, speed: null, heading: null },
    timestamp: Date.now(),
  })),
  startLocationUpdatesAsync: jest.fn(async () => undefined),
  stopLocationUpdatesAsync: jest.fn(async () => undefined),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-battery', () => ({ getBatteryLevelAsync: jest.fn(async () => 0.8) }));

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(() => ({ isConnected: true })),
}));

jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Stub = (props: object) => React.createElement(View, props);
  return { __esModule: true, default: Stub, Marker: Stub, Circle: Stub, PROVIDER_GOOGLE: 'google' };
});

jest.mock('@stripe/stripe-react-native', () => ({
  StripeProvider: ({ children }: { children: unknown }) => children,
  useStripe: () => ({
    initPaymentSheet: jest.fn(async () => ({})),
    presentPaymentSheet: jest.fn(async () => ({})),
  }),
}));

jest.mock('stream-chat', () => ({ StreamChat: { getInstance: jest.fn() } }));
jest.mock('stream-chat-react-native', () => ({
  Chat: 'Chat',
  Channel: 'Channel',
  MessageList: 'MessageList',
  MessageInput: 'MessageInput',
  OverlayProvider: ({ children }: { children: unknown }) => children,
}));

jest.mock('expo-auth-session/providers/google', () => ({
  useAuthRequest: () => [null, null, jest.fn()],
}));
