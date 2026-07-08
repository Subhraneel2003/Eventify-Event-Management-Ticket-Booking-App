import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert, Keyboard } from 'react-native';
import AddReviewScreen from '../../../src/screens/Reviews/AddReviewScreen';

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

const mockPost = jest.fn();
jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    post: (...args) => mockPost(...args),
  },
}));

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Test User' },
    token: 'mock-token',
    loading: false,
  }),
}));

jest.spyOn(Alert, 'alert');
jest.spyOn(Keyboard, 'dismiss');

const mockGoBack = jest.fn();
const navigation = { goBack: mockGoBack };
const route = { params: { eventId: 'e1', bookingId: 'b1' } };

describe('AddReviewScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the complete UI correctly', () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(
      <AddReviewScreen navigation={navigation} route={route} />
    );
    expect(getByText('Write a Review')).toBeTruthy();
    expect(getByText('HOW WAS YOUR EXPERIENCE?')).toBeTruthy();
    expect(getAllByText('star-outline').length).toBe(5);
    expect(getByPlaceholderText('Write your review here...')).toBeTruthy();
    expect(getByText('Submit Review')).toBeTruthy();
    expect(getByText('SHARE YOUR THOUGHTS')).toBeTruthy();
  });

  it('updates star rating when a star is pressed', () => {
    const { getAllByText, queryAllByText } = render(
      <AddReviewScreen navigation={navigation} route={route} />
    );

    const starOutlines = getAllByText('star-outline');
    fireEvent.press(starOutlines[2]);

    const filledStars = queryAllByText('star');
    expect(filledStars.length).toBeGreaterThanOrEqual(3);
  });

  it('validates fields on submission', async () => {
    const { getByText, getAllByText, getByPlaceholderText } = render(
      <AddReviewScreen navigation={navigation} route={route} />
    );

    fireEvent.changeText(
      getByPlaceholderText('Write your review here...'),
      'Great event!'
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Review'));
    });

    expect(Alert.alert).toHaveBeenLastCalledWith(
      'Required',
      'Please select a star rating.'
    );

    Alert.alert.mockClear();

    const starOutlines = getAllByText('star-outline');
    fireEvent.press(starOutlines[3]);
    fireEvent.changeText(
      getByPlaceholderText('Write your review here...'),
      ''
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Review'));
    });

    expect(Alert.alert).toHaveBeenLastCalledWith(
      'Required',
      'Please write a brief comment.'
    );

    Alert.alert.mockClear();

    fireEvent.changeText(
      getByPlaceholderText('Write your review here...'),
      '   '
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Review'));
    });

    expect(Alert.alert).toHaveBeenLastCalledWith(
      'Required',
      'Please write a brief comment.'
    );
  });

  it('submits review successfully with trimmed comment', async () => {
    mockPost.mockResolvedValueOnce({ data: { id: 'r1' } });

    const { getByText, getAllByText, getByPlaceholderText } = render(
      <AddReviewScreen navigation={navigation} route={route} />
    );

    const starOutlines = getAllByText('star-outline');
    fireEvent.press(starOutlines[3]);

    fireEvent.changeText(
      getByPlaceholderText('Write your review here...'),
      '  Amazing event, highly recommend!  '
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Review'));
    });

    await waitFor(() => {
      expect(Keyboard.dismiss).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith(
        '/reviews',
        expect.objectContaining({
          userId: 'u1',
          eventId: 'e1',
          bookingId: 'b1',
          rating: 4,
          comment: 'Amazing event, highly recommend!',
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith(
        'Success',
        'Thank you! Your review has been submitted.',
        expect.any(Array)
      );
    });
  });

  it('handles error states and close button presses', async () => {
    mockPost.mockRejectedValueOnce(new Error('Server Error'));

    const { getByText, getAllByText, getByPlaceholderText } = render(
      <AddReviewScreen navigation={navigation} route={route} />
    );

    const starOutlines = getAllByText('star-outline');
    fireEvent.press(starOutlines[4]);

    fireEvent.changeText(
      getByPlaceholderText('Write your review here...'),
      'Great event!'
    );

    await act(async () => {
      fireEvent.press(getByText('Submit Review'));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to submit review. Please try again.'
      );
    });

    const closeIcons = getAllByText('close');
    fireEvent.press(closeIcons[0]);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
