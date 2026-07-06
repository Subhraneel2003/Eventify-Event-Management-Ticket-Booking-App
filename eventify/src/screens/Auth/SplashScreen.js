import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import {
  clearAsyncStorageData,
  getAuthData,
  getThemePreference,
} from '../../services/storageService';
import { clearBookings } from '../../store/slices/bookingSlice';
import { isTokenValid } from '../../utils/tokenManager';
import { useAuth } from '../../hooks/useAuth';

const SplashScreen = () => {
  const { colors, setIsDark } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { login, logout, completeAuthCheck } = useAuth();

  useEffect(() => {
    async function fetchThemePreference() {
      const theme = await getThemePreference();
      setIsDark(theme === 'dark');
    }

    fetchThemePreference();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token, user } = await getAuthData();

        if (!token || !user || !isTokenValid(token)) {
          await clearAsyncStorageData();
          logout();
          dispatch(clearBookings());
          return;
        }

        login({ user, token });
      } catch (err) {
        console.error('Auth check failed:', err);
        await clearAsyncStorageData();
        logout();
        dispatch(clearBookings());
      } finally {
        completeAuthCheck();
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>Eventify</Text>
      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});

export default SplashScreen;
