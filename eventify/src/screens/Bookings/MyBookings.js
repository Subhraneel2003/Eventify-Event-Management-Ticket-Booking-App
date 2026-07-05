import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeContext } from '../../context/ThemeContext';
import { loadBookings } from '../../services/storageService';
import { setSelectedBooking } from '../../store/slices/bookingSlice';
import { formatDate } from '../../utils/date';

export default function MyBookings({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const saved = await loadBookings(user.id);
      setBookings(saved);
    } catch (error) {
      console.log('Error loading bookings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleBookingPress = (booking) => {
    dispatch(setSelectedBooking(booking));
    navigation.navigate('BookingDetails');
  };

  const BookingCard = ({ item }) => {
    const eventTitle = item.eventName || 'Unknown Event';
    const eventDate = item.eventDate ? formatDate(item.eventDate) : 'N/A';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        onPress={() => handleBookingPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text
            style={[styles.eventTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {eventTitle}
          </Text>

          <Text style={[styles.detailText, { color: colors.textSecondary }]}>
            No of Tickets: {item.ticketCount}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {eventDate}
            </Text>
            <Text style={[styles.priceText, { color: colors.text }]}>
              {item.totalAmount === 0 ? 'Free' : `₹ ${item.totalAmount}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
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
          keyExtractor={(item) => item.id?.toString()}
          renderItem={BookingCard}
          contentContainerStyle={[
            styles.listContent,
            bookings.length === 0 && styles.emptyList,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmpty}
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
  // --- Card ---
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '400',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '400',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
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
