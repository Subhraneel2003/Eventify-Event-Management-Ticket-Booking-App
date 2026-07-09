import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StarRating from './StarRating';

const summaryStarsMargin = { marginVertical: 4 };

const SummaryHeader = memo(({ averageRating, reviewCount, colors }) => (
  <View
    style={[
      styles.summaryCard,
      { backgroundColor: colors.surface, borderColor: colors.border },
    ]}
  >
    <Text style={[styles.averageNumber, { color: colors.text }]}>
      {averageRating}
    </Text>
    <View style={summaryStarsMargin}>
      <StarRating rating={averageRating} size={20} colors={colors} />
    </View>
    <Text
      style={[styles.totalReviewsText, { color: colors.textSecondary }]}
    >
      {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
    </Text>
  </View>
));

export default SummaryHeader;

const styles = StyleSheet.create({
  summaryCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },
  averageNumber: {
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 48,
  },
  totalReviewsText: {
    fontSize: 14,
    marginTop: 6,
  },
});
