import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../../../src/screens/Auth/LoginScreen';

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
  default: { get: (...args) => mockGet(...args) },
}));

const mockLogin = jest.fn();
jest.mock('../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    loading: false,
    login: mockLogin,
  }),
}));

jest.spyOn(Alert, 'alert');

const mockNavigate = jest.fn();
const navigation = { navigate: mockNavigate };

const getLoginButton = (getAllByText) => {
  const loginElements = getAllByText('Login');
  return loginElements[loginElements.length - 1];
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the login screen UI elements correctly', () => {
    const { getAllByText, getByPlaceholderText, getByText } = render(
      <LoginScreen navigation={navigation} />
    );
    expect(getAllByText('Login').length).toBeGreaterThanOrEqual(2);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(getByText("Don't have an account?")).toBeTruthy();
    expect(getByText('Sign Up')).toBeTruthy();
  });

  it('navigates to Signup when "Sign Up" link is pressed', () => {
    const { getByText } = render(<LoginScreen navigation={navigation} />);
    fireEvent.press(getByText('Sign Up'));
    expect(mockNavigate).toHaveBeenCalledWith('Signup');
  });

  it('shows validation errors for empty email and password on submit', async () => {
    const { getAllByText, findByText } = render(
      <LoginScreen navigation={navigation} />
    );

    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    await waitFor(() => {
      expect(findByText('Email is required')).toBeTruthy();
    });
  });

  it('logs in successfully with valid credentials and trims email', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    mockGet.mockResolvedValueOnce({ data: [mockUser] });

    const { getByPlaceholderText, getAllByText } = render(
      <LoginScreen navigation={navigation} />
    );

    await act(async () => {
      fireEvent.changeText(
        getByPlaceholderText('Enter your email'),
        'Test@example.com'
      );
      fireEvent.changeText(
        getByPlaceholderText('Enter your password'),
        'password123'
      );
    });

    await act(async () => {
      fireEvent.press(getLoginButton(getAllByText));
    });

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/users', {
        params: { email: 'test@example.com' },
      });
      expect(mockLogin).toHaveBeenCalledWith({
        user: mockUser,
        token: 'mock-token-123',
      });
    });
  });

  it('handles login errors and failure alerts', async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    let renderResult = render(<LoginScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your email'),
        'unknown@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'password123'
      );
    });

    await act(async () => {
      fireEvent.press(getLoginButton(renderResult.getAllByText));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid Credentials');
    });
    renderResult.unmount();

    Alert.alert.mockClear();

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'correctPassword',
      name: 'Test User',
    };

    mockGet.mockResolvedValueOnce({ data: [mockUser] });

    renderResult = render(<LoginScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your email'),
        'test@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'wrongPassword'
      );
    });

    await act(async () => {
      fireEvent.press(getLoginButton(renderResult.getAllByText));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid Credentials');
    });
    renderResult.unmount();

    Alert.alert.mockClear();

    mockGet.mockRejectedValueOnce(new Error('Network Error'));

    renderResult = render(<LoginScreen navigation={navigation} />);

    await act(async () => {
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your email'),
        'test@example.com'
      );
      fireEvent.changeText(
        renderResult.getByPlaceholderText('Enter your password'),
        'password123'
      );
    });

    await act(async () => {
      fireEvent.press(getLoginButton(renderResult.getAllByText));
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Login Failed',
        'An error occurred during login. Please try again.'
      );
    });
    renderResult.unmount();
  });
});
