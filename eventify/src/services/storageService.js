import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveAuthData = async (user, token) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.log('Error saving auth data', error);
  }
};

export const getAuthData = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const user = await AsyncStorage.getItem('user');

    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.log('Error reading auth data', error);
    return { token: null, user: null };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['user', 'token']);
  } catch (error) {
    console.log('Error clearing auth data', error);
  }
};

export const saveBookings = async (bookings) => {
  try {
    await AsyncStorage.setItem('bookings', JSON.stringify(bookings));
  } catch (error) {
    console.log('Failed to save bookings', error);
  }
};

export const loadBookings = async () => {
  try {
    const bookings = await AsyncStorage.getItem('bookings');

    return bookings ? JSON.parse(bookings) : [];
  } catch (error) {
    console.log('Failed to load bookings', error);
    return [];
  }
};

export const clearBookingsData = async () => {
  try {
    await AsyncStorage.removeItem('bookings');
  } catch (error) {
    console.log('Failed to clear bookings', error);
  }
};
