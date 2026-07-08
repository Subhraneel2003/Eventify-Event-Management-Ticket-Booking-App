// Global mock for @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
    MaterialIcons: ({ name, ...props }) => <Text {...props}>{name}</Text>,
    FontAwesome: ({ name, ...props }) => <Text {...props}>{name}</Text>,
    AntDesign: ({ name, ...props }) => <Text {...props}>{name}</Text>,
  };
});

// Global mock for expo-checkbox
jest.mock('expo-checkbox', () => {
  const { View } = require('react-native');
  return (props) => <View testID="checkbox" {...props} />;
});

// Global mock for react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Global mock for react-native-qrcode-svg
jest.mock('react-native-qrcode-svg', () => 'QRCode');

// Global mock for react-native-maps
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MapView = (props) => <View testID="map-view" {...props} />;
  const Marker = (props) => <View testID="map-marker" {...props} />;
  MapView.Marker = Marker;
  return { __esModule: true, default: MapView, Marker };
});

// Global mock for expo-crypto
jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid-123'),
}));

// Global mock for @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback) => {
    const React = require('react');
    React.useEffect(() => {
      callback();
    }, []);
  },
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Global mock for tokenManager
jest.mock('./src/utils/tokenManager', () => ({
  generateToken: jest.fn(() => 'mock-token-123'),
  isTokenValid: jest.fn(() => true),
}));

// Global mock for storageService
jest.mock('./src/services/storageService', () => ({
  saveAuthData: jest.fn(() => Promise.resolve()),
  saveBookings: jest.fn(() => Promise.resolve()),
  clearAsyncStorageData: jest.fn(),
}));

// Global mock for notificationService
jest.mock('./src/services/notificationService', () => ({
  scheduleBookingConfirmation: jest.fn(() => Promise.resolve()),
  scheduleEventReminder: jest.fn(() => Promise.resolve()),
  scheduleEventReminderDemo: jest.fn(() => Promise.resolve()),
}));
