import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import StarRating from './StarRating';
import { formatDate } from '../../utils/date';

const ReviewCard = memo(({ item, colors, currentUserId }) => {
  const isCurrentUser = item.userId === currentUserId;
  const userName = item.user?.name || 'Unknown User';
  const userImage = item.user?.profileImage;

  return (
    <View
      style={[
        styles.reviewCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUserInfo}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.userName, { color: colors.text }]}
                numberOfLines={1}
              >
                {userName}
              </Text>
              {isCurrentUser && (
                <View
                  style={[
                    styles.youBadge,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[styles.youBadgeText, { color: colors.primary }]}
                  >
                    You
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.reviewDate, { color: colors.textSecondary }]}
            >
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.reviewRatingRow}>
        <StarRating rating={item.rating} size={16} colors={colors} />
      </View>

      <Text style={[styles.reviewComment, { color: colors.text }]}>
        {item.comment}
      </Text>
    </View>
  );
});

export default ReviewCard;

const styles = StyleSheet.create({
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  youBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewRatingRow: {
    marginTop: 10,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
});
