import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../utils/constants';
import { formatDate } from '../../utils/date';

export default function ReviewsScreen({ navigation, route }) {
  const { eventId } = route.params;
  const { colors } = useContext(ThemeContext);
  const { user } = useSelector((state) => state.auth);

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const reviewsRes = await axios.get(
          `${API_BASE_URL}/reviews?eventId=${eventId}&_sort=createdAt&_order=desc`
        );

        setReviews(reviewsRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [eventId]);

  const averageRating =
    reviews.length > 0
      ? (
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      ).toFixed(1)
      : 0;

  const renderStars = (rating, size = 14) => {
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
              style={{ marginRight: 2 }}
            />
          );
        })}
      </View>
    );
  };

  const SummaryHeader = () => {
    return (
      <View
        style={[
          styles.summaryCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.averageNumber, { color: colors.text }]}>
          {averageRating}
        </Text>
        <View style={{ marginVertical: 4 }}>
          {renderStars(averageRating, 20)}
        </View>
        <Text
          style={[styles.totalReviewsText, { color: colors.textSecondary }]}
        >
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </Text>
      </View>
    );
  };

  const ReviewCard = ({ item }) => {
    const isCurrentUser = item.userId === user?.id;

    return (
      <View
        style={[
          styles.reviewCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUserInfo}>
            {item.userImage ? (
              <Image source={{ uri: item.userImage }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarInitial}>
                  {(item.userName || 'Unknown User').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.nameContainer}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.userName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.userName || 'Unknown User'}
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
          {renderStars(item.rating, 16)}
        </View>

        <Text style={[styles.reviewComment, { color: colors.text }]}>
          {item.comment}
        </Text>
      </View>
    );
  };

  if (loading) {
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
            Reviews
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
            Reviews
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 12,
            }}
          >
            Failed to load reviews
          </Text>
          <TouchableOpacity onPress={fetchReviews} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.primary, fontWeight: '500' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (reviews.length === 0) {
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
            Reviews
          </Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons
            name="chatbubbles-outline"
            size={56}
            color={colors.textSecondary}
          />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No Reviews Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Be the first to share your experience!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          Reviews
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        renderItem={ReviewCard}
        ListHeaderComponent={SummaryHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
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
    paddingHorizontal: 32,
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  // --- Summary Card ---
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

  // --- Review Card ---
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
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },

  // --- Empty State ---
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
});