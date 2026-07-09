import React, { useContext, useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import ReviewCard from '../../components/Reviews/ReviewCard';
import SummaryHeader from '../../components/Reviews/SummaryHeader';

const ItemSeparator = memo(() => <View style={separatorStyle} />);
const separatorStyle = { height: 12 };

const headerSpacer = { width: 36 };

export default function ReviewsScreen({ navigation, route }) {
  const { eventId } = route.params;
  const { colors } = useContext(ThemeContext);
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const reviewsRes = await api.get(
        `/reviews?eventId=${eventId}&_sort=createdAt&_order=desc&_expand=user`
      );

      setReviews(reviewsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const averageRating = useMemo(
    () =>
      reviews.length > 0
        ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
        : 0,
    [reviews]
  );

  const handleGoBack = useCallback(() => navigation.goBack(), [navigation]);

  const renderItem = useCallback(
    ({ item }) => (
      <ReviewCard item={item} colors={colors} currentUserId={user?.id} />
    ),
    [colors, user?.id]
  );

  const keyExtractor = useCallback(
    (item) => item.id.toString(),
    []
  );

  const listHeader = useMemo(
    () => (
      <SummaryHeader
        averageRating={averageRating}
        reviewCount={reviews.length}
        colors={colors}
      />
    ),
    [averageRating, reviews.length, colors]
  );

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={colors.textSecondary}
          />
          <Text
            style={[styles.errorText, { color: colors.textSecondary }]}
          >
            Failed to load reviews
          </Text>
          <TouchableOpacity onPress={fetchReviews} style={retryMargin}>
            <Text style={{ color: colors.primary, fontWeight: '500' }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (reviews.length === 0) {
      return (
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
      );
    }

    return (
      <FlatList
        data={reviews}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
      />
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Reviews
        </Text>
        <View style={headerSpacer} />
      </View>
      {renderBody()}
    </SafeAreaView>
  );
}

const retryMargin = { marginTop: 8 };

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
  errorText: {
    fontSize: 14,
    marginTop: 12,
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
