// @ts-nocheck
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useNotifications } from '../../providers/NotificationProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { Icon } from '../common/Icon';

interface NotificationBadgeProps {
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  showLabel = false,
  size = 'medium',
  onPress,
}) => {
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to notifications screen (we'll create this)
      router.push('/notifications');
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          containerSize: 32,
          iconSize: 18,
          badgeSize: 16,
          badgeText: 10,
        };
      case 'large':
        return {
          containerSize: 56,
          iconSize: 28,
          badgeSize: 24,
          badgeText: 12,
        };
      default: // medium
        return {
          containerSize: 44,
          iconSize: 24,
          badgeSize: 20,
          badgeText: 11,
        };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.container,
        {
          width: sizeConfig.containerSize,
          height: sizeConfig.containerSize,
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <Icon
        name="bell"
        size={sizeConfig.iconSize}
        color={unreadCount > 0 ? colors.primary : colors.text}
      />

      {unreadCount > 0 && (
        <View
          style={[
            styles.badge,
            {
              width: sizeConfig.badgeSize,
              height: sizeConfig.badgeSize,
              backgroundColor: colors.error,
              borderColor: colors.background,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                fontSize: sizeConfig.badgeText,
                color: colors.background,
              },
            ]}
          >
            {unreadCount > 99 ? '99+' : unreadCount.toString()}
          </Text>
        </View>
      )}

      {showLabel && (
        <Text
          style={[
            styles.label,
            {
              color: colors.text,
              marginTop: 4,
            },
          ]}
        >
          Notifications
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    position: 'relative',
    marginTop: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
  },
  badgeText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});
