import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { clearAuthData, getAuthData } from '../../services/storageService';
import { completeAuthCheck, login, logout } from '../../store/slices/authSlice';
import { isTokenValid } from '../../utils/tokenManager';

const SplashScreen = () => {
  const { colors } = useContext(ThemeContext);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const { token, user } = await getAuthData();

      if (!token || !user || !isTokenValid(token)) {
        await clearAuthData();
        dispatch(logout());
        return;
      }

      dispatch(login({ user, token }));
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
