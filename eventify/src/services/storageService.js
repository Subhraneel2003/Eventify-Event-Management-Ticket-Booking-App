import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const BOOKINGS_KEY = 'bookings';
const THEME_KEY = 'theme';

export const saveAuthData = async (user, token) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.log('Error saving auth data', error);
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const user = await AsyncStorage.getItem(USER_KEY);

    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.log('Error reading auth data', error);
    return { token: null, user: null };
  }
};

export const saveBookings = async (bookings) => {
  try {
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.log('Failed to save bookings', error);
  }
};

export const setThemePreference = async (theme) => {
  try {
    await AsyncStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.log('Failed to save theme preference', error);
  }
};

export const getThemePreference = async () => {
  try {
    const theme = await AsyncStorage.getItem(THEME_KEY);
    return theme || 'light';
  } catch (error) {
    console.log('Failed to get theme preference', error);
    return 'light';
  }
};

export const clearAsyncStorageData = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
      BOOKINGS_KEY,
      THEME_KEY,
    ]);
  } catch (error) {
    console.log('Failed to clear AsyncStorage', error);
  }
};
