// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import { Button } from '../Button';

// Hooks
import { useSubmitReview, useReviewByOrderId } from '../../hooks/useServiceQueries';
import { logger } from '../../utils/logger';

interface ReviewSystemProps {
  orderId: string;
  vendorId?: string;
  deliveryAgentId?: string;
  onReviewSubmitted?: () => void;
  reviewType: 'vendor' | 'delivery';
}

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  orderId,
  vendorId,
  deliveryAgentId,
  onReviewSubmitted,
  reviewType,
}) => {
  const { colors } = useTheme();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Query hooks
  const {
    data: existingReview,
    isLoading: loadingReview,
    error: reviewError,
  } = useReviewByOrderId(orderId);

  const submitReviewMutation = useSubmitReview();

  // Check if review already exists
  const hasExistingReview = existingReview && existingReview.length > 0;
  const isSubmitting = submitReviewMutation.isPending;

  useEffect(() => {
    // Pre-populate if existing review
    if (hasExistingReview) {
      const review = existingReview[0];
      setRating(review.rating || 0);
      setComment(review.comment || '');
    }
  }, [existingReview, hasExistingReview]);

  const getAutoReply = (rating: number): string => {
    switch (rating) {
      case 5:
        return 'Excellent';
      case 4:
        return 'Very good';
      case 3:
        return 'Good';
      case 2:
        return 'Fair';
      case 1:
        return 'Poor';
      default:
        return '';
    }
  };

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
    // Auto-populate comment with rating-based reply if no custom comment
    if (!comment.trim()) {
      setComment(getAutoReply(starRating));
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    const reviewData = {
      orderId,
      vendorId: reviewType === 'vendor' ? vendorId : undefined,
      deliveryAgentId: reviewType === 'delivery' ? deliveryAgentId : undefined,
      rating,
      comment: comment.trim() || getAutoReply(rating),
      reply: getAutoReply(rating), // Auto-generated reply based on rating
    };

    try {
      await submitReviewMutation.mutateAsync(reviewData);

      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback! Your review has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              onReviewSubmitted?.();
              logger.info('Review submitted successfully', {
                orderId,
                reviewType,
                rating,
                hasComment: !!comment.trim(),
              });
            },
          },
        ]
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      Alert.alert('Error', errorMessage);
      logger.error('Failed to submit review', {
        orderId,
        reviewType,
        error: errorMessage,
      });
    }
  };

  if (loadingReview) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <LoadingSpinner size="small" message="Loading review..." variant="inline" />
      </View>
    );
  }

  if (reviewError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load review information
        </Text>
      </View>
    );
  }

  const getReviewTitle = () => {
    switch (reviewType) {
      case 'vendor':
        return 'Rate Vendor Service';
      case 'delivery':
        return 'Rate Delivery Service';
      default:
        return 'Rate Service';
    }
  };

  const getReviewDescription = () => {
    switch (reviewType) {
      case 'vendor':
        return 'How was the laundry service quality?';
      case 'delivery':
        return 'How was the pickup and delivery experience?';
      default:
        return 'How was your overall experience?';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons
          name={reviewType === 'vendor' ? 'storefront' : 'bicycle'}
          size={32}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: colors.text }]}>{getReviewTitle()}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {getReviewDescription()}
        </Text>
      </View>

      {/* Existing Review Display */}
      {hasExistingReview && (
        <View style={[styles.existingReview, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.existingHeader}>
            <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
            <Text style={[styles.existingTitle, { color: colors.success }]}>Review Submitted</Text>
          </View>
          <Text style={[styles.existingText, { color: colors.textSecondary }]}>
            You've already reviewed this {reviewType}. You can update your review below.
          </Text>
        </View>
      )}

      {/* Star Rating */}
      <View style={styles.ratingSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Rating</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => handleStarPress(star)}
              onPressIn={() => setHoveredStar(star)}
              onPressOut={() => setHoveredStar(0)}
              style={styles.starButton}
              disabled={isSubmitting}
            >
              <Ionicons
                name={star <= (hoveredStar || rating) ? 'star' : 'star-outline'}
                size={40}
                color={star <= (hoveredStar || rating) ? '#FFD700' : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <View style={styles.ratingLabel}>
            <Text style={[styles.ratingText, { color: colors.primary }]}>
              {getAutoReply(rating)} ({rating}/5 stars)
            </Text>
          </View>
        )}
      </View>

      {/* Comment Section */}
      <View style={styles.commentSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Additional Comments (Optional)
        </Text>
        <TextInput
          style={[
            styles.commentInput,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={comment}
          onChangeText={setComment}
          placeholder={`Share your experience with the ${reviewType}...`}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isSubmitting}
          maxLength={500}
        />
        <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
          {comment.length}/500 characters
        </Text>
      </View>

      {/* Auto-reply Preview */}
      {rating > 0 && (
        <View style={[styles.autoReplyPreview, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.autoReplyLabel, { color: colors.textSecondary }]}>
            Auto-generated summary:
          </Text>
          <Text style={[styles.autoReplyText, { color: colors.text }]}>
            "{getAutoReply(rating)}"
          </Text>
        </View>
      )}

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <Button
          title={
            isSubmitting ? 'Submitting...' : hasExistingReview ? 'Update Review' : 'Submit Review'
          }
          onPress={handleSubmitReview}
          loading={isSubmitting}
          disabled={rating === 0 || isSubmitting}
          size="large"
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  existingReview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  existingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  existingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  existingText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    marginTop: 12,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  autoReplyPreview: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  autoReplyLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  autoReplyText: {
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  submitSection: {
    marginTop: 8,
  },
  submitButton: {
    // Additional styling if needed
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
});
