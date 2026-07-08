import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import ReviewsScreen from '../../../src/screens/Reviews/ReviewsScreen';

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

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test User' },
    token: 'mock-token',
    loading: false,
  }),
}));

const mockGoBack = jest.fn();
const navigation = { goBack: mockGoBack };
const route = { params: { eventId: 'e1' } };

describe('ReviewsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header, loading, and empty states', async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockGet.mockReturnValue(promise);

    let renderResult = render(
      <ReviewsScreen navigation={navigation} route={route} />
    );
    expect(renderResult.getByText('Reviews')).toBeTruthy();

    resolvePromise({ data: [] });
    await act(async () => {
      await promise;
    });
    renderResult.unmount();

    mockGet.mockResolvedValueOnce({ data: [] });
    renderResult = render(<ReviewsScreen navigation={navigation} route={route} />);

    expect(await renderResult.findByText('No Reviews Yet')).toBeTruthy();
    expect(
      await renderResult.findByText('Be the first to share your experience!')
    ).toBeTruthy();
  });

  it('handles API error states and retries', async () => {
    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    const { findByText } = render(
      <ReviewsScreen navigation={navigation} route={route} />
    );

    expect(await findByText('Failed to load reviews')).toBeTruthy();
    expect(await findByText('Retry')).toBeTruthy();
  });

  it('renders reviews list and review cards correctly', async () => {
    const reviewsData = [
      {
        id: 'r1',
        userId: 'u2',
        rating: 4,
        comment: 'Great event, well organized!',
        createdAt: '2025-08-16T10:30:00Z',
        user: { name: 'Jane Doe', profileImage: '' },
      },
      {
        id: 'r2',
        userId: 'u3',
        rating: 3,
        comment: 'Anonymous comment',
        createdAt: '2025-08-17T10:30:00Z',
        user: null,
      },
    ];
    mockGet.mockResolvedValueOnce({ data: reviewsData });

    const { findByText } = render(
      <ReviewsScreen navigation={navigation} route={route} />
    );

    expect(await findByText('Jane Doe')).toBeTruthy();
    expect(await findByText('Great event, well organized!')).toBeTruthy();
    expect(await findByText('J')).toBeTruthy();

    expect(await findByText('Unknown User')).toBeTruthy();
    expect(await findByText('Anonymous comment')).toBeTruthy();
  });

  it('calculates and displays review count and average rating correctly', async () => {
    const reviewsData = [
      {
        id: 'r1',
        userId: 'u2',
        rating: 4,
        comment: 'Good',
        createdAt: '2025-08-16T10:30:00Z',
        user: { name: 'User A' },
      },
      {
        id: 'r2',
        userId: 'u3',
        rating: 5,
        comment: 'Excellent',
        createdAt: '2025-08-17T10:30:00Z',
        user: { name: 'User B' },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: reviewsData });

    let renderResult = render(
      <ReviewsScreen navigation={navigation} route={route} />
    );

    expect(await renderResult.findByText('4.5')).toBeTruthy();
    expect(await renderResult.findByText('2 reviews')).toBeTruthy();
    renderResult.unmount();

    const singleReview = [
      {
        id: 'r1',
        userId: 'u2',
        rating: 5,
        comment: 'Awesome!',
        createdAt: '2025-08-16T10:30:00Z',
        user: { name: 'User A' },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: singleReview });

    renderResult = render(<ReviewsScreen navigation={navigation} route={route} />);
    expect(await renderResult.findByText('1 review')).toBeTruthy();
  });

  it('displays "You" badge selectively based on userId', async () => {
    const reviewsData = [
      {
        id: 'r1',
        userId: 'u1',
        rating: 5,
        comment: 'My review',
        createdAt: '2025-08-16T10:30:00Z',
        user: { name: 'Test User' },
      },
      {
        id: 'r2',
        userId: 'u2',
        rating: 4,
        comment: 'Other review',
        createdAt: '2025-08-17T10:30:00Z',
        user: { name: 'Other User' },
      },
    ];
    mockGet.mockResolvedValueOnce({ data: reviewsData });

    const { findByText, queryAllByText } = render(
      <ReviewsScreen navigation={navigation} route={route} />
    );

    await findByText('My review');
    await findByText('Other review');

    expect(queryAllByText('You').length).toBe(1);
  });
});
