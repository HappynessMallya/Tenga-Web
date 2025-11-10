// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { useNotifications } from '../../providers/NotificationProvider';
import { formatDate } from '../../utils/format';
import { Icon } from '../common/Icon';

export const NotificationList: React.FC = () => {
  const { colors } = useTheme();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const renderNotification = ({ item: notification }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.notification,
        {
          backgroundColor: notification.is_read ? colors.card : colors.primary + '10',
        },
      ]}
      onPress={() => markAsRead(notification.id)}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{notification.title}</Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>
          {formatDate(notification.created_at)}
        </Text>
      </View>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{notification.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Icon name="check-all" size={20} color={colors.primary} />
          <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  notification: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  message: {
    fontSize: 14,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  markAllText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
