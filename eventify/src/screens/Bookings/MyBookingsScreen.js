import React, { useContext, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../context/ThemeContext';
import { setBookings } from '../../store/slices/bookingSlice';
import api from '../../api/apiClient';
import { useAuth } from '../../hooks/useAuth';
import BookingCard from '../../components/Bookings/BookingCard';

const renderEmpty = (colors) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="ticket-outline" size={64} color={colors.textSecondary} />
    <Text style={[styles.emptyTitle, { color: colors.text }]}>
      No Bookings Yet
    </Text>
    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
      Your bookings will appear here once you book an event.
    </Text>
  </View>
);

export default function MyBookingsScreen({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const { user } = useAuth();
  const bookings = useSelector((state) => state.bookings.bookings);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/bookings?userId=${user.id}&_expand=event&_sort=bookingDate&_order=desc`
      );
      dispatch(setBookings(response.data));
    } catch (error) {
      console.log('Error loading bookings', error);
    } finally {
      setLoading(false);
    }
  }, [user.id, dispatch]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  const handleBookingPress = useCallback(
    (booking) => {
      navigation.navigate('BookingDetails', { bookingId: booking.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <BookingCard item={item} colors={colors} onPress={handleBookingPress} />
    ),
    [colors, handleBookingPress]
  );

  const keyExtractor = useCallback(
    (item) => item.id?.toString(),
    []
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Bookings
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            bookings.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => renderEmpty(colors)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  emptyList: {
    flex: 1,
  },
  // --- Empty State ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
