import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BookingScreen from '../../../src/screens/Bookings/BookingScreen';

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
const mockPost = jest.fn();
const mockPatch = jest.fn();
jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
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
  addBooking: jest.fn((payload) => ({ type: 'booking/addBooking', payload })),
}));

jest.spyOn(Alert, 'alert');

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const navigation = { goBack: mockGoBack, navigate: mockNavigate, replace: mockReplace };

const mockEvent = {
  id: 'e1',
  title: 'Tech Conference 2025',
  venueName: 'Convention Center',
  date: '2025-08-15',
  time: '10:00',
  price: 500,
  availableSeats: 50,
};

describe('BookingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles event fetching states', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockFetchEventById.mockReturnValue(promise);

    let renderResult = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );
    expect(renderResult.queryByText('Tech Conference 2025')).toBeNull();

    resolvePromise(mockEvent);
    await act(async () => {
      await promise;
    });
    renderResult.unmount();

    mockFetchEventById.mockRejectedValueOnce(new Error('Network Error'));
    renderResult = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );
    const errorText = await renderResult.findByText(/Something went wrong/);
    expect(errorText).toBeTruthy();

    const retryButton = await renderResult.findByText('Retry');
    expect(retryButton).toBeTruthy();

    mockFetchEventById.mockResolvedValueOnce(mockEvent);
    await act(async () => {
      fireEvent.press(retryButton);
    });

    await waitFor(() => {
      expect(mockFetchEventById).toHaveBeenCalledTimes(3);
    });
  });

  it('renders event details and checkout UI components', async () => {
    mockFetchEventById.mockResolvedValueOnce(mockEvent);
    let renderResult = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );

    expect(await renderResult.findByText('Tech Conference 2025')).toBeTruthy();
    expect(await renderResult.findByText('Convention Center')).toBeTruthy();
    expect(await renderResult.findByText('Book Tickets')).toBeTruthy();
    expect(await renderResult.findByText('Confirm')).toBeTruthy();
    expect(await renderResult.findByText('1')).toBeTruthy();
    renderResult.unmount();

    const freeEvent = { ...mockEvent, price: 0 };
    mockFetchEventById.mockResolvedValueOnce(freeEvent);
    renderResult = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );

    const freeTexts = await renderResult.findAllByText('Free');
    expect(freeTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('displays total price based on ticket count', async () => {
    mockFetchEventById.mockResolvedValueOnce(mockEvent);

    const { findByText } = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );

    await findByText('Tech Conference 2025');

    const addBtn = await findByText('add');
    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(await findByText('₹ 1000')).toBeTruthy();
  });

  it('confirms booking and navigates to BookingDetails on success', async () => {
    mockFetchEventById.mockResolvedValueOnce(mockEvent);
    mockPost.mockResolvedValueOnce({
      data: { id: 'b1', eventId: 'e1', ticketCount: 1, totalAmount: 500 },
    });
    mockPatch.mockResolvedValueOnce({
      data: {
        id: 'b1',
        eventId: 'e1',
        ticketCount: 1,
        totalAmount: 500,
        qrCode: 'mock-uuid-123',
      },
    });
    mockUpdateEventSeats.mockResolvedValueOnce({});

    const { findByText } = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );

    const confirmButton = await findByText('Confirm');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        '/bookings',
        expect.objectContaining({
          userId: 'u1',
          eventId: 'e1',
          ticketCount: 1,
          totalAmount: 500,
          status: 'confirmed',
        })
      );
      expect(mockReplace).toHaveBeenCalledWith('BookingDetails', {
        bookingId: 'b1',
      });
    });
  });

  it('shows alert when booking confirmation fails', async () => {
    mockFetchEventById.mockResolvedValueOnce(mockEvent);
    mockPost.mockRejectedValueOnce(new Error('Server Error'));

    const { findByText } = render(
      <BookingScreen
        navigation={navigation}
        route={{ params: { eventId: 'e1' } }}
      />
    );

    const confirmButton = await findByText('Confirm');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'An error occured while Booking'
      );
    });
  });
});
