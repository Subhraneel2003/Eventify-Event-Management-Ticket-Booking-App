import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import MapView, { Marker } from 'react-native-maps';
import { ThemeContext } from '../../context/ThemeContext';
import { cancelBooking } from '../../store/slices/bookingSlice';
import { updateEventSeats } from '../../api/eventService';
import { getQRData } from '../../utils/qrManager';
import api from '../../api/apiClient';
import Button from '../../components/Button';
import { formatDate, formatTime } from '../../utils/date';
import { formatStatus, getStatusColor, getRefundStatusColor } from '../../utils/string';

export default function BookingDetailsScreen({ route, navigation }) {
  const { colors } = useContext(ThemeContext);
  const dispatch = useDispatch();
  const { bookingId } = route.params || {};

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBooking();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/bookings/${bookingId}?_expand=event`);
      const bookingData = response.data;
      setBooking(bookingData);
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
        <TouchableOpacity onPress={loadBooking}>
          <Text style={{ color: colors.primary, marginTop: 10 }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No booking selected
        </Text>
        <TouchableOpacity
          style={[styles.goBackBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { id, ticketCount, totalAmount, status, qrCode, eventId, userId } =
    booking;

  const qrData = getQRData(id, eventId, userId, qrCode);

  const eventTitle = booking.event?.title || 'Unknown Event';
  const venueName = booking.event?.venueName || 'N/A';
  const date = booking.event?.date || 'N/A';
  const time = booking.event?.time || 'N/A';
  const price = booking.event?.price ?? 0;
  const venueLatitude = booking.event?.location?.latitude;
  const venueLongitude = booking.event?.location?.longitude;

  const statusColor = getStatusColor(status, colors);
  const refundColor = getRefundStatusColor(booking.refundStatus, colors);

  const handleCancel = () => {
    setCancelModalVisible(true);
  };

  const confirmCancel = async () => {
    try {
      setCancelling(true);
      await api.patch(`/bookings/${id}`, {
        status: 'cancelled',
      });

      await updateEventSeats(eventId, ticketCount, 'cancelled');

      dispatch(cancelBooking(id));
      setCancelModalVisible(false);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleReview = () => {
    navigation.navigate('AddReview', { eventId, bookingId: id });
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
          Booking Details
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
            <View style={styles.qrContainer}>
              <View
                style={[
                  styles.qrWrapper,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <QRCode
                  value={qrData}
                  size={120}
                  backgroundColor={colors.background}
                  color={colors.text}
                />
              </View>
            </View>

            <View style={styles.statusRow}>
              <Text
                style={[styles.statusLabel, { color: colors.textSecondary }]}
              >
                Status:{' '}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusColor + '20',
                    borderColor: statusColor,
                  },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {formatStatus(status)}
                </Text>
              </View>
            </View>

            {booking.refundStatus &&
              booking.refundStatus !== 'not_applicable' && (
                <View style={[styles.statusRow, { marginTop: 8 }]}>
                  <Text
                    style={[
                      styles.statusLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Refund Status:{' '}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: refundColor + '20',
                        borderColor: refundColor,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: refundColor,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: refundColor },
                      ]}
                    >
                      {formatStatus(booking.refundStatus)}
                    </Text>
                  </View>
                </View>
              )}

            <Text style={[styles.eventTitle, { color: colors.text }]}>
              {eventTitle}
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
                {venueName}
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
                {formatDate(date)}
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
                {formatTime(time)}
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
                {price === 0 ? 'Free' : `₹ ${price}`}
              </Text>
            </View>

            <View
              style={[styles.dashedDivider, { borderColor: colors.border }]}
            />

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                No. of Tickets:
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {ticketCount}
              </Text>
            </View>

            <View style={[styles.summaryRow, { marginTop: 8 }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>
                Total Price:
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary }]}>
                {price === 0 ? 'Free' : `₹ ${totalAmount}`}
              </Text>
            </View>

            {venueLatitude && venueLongitude && (
              <>
                <View
                  style={[styles.dashedDivider, { borderColor: colors.border }]}
                />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Location
                </Text>
                <View
                  style={[
                    styles.mapPlaceholder,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MapView
                    style={{ flex: 1 }}
                    initialRegion={{
                      latitude: venueLatitude,
                      longitude: venueLongitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                  >
                    <Marker
                      coordinate={{
                        latitude: venueLatitude,
                        longitude: venueLongitude,
                      }}
                      title={venueName}
                      description={booking.event?.address}
                    />
                  </MapView>
                </View>
              </>
            )}
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

        <View style={styles.actionRow}>
          {status === 'confirmed' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.danger + '15',
                  borderColor: colors.danger,
                },
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={[styles.actionBtnText, { color: colors.danger }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          {status === 'used' && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary,
                  flex: undefined,
                  width: '100%',
                },
              ]}
              onPress={handleReview}
              activeOpacity={0.7}
            >
              <Ionicons name="star-outline" size={20} color={colors.primary} />
              <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                Write a Review
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={cancelModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !cancelling && setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Cancel Booking?
            </Text>
            <Text
              style={[styles.modalMessage, { color: colors.textSecondary }]}
            >
              This action cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <Button
                title="No"
                onPress={() => setCancelModalVisible(false)}
                disabled={cancelling}
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderWidth: 1,
                    height: undefined,
                  },
                ]}
                textStyle={[styles.modalBtnText, { color: colors.text }]}
              />

              <Button
                title="Yes, Cancel"
                onPress={confirmCancel}
                loading={cancelling}
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: colors.danger,
                    height: undefined,
                  },
                ]}
                textStyle={[styles.modalBtnText, { color: '#fff' }]}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  goBackBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  goBackText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // --- Header ---
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
    marginBottom: 20,
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
  // --- QR Code ---
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  // --- Status ---
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // --- Event Title ---
  eventTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  // --- Info Rows ---
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
  // --- Divider ---
  dashedDivider: {
    borderWidth: 0.5,
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  // --- Summary ---
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    marginBottom: 16,
  },
  // --- Action Buttons ---
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  // --- Review Card ---
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginHorizontal: 4,
  },
  ratingHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  submitReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitReviewText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // --- Cancel Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
