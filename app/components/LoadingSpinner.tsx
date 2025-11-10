// @ts-nocheck
import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, Animated, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  variant?: 'default' | 'overlay' | 'card' | 'inline';
  showIcon?: boolean;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  timeout?: number; // Show timeout message after X seconds
  onTimeout?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  variant = 'default',
  showIcon = false,
  icon = 'hourglass-outline',
  color,
  backgroundColor,
  timeout = 10000, // 10 seconds default timeout
  onTimeout,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for better UX
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Timeout handling
    if (timeout && onTimeout) {
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, timeout);
    }

    return () => {
      pulse.stop();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fadeAnim, pulseAnim, timeout, onTimeout]);

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { spinner: 20, icon: 16, text: 12, padding: 8 };
      case 'large':
        return { spinner: 48, icon: 32, text: 18, padding: 24 };
      default:
        return { spinner: 32, icon: 24, text: 14, padding: 16 };
    }
  };

  const sizeConfig = getSizeConfig();
  const spinnerColor = color || colors.primary;
  const bgColor = backgroundColor || colors.background;

  const renderContent = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: pulseAnim }],
          padding: sizeConfig.padding,
        },
      ]}
    >
      {showIcon && (
        <Ionicons
          name={icon as any}
          size={sizeConfig.icon}
          color={spinnerColor}
          style={styles.icon}
        />
      )}
      <ActivityIndicator
        size={size === 'small' ? 'small' : 'large'}
        color={spinnerColor}
        style={styles.spinner}
      />
      {message && (
        <Text
          style={[
            styles.message,
            {
              color: colors.textSecondary,
              fontSize: sizeConfig.text,
              marginTop: showIcon ? 8 : 12,
            },
          ]}
        >
          {message}
        </Text>
      )}
    </Animated.View>
  );

  switch (variant) {
    case 'overlay':
      return (
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View
            style={[
              styles.overlayContent,
              {
                backgroundColor: bgColor,
                borderColor: colors.border,
              },
            ]}
          >
            {renderContent()}
          </View>
        </View>
      );

    case 'card':
      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: bgColor,
              borderColor: colors.border,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {renderContent()}
        </View>
      );

    case 'inline':
      return (
        <View style={styles.inline}>
          <ActivityIndicator size="small" color={spinnerColor} style={styles.inlineSpinner} />
          {message && (
            <Text
              style={[
                styles.inlineMessage,
                { color: colors.textSecondary, fontSize: sizeConfig.text },
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      );

    default:
      return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>{renderContent()}</View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 140,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginBottom: 8,
  },
  spinner: {
    // No additional styles needed
  },
  inlineSpinner: {
    marginRight: 8,
  },
  message: {
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
    maxWidth: screenWidth * 0.8,
  },
  inlineMessage: {
    fontWeight: '500',
  },
});

// Higher-order component for wrapping components with loading state
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  loadingProps?: Partial<LoadingSpinnerProps>
) => {
  return ({ isLoading, ...props }: P & { isLoading: boolean }) => {
    if (isLoading) {
      return <LoadingSpinner {...loadingProps} />;
    }
    return <Component {...(props as P)} />;
  };
};

// Utility hook for loading states with timeout
export const useLoadingState = (
  initialLoading = false,
  timeoutMs = 10000,
  onTimeout?: () => void
) => {
  const [isLoading, setIsLoading] = React.useState(initialLoading);
  const [isTimedOut, setIsTimedOut] = React.useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setIsTimedOut(false);

    if (timeoutMs > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsTimedOut(true);
        onTimeout?.();
      }, timeoutMs);
    }
  }, [timeoutMs, onTimeout]);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setIsTimedOut(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isLoading,
    isTimedOut,
    startLoading,
    stopLoading,
    setIsLoading,
  };
};
