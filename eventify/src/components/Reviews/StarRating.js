import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const starMargin = { marginRight: 2 };

const StarRating = memo(({ rating, size = 14, colors }) => {
  const roundedRating = Math.round(Number(rating) * 2) / 2;

  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => {
        let name = 'star-outline';
        if (roundedRating >= star) {
          name = 'star';
        } else if (roundedRating >= star - 0.5) {
          name = 'star-half';
        }
        return (
          <Ionicons
            key={star}
            name={name}
            size={size}
            color={
              roundedRating >= star - 0.5 ? '#FFD700' : colors.textSecondary
            }
            style={starMargin}
          />
        );
      })}
    </View>
  );
});

export default StarRating;

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
