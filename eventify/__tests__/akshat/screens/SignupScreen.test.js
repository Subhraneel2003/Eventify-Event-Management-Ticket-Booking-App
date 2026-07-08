import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignupScreen from '../../../src/screens/Auth/SignupScreen';

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
jest.mock('../../../src/api/apiClient', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    loading: false,
    login: jest.fn(),
  }),
}));

jest.spyOn(Alert, 'alert');

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all UI components correctly', () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(
      <SignupScreen navigation={navigation} />
    );
    expect(getAllByText('Sign Up').length).toBeGreaterThanOrEqual(1);
    expect(getByPlaceholderText('Enter your name')).toBeTruthy();
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByPlaceholderText('Enter your phone number')).toBeTruthy();
    expect(getByText('Be an Organizer')).toBeTruthy();
    expect(getByText('Already have an account?')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
  });

  it('navigates to Login when "Login" link is pressed', () => {
    const { getByText } = render(<SignupScreen navigation={navigation} />);
    fireEvent.press(getByText('Login'));
    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });

  it('shows validation errors for empty fields on submit', async () => {
    const { getAllByText, findByText } = render(
      <SignupScreen navigation={navigation} />
    );

    const signUpButtons = getAllByText('Sign Up');
    await act(async () => {
      fireEvent.press(signUpButtons[signUpButtons.length - 1]);
    });

    await waitFor(() => {
      expect(findByText('Name is required')).toBeTruthy();
    });
  });

  it('handles successful signup with role selection and email trimming', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });
    mockPost.mockResolvedValueOnce({ data: { id: '2' } });

    const { getByPlaceholderText, getAllByText, getByText } = render(
      <SignupScreen navigation={navigation} />
    );

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('Enter your name'),
        'Jane Organizer'
      );
      fireEvent.changeText(
        getByPlaceholderText('Enter your email'),
        'Test@example.com'
      );
      fireEvent.changeText(
        getByPlaceholderText('Enter your password'),
        'password123'
      );
      fireEvent.changeText(
        getByPlaceholderText('Enter your phone number'),
        '9876543210'
      );
    });

    await act(async () => {
      fireEvent.press(getByText('Be an Organizer'));
    });

    const signUpButtons = getAllByText('Sign Up');
    await act(async () => {
      fireEvent.press(signUpButtons[signUpButtons.length - 1]);
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/users', {
        params: { email: 'test@example.com' },
      });
      expect(mockPost).toHaveBeenCalledWith(
        '/users',
        expect.objectContaining({
          name: 'Jane Organizer',
          email: 'test@example.com',
          password: 'password123',
          phone: '9876543210',
          role: 'organizer',
          profileImage: '',
        })
      );
      expect(mockNavigate).toHaveBeenCalledWith('Login');
    });
  });

  it('displays error alerts when user already exists or API fails', async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ id: '1', email: 'john@example.com' }],
    });

    let renderResult = render(<SignupScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your name'),
        'John Doe'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'password123'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your phone number'),
        '9876543210'
      );
    });

    let signUpButtons = renderResult.getAllByText('Sign Up');
    await act(async () => {
      fireEvent.press(signUpButtons[signUpButtons.length - 1]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'User already exists');
    });
    renderResult.unmount();

    Alert.alert.mockClear();

    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    renderResult = render(<SignupScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your name'),
        'John Doe'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your email'),
        'john@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'password123'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your phone number'),
        '9876543210'
      );
    });

    signUpButtons = renderResult.getAllByText('Sign Up');
    await act(async () => {
      fireEvent.press(signUpButtons[signUpButtons.length - 1]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Signup Failed',
        'An error occurred during signup. Please try again.'
      );
    });
    renderResult.unmount();
  });
});
