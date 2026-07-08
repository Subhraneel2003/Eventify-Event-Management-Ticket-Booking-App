import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MyBookingsScreen from '../../../src/screens/Bookings/MyBookingsScreen';

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
jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockGet(...args),
  },
}));

const mockDispatch = jest.fn();
let mockBookings = [];
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector) =>
    selector({
      bookings: { bookings: mockBookings },
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
  setBookings: jest.fn((payload) => ({
    type: 'booking/setBookings',
    payload,
  })),
}));

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

describe('MyBookingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBookings = [];
  });

  it('renders header, loading, and empty states', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGet.mockReturnValue(promise);

    let renderResult = render(<MyBookingsScreen navigation={navigation} />);
    expect(renderResult.queryByText('Bookings')).toBeTruthy();

    resolvePromise({ data: [] });
    await act(async () => {
      await promise;
    });
    renderResult.unmount();

    mockGet.mockResolvedValueOnce({ data: [] });
    renderResult = render(<MyBookingsScreen navigation={navigation} />);

    expect(await renderResult.findByText('No Bookings Yet')).toBeTruthy();
    expect(
      await renderResult.findByText('Your bookings will appear here once you book an event.')
    ).toBeTruthy();
  });

  it('dispatches setBookings with fetched data', async () => {
    const bookingsData = [
      {
        id: 'b1',
        ticketCount: 2,
        totalAmount: 1000,
        status: 'confirmed',
        event: {
          title: 'Tech Conference',
          date: '2025-08-15',
        },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: bookingsData });

    render(<MyBookingsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'booking/setBookings',
          payload: bookingsData,
        })
      );
    });
  });

  it('renders booking cards with correct details and status badges', async () => {
    const bookingsData = [
      {
        id: 'b1',
        ticketCount: 2,
        totalAmount: 1000,
        status: 'confirmed',
        event: {
          title: 'Tech Conference',
          date: '2025-08-15',
        },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: bookingsData });
    mockBookings = bookingsData;

    let renderResult = render(
      <MyBookingsScreen navigation={navigation} />
    );

    expect(await renderResult.findByText('Tech Conference')).toBeTruthy();
    expect(await renderResult.findByText('No of Tickets: 2')).toBeTruthy();
    expect(await renderResult.findByText('₹ 1000')).toBeTruthy();
    expect(await renderResult.findByText('Confirmed')).toBeTruthy();
    renderResult.unmount();

    const mixBookingsData = [
      {
        id: 'b2',
        ticketCount: 1,
        totalAmount: 0,
        status: 'cancelled',
        event: null,
      },
    ];
    mockGet.mockResolvedValueOnce({ data: mixBookingsData });
    mockBookings = mixBookingsData;

    renderResult = render(<MyBookingsScreen navigation={navigation} />);

    expect(await renderResult.findByText('Free')).toBeTruthy();
    expect(await renderResult.findByText('Unknown Event')).toBeTruthy();
    expect(await renderResult.findByText('Cancelled')).toBeTruthy();
  });

  it('navigates to BookingDetails when a booking card is pressed', async () => {
    const bookingsData = [
      {
        id: 'b1',
        ticketCount: 2,
        totalAmount: 1000,
        status: 'confirmed',
        event: {
          title: 'Tech Conference',
          date: '2025-08-15',
        },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: bookingsData });
    mockBookings = bookingsData;

    const { findByText } = render(
      <MyBookingsScreen navigation={navigation} />
    );

    const eventTitle = await findByText('Tech Conference');
    await act(async () => {
      fireEvent.press(eventTitle);
    });

    expect(mockNavigate).toHaveBeenCalledWith('BookingDetails', {
      bookingId: 'b1',
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    render(<MyBookingsScreen navigation={navigation} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading bookings',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
