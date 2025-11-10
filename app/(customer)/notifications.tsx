import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useNotifications } from '../providers/NotificationProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Icon } from '../components/common/Icon';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Header } from '../components/common/Header';
import { AppNotification } from '../types/notification';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsScreen() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } =
    useNotifications();
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleNotificationPress = async (notification: AppNotification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.orderId) {
      router.push(`/(customer)/order/${notification.data.orderId}/review`);
    }
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    Alert.alert('Mark All as Read', `Mark all ${unreadCount} notifications as read?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark All Read',
        style: 'default',
        onPress: markAllAsRead,
      },
    ]);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_placed':
      case 'order_confirmed':
        return 'check-circle';
      case 'order_picked_up':
      case 'order_washing':
        return 'clock';
      case 'order_delivered':
        return 'check-circle';
      case 'order_cancelled':
      case 'payment_failed':
        return 'close-circle';
      case 'payment_received':
        return 'card';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_delivered':
      case 'payment_received':
        return colors.success;
      case 'order_cancelled':
      case 'payment_failed':
        return colors.error;
      case 'order_placed':
      case 'order_confirmed':
        return colors.primary;
      default:
        return colors.warning;
    }
  };

  const renderNotification = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        {
          backgroundColor: item.is_read ? colors.background : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Icon
            name={getNotificationIcon(item.type)}
            size={24}
            color={getNotificationColor(item.type)}
          />
          {!item.is_read && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontWeight: item.is_read ? '500' : '600',
              },
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            style={[
              styles.message,
              {
                color: colors.textSecondary,
              },
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>

        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  if (!notifications) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Header
        title="Notifications"
        rightComponent={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark All Read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <EmptyState
          iconName="notifications-outline"
          title="No Notifications"
          message="You're all caught up! New notifications will appear here."
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  unreadCount: {
    fontSize: 14,
    marginTop: 2,
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
});
