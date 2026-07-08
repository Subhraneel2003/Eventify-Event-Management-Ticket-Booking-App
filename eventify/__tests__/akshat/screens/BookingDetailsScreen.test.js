import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingDetailsScreen from '../../../src/screens/Bookings/BookingDetailsScreen';

// --- Mocks ---

jest.mock('../../../src/context/ThemeContext', () => ({
  ThemeContext: {
    ...jest.requireActual('react').createContext({
      colors: {
        background: '#fff',
        text: '#000',
        surface: '#f5f5f5',
        primary: '#6200ee',
        textSecondary: '#666',
        border: '#ddd',
        danger: '#f44336',
      },
      isDark: false,
    }),
  },
}));

const mockGet = jest.fn();
const mockPatch = jest.fn();
jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockGet(...args),
    patch: (...args) => mockPatch(...args),
  },
}));

const mockFetchEventById = jest.fn();
const mockUpdateEventSeats = jest.fn();
jest.mock('../../../src/api/eventService', () => ({
  fetchEventById: (...args) => mockFetchEventById(...args),
  updateEventSeats: (...args) => mockUpdateEventSeats(...args),
}));

const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      bookings: { bookings: [] },
      auth: { user: { id: 'u1' }, token: 'mock-token' },
    }),
}));

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test User' },
    token: 'mock-token',
    loading: false,
  }),
}));

jest.mock('../../../src/store/slices/bookingSlice', () => ({
  cancelBooking: jest.fn((id) => ({
    type: 'booking/cancelBooking',
    payload: id,
  })),
}));

jest.mock('../../../src/utils/qrManager', () => ({
  getQRData: jest.fn(
    () => '{"bookingId":"b1","eventId":"e1","userId":"u1","qrCode":"qr123"}'
  ),
}));

jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const navigation = { goBack: mockGoBack, navigate: mockNavigate };

const mockBooking = {
  id: 'b1',
  eventId: 'e1',
  userId: 'u1',
  ticketCount: 2,
  totalAmount: 1000,
  status: 'confirmed',
  qrCode: 'qr123',
};

const mockEvent = {
  id: 'e1',
  title: 'Tech Conference 2025',
  venueName: 'Convention Center',
  date: '2025-08-15',
  time: '10:00',
  price: 500,
  location: { latitude: 28.6139, longitude: 77.209 },
  address: '123 Main St',
};

describe('BookingDetailsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles loading states and missing bookingId', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGet.mockReturnValue(promise);

    let renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );
    expect(renderResult.queryByText('Booking Details')).toBeNull();

    resolvePromise({ data: mockBooking });
    await act(async () => {
      await promise;
    });
    renderResult.unmount();

    renderResult = render(
      <BookingDetailsScreen navigation={navigation} route={{ params: {} }} />
    );
    expect(await renderResult.findByText('No booking selected')).toBeTruthy();

    const goBackBtn = await renderResult.findByText('Go Back');
    await act(async () => {
      fireEvent.press(goBackBtn);
    });
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('handles API loading failures and retry requests', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    const { findByText } = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    expect(await findByText(/Something went wrong/)).toBeTruthy();
    expect(await findByText('Retry')).toBeTruthy();
  });

  it('renders booking details correctly under different data conditions', async () => {
    mockGet.mockResolvedValueOnce({ data: mockBooking });
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    let renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    expect(await renderResult.findByText('Booking Details')).toBeTruthy();
    expect(await renderResult.findByText('Tech Conference 2025')).toBeTruthy();
    expect(await renderResult.findByText('2')).toBeTruthy();
    expect(await renderResult.findByText('₹ 1000')).toBeTruthy();
    renderResult.unmount();

    const freeBooking = { ...mockBooking, totalAmount: 0 };
    const freeEvent = { ...mockEvent, price: 0 };
    mockGet.mockResolvedValueOnce({ data: freeBooking });
    mockFetchEventById.mockResolvedValueOnce(freeEvent);

    renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    const freeTexts = await renderResult.findAllByText('Free');
    expect(freeTexts.length).toBeGreaterThanOrEqual(1);
    renderResult.unmount();

    const refundBooking = {
      ...mockBooking,
      status: 'cancelled_by_organizer',
      refundStatus: 'pending',
    };
    mockGet.mockResolvedValueOnce({ data: refundBooking });
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    expect(await renderResult.findByText(/Refund Status/)).toBeTruthy();
    renderResult.unmount();

    mockGet.mockResolvedValueOnce({ data: { ...mockBooking, eventId: null } });

    renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    expect(await renderResult.findByText('Unknown Event')).toBeTruthy();
  });

  it('renders action buttons based on booking status', async () => {
    mockGet.mockResolvedValueOnce({ data: mockBooking });
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    let renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    expect(await renderResult.findByText('Cancel')).toBeTruthy();
    renderResult.unmount();

    const cancelledBooking = { ...mockBooking, status: 'cancelled' };
    mockGet.mockResolvedValueOnce({ data: cancelledBooking });
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    await renderResult.findByText('Tech Conference 2025');
    expect(renderResult.queryByText('Cancel')).toBeNull();
    renderResult.unmount();

    const usedBooking = { ...mockBooking, status: 'used' };
    mockGet.mockResolvedValueOnce({ data: usedBooking });
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    renderResult = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    const reviewBtn = await renderResult.findByText('Write a Review');
    expect(reviewBtn).toBeTruthy();

    await act(async () => {
      fireEvent.press(reviewBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('AddReview', {
      eventId: 'e1',
      bookingId: 'b1',
    });
  });

  it('handles booking cancellation flows', async () => {
    mockGet.mockResolvedValue({ data: mockBooking });
    mockFetchEventById.mockResolvedValue(mockEvent);

    const { findByText } = render(
      <BookingDetailsScreen
        navigation={navigation}
        route={{ params: { bookingId: 'b1' } }}
      />
    );

    const cancelBtn = await findByText('Cancel');
    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    expect(await findByText('Cancel Booking?')).toBeTruthy();

    const noBtn = await findByText('No');
    await act(async () => {
      fireEvent.press(noBtn);
    });

    await act(async () => {
      fireEvent.press(cancelBtn);
    });

    mockPatch.mockRejectedValueOnce(new Error('Server Error'));
    const yesCancelBtn = await findByText('Yes, Cancel');
    await act(async () => {
      fireEvent.press(yesCancelBtn);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to cancel booking. Please try again.'
      );
    });

    mockPatch.mockResolvedValueOnce({ data: {} });
    mockUpdateEventSeats.mockResolvedValueOnce({});

    await act(async () => {
      fireEvent.press(cancelBtn);
    });
    await act(async () => {
      fireEvent.press(yesCancelBtn);
    });

    await waitFor(() => {
      expect(mockPatch).toHaveBeenCalledWith('/bookings/b1', {
        status: 'cancelled',
      });
      expect(mockUpdateEventSeats).toHaveBeenCalledWith('e1', 2, 'cancelled');
      expect(mockDispatch).toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });
});
