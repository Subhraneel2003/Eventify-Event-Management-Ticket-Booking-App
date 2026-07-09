import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import QrCodeScreen from '../../../../src/screens/QrCodeScanner/QrCodeScreen';

jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ user: { id: '1', name: 'Test User' } })),
}));

jest.mock('../../../../src/api/bookingService', () => ({
  getAllBookings: jest.fn(() => Promise.resolve([])),
}));

jest.mock('expo-camera', () => {
  const React = require('react');
  const { TouchableOpacity, View } = require('react-native');
  return {
    __esModule: true,
    useCameraPermissions: jest.fn(),
    CameraView: ({ children, onBarcodeScanned }) => (
      <TouchableOpacity
        testID="camera-view"
        onPress={() => onBarcodeScanned && onBarcodeScanned({ data: 'mock-qr' })}
      >
        <View>{children}</View>
      </TouchableOpacity>
    ),
  };
});

const expoCamera = require('expo-camera');

jest.mock('../../../../src/services/qrScannerService', () => ({
  markBookingAsUsed: jest.fn(),
  parseQRdata: jest.fn(),
  validateBookingQR: jest.fn(() => ({ id: 'b1' })),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(() => []),
}));

jest.mock('../../../../src/store/slices/bookingSlice', () => ({
  validateBooking: jest.fn((id) => ({ type: 'VALIDATE_BOOKING', payload: id })),
}));

jest.mock('../../../../src/components/Button', () => ({ title, onPress }) => {
  const React = require('react');
  const { TouchableOpacity, Text } = require('react-native');
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

jest.mock('../../../../src/services/storageService', () => ({
  clearAsyncStorageData: jest.fn(),
}));

jest.mock('../../../../src/utils/tokenManager', () => ({
  generateToken: jest.fn(),
  isTokenValid: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

describe('QrCodeScreen', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require('react-redux').useDispatch.mockReturnValue(mockDispatch);
    Alert.alert = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders scan screen when camera permission is granted', () => {
    expoCamera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    const { getByText } = render(<QrCodeScreen navigation={{ goBack: jest.fn() }} />);

    expect(getByText('Scan Event Ticket')).toBeTruthy();
  });

  it('validates booking and shows success alert when QR is scanned successfully', async () => {
    expoCamera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    require('../../../../src/api/bookingService').getAllBookings.mockResolvedValue([
      { id: 'b1', eventId: 'e1' },
    ]);
    require('../../../../src/services/qrScannerService').parseQRdata.mockReturnValue({ bookingId: 'b1' });
    require('../../../../src/services/qrScannerService').validateBookingQR.mockReturnValue({ id: 'b1' });
    require('../../../../src/services/qrScannerService').markBookingAsUsed.mockResolvedValue({ id: 'b1', used: true });
    require('react-redux').useSelector.mockReturnValue([{ id: 'e1' }]);

    const goBack = jest.fn();
    const { getByTestId } = render(<QrCodeScreen navigation={{ goBack }} />);

    fireEvent.press(getByTestId('camera-view'));

    await waitFor(() => {
      expect(require('../../../../src/services/qrScannerService').markBookingAsUsed).toHaveBeenCalledWith('b1');
      expect(mockDispatch).toHaveBeenCalledWith(require('../../../../src/store/slices/bookingSlice').validateBooking('b1'));
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Booking Verified',
        expect.any(Array)
      );
    });

    const alertButtons = Alert.alert.mock.calls[0][2];
    alertButtons[0].onPress();

    expect(goBack).toHaveBeenCalled();
  });

  it('shows validation failed alert when QR scan validation fails', async () => {
    expoCamera.useCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    require('../../../../src/api/bookingService').getAllBookings.mockResolvedValue([
      { id: 'b1', eventId: 'e1' },
    ]);
    require('../../../../src/services/qrScannerService').parseQRdata.mockReturnValue({ bookingId: 'b1' });
    require('../../../../src/services/qrScannerService').validateBookingQR.mockImplementation(() => {
      throw new Error('Invalid QR');
    });
    require('react-redux').useSelector.mockReturnValue([{ id: 'e1' }]);

    const goBack = jest.fn();
    const { getByTestId } = render(<QrCodeScreen navigation={{ goBack }} />);

    fireEvent.press(getByTestId('camera-view'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Validation Failed',
        'Invalid QR',
        expect.any(Array)
      );
    });

    const alertButtons = Alert.alert.mock.calls[0][2];
    alertButtons[0].onPress();

    expect(goBack).toHaveBeenCalled();
  });
});
