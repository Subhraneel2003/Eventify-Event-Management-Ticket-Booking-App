import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatDate } from '../../utils/date';
import { formatStatus, getStatusColor } from '../../utils/string';

const BookingCard = memo(({ item, colors, onPress }) => {
  const eventTitle = item.event?.title || 'Unknown Event';
  const eventDate = item.event?.date ? formatDate(item.event.date) : 'N/A';
  const status = item.status;
  const statusColor = getStatusColor(status, colors);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text
            style={[styles.eventTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {eventTitle}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor + '15',
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
});

export default BookingCard;

const styles = StyleSheet.create({
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
});
