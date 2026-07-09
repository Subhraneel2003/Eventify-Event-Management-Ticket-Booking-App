import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById, updateEventSeats } from '../../api/eventService';
import { ThemeContext } from '../../context/ThemeContext';
import { addBooking } from '../../store/slices/bookingSlice';
import api from '../../api/apiClient';
import * as Crypto from 'expo-crypto';
import { saveBookings } from '../../services/storageService';
import { formatDate, formatTime } from '../../utils/date';
import {
  scheduleBookingConfirmation,
  scheduleEventReminder,
} from '../../services/notificationService';
import { useAuth } from '../../hooks/useAuth';

export default function BookingScreen({ navigation, route }) {
  const { eventId } = route.params;
  const { colors } = useContext(ThemeContext);
  const dispatch = useDispatch();

  const { user } = useAuth();
  const { bookings } = useSelector((state) => state.bookings);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const data = await fetchEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.danger, fontSize: 14 }}>
          Something went wrong: {error}
        </Text>
        <TouchableOpacity onPress={loadEvent}>
          <Text style={{ color: colors.primary, marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalPrice = event.price * ticketCount;
  const maxTickets = event.availableSeats || 10;

  const incrementTicket = () => {
    if (ticketCount < maxTickets) {
      setTicketCount((prev) => prev + 1);
    }
  };

  const decrementTicket = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1);
    }
  };

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      const qrCode = Crypto.randomUUID();
      const booking = {
        userId: user.id,
        eventId: event.id,
        ticketCount,
        totalAmount: totalPrice,
        bookingDate: new Date().toISOString(),
        status: 'confirmed',
        qrCode,
      };

      const response = await api.post('/bookings', booking);
      const createdBooking = response.data;

      await updateEventSeats(event.id, ticketCount, 'confirmed');

      dispatch(addBooking(createdBooking));

      await saveBookings([...bookings, createdBooking]);

      try {
        await scheduleBookingConfirmation(event.title);
      } catch (err) {
        console.log('Error scheduling booking confirmation notification:', err);
      }

      // Schedule event reminder before the event starts
      try {
        const eventDateTime = new Date(`${event.date}T${event.time}:00`);
        if (!isNaN(eventDateTime.getTime())) {
          await scheduleEventReminder(event.title, eventDateTime);
        } else {
          console.log(
            'Invalid event date/time for scheduling reminder:',
            event.date,
            event.time
          );
        }
      } catch (err) {
        console.log('Error scheduling event reminder notification:', err);
      }

      navigation.navigate('BookingDetails', {
        bookingId: createdBooking.id,
      });
    } catch (error) {
      Alert.alert('Error', 'An error occured while Booking');
      console.log('Error occurred in booking', error);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Book Tickets
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.ticketCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[styles.ticketNotch, { backgroundColor: colors.background }]}
          />

          <View
            style={[styles.ticketTopLine, { borderBottomColor: colors.border }]}
          />

          <View style={styles.ticketBody}>
            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {event.title}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Venue:{' '}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {event.venueName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Date:{' '}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(event.date)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Time:{' '}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatTime(event.time)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Price:{' '}
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {event.price === 0 ? 'Free' : `₹ ${event.price}`}
              </Text>
            </View>

            <View
              style={[styles.dashedDivider, { borderColor: colors.border }]}
            />

            <View style={styles.ticketCountRow}>
              <Text style={[styles.ticketCountLabel, { color: colors.text }]}>
                No. of Tickets:
              </Text>
              <View style={styles.counter}>
                <TouchableOpacity
                  onPress={decrementTicket}
                  style={[
                    styles.counterBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="remove" size={18} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.ticketCountValue, { color: colors.text }]}>
                  {ticketCount}
                </Text>
                <TouchableOpacity
                  onPress={incrementTicket}
                  style={[
                    styles.counterBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                >
                  <Ionicons name="add" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={[styles.dashedDivider, { borderColor: colors.border }]}
            />

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total Price:
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {event.price === 0 ? 'Free' : `₹ ${totalPrice}`}
              </Text>
            </View>
          </View>

          <View
            style={[styles.ticketBottomLine, { borderTopColor: colors.border }]}
          />

          <View
            style={[
              styles.ticketNotchBottom,
              { backgroundColor: colors.background },
            ]}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            { backgroundColor: colors.primary },
            confirming && { opacity: 0.6 },
          ]}
          onPress={handleConfirm}
          disabled={confirming}
          activeOpacity={0.8}
        >
          {confirming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmText}>Confirm</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // --- Ticket Card ---
  ticketCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  ticketNotch: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 1,
  },
  ticketNotchBottom: {
    position: 'absolute',
    bottom: -12,
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    zIndex: 1,
  },
  ticketTopLine: {
    height: 8,
    borderBottomWidth: 1,
    borderStyle: 'solid',
  },
  ticketBottomLine: {
    height: 8,
    borderTopWidth: 1,
    borderStyle: 'solid',
  },
  ticketBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dashedDivider: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  ticketCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ticketCountLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketCountValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  // --- Confirm Button ---
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
