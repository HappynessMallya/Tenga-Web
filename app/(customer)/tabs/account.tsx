// @ts-nocheck
import { router } from 'expo-router';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StyleSheet,
  Switch,
  Modal,
  Linking,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/Button';

import { useTheme } from '../../providers/ThemeProvider';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { NetworkBanner } from '../../components/NetworkBanner';

// TanStack Query Hooks
import { useCurrentUser, useUpdateUserProfile, useUpdateUser } from '../../hooks/useServiceQueries';

// Services
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

// App version
const APP_VERSION = '1.0.0';

// Responsive dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenHeight < 700;
const isLargeScreen = screenHeight > 800;
const isTablet = screenWidth > 768;
const horizontalPadding = screenWidth < 400 ? 16 : isTablet ? 32 : 24;
const cardPadding = isSmallScreen ? 16 : isLargeScreen ? 24 : 20;

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  color?: string;
}

export default function CustomerAccountScreen() {
  // Helper functions - defined at the top to avoid hoisting issues
  const getUserInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const names = fullName.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#9334ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const index = name.length % colors.length;
    return colors[index];
  };

  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Animation states
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];

  // Use actual logged-in user data instead of API call
  const currentUser = user; // Use user from auth store
  const isLoading = authLoading;
  const hasError = false; // No error since we have user data
  const isSaving = false; // Simplified for now

  // TanStack Query hooks for updates (if needed)
  const updateUserMutation = useUpdateUser();
  const updateProfileMutation = useUpdateUserProfile();

  // Initialize form data when user data loads
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.fullName || '');
      setPhone(currentUser.phoneNumber || '');
      logger.info('User account view accessed', { userId: currentUser.id });
      
      // Animate in the content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentUser, fadeAnim, slideAnim, scaleAnim]);

  // Cleanup effect for logout process
  useEffect(() => {
    return () => {
      // Cleanup if component unmounts during logout
      if (isLoggingOut) {
        logger.info('🔄 Component unmounted during logout, cleaning up...');
        setIsLoggingOut(false);
      }
    };
  }, [isLoggingOut]);

  const handleSave = async () => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    // Enhanced validation
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert('Validation Error', 'Name must be at least 2 characters long');
      return;
    }

    if (trimmedPhone && !/^[\+]?[1-9][\d]{0,15}$/.test(trimmedPhone.replace(/\s/g, ''))) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return;
    }

    try {
      // Update both user and profile data
      await Promise.all([
        updateUserMutation.mutateAsync({
          userId: currentUser.id,
          data: { full_name: trimmedName, phone: trimmedPhone },
        }),
        updateProfileMutation.mutateAsync({
          userId: currentUser.id,
          data: { full_name: trimmedName, phone: trimmedPhone },
        }),
      ]);

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
      logger.info('User profile updated successfully', {
        userId: currentUser.id,
        changes: { name: trimmedName, phone: trimmedPhone },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
      logger.error('Failed to update user profile', {
        userId: currentUser.id,
        error: errorMessage,
      });
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // TODO: Implement account deletion
            Alert.alert(
              'Feature Coming Soon',
              'Account deletion will be available in a future update.'
            );
          },
        },
      ]
    );
    setDeleteModalVisible(false);
  };

  // Calculate changes - must be before settingsSections that depends on it
  const hasChanges = currentUser ? 
    (name.trim() !== (currentUser?.fullName || '') || phone.trim() !== (currentUser?.phoneNumber || '')) : 
    false;

  // Simple direct logout - must be defined before settingsSections that uses it
  const handleDirectLogout = useCallback(async () => {
    console.log('🚪 Starting direct logout');
    
    try {
      setIsLoggingOut(true);
      
      // Clear user data and logout
      await signOut();
      
      console.log('✅ Direct logout completed');
      
      // Navigation will be handled by the auth state change
      // The useEffect will detect currentUser becoming null and redirect
    } catch (error) {
      console.error('❌ Direct logout failed:', error);
      
      // Even if logout fails, try to redirect to welcome screen
      router.replace('/(auth)/welcome');
    } finally {
      setIsLoggingOut(false);
    }
  }, [signOut]);

  // All hooks must be called before any conditional returns
  const settingsSections = useMemo(
    () => [
      {
        title: 'Personalization',
        items: [
          {
            id: 'theme',
            title: 'Dark Mode',
            icon: isDark ? 'weather-night' : 'weather-sunny',
            type: 'toggle',
            value: isDark,
            onPress: toggleTheme,
          },
        ] as SettingItem[],
      },
      {
        title: 'Legal',
        items: [
          {
            id: 'privacy',
            title: 'Privacy Policy',
            icon: 'shield-check-outline',
            type: 'navigation',
            onPress: () => Linking.openURL('https://your-app.com/privacy'),
          },
          {
            id: 'terms',
            title: 'Terms & Conditions',
            icon: 'text-box-outline',
            type: 'navigation',
            onPress: () => Linking.openURL('https://your-app.com/terms'),
          },
        ] as SettingItem[],
      },
      {
        title: 'Account Actions',
        items: [
          {
            id: 'delete',
            title: 'Delete Account',
            icon: 'delete-outline',
            type: 'action',
            color: colors.error,
            onPress: () => setDeleteModalVisible(true),
          },
          {
            id: 'logout',
            title: isLoggingOut ? 'Logging Out...' : 'Logout',
            icon: isLoggingOut ? 'loading' : 'logout',
            type: 'action',
            color: isLoggingOut || isSaving ? colors.textSecondary : colors.error,
            onPress: isLoggingOut || isSaving ? undefined : () => {
              console.log('🚪 Direct logout called');
              handleDirectLogout();
            },
          },
        ] as SettingItem[],
      },
    ],
    [isDark, isLoggingOut, handleDirectLogout, toggleTheme, colors, isSaving]
  );

  // Help text for logout button
  const logoutHelpText = useMemo(() => {
    if (isLoggingOut) return 'Please wait while we log you out...';
    return 'Sign out of your account';
  }, [isLoggingOut]);

  // Redirect to auth if no user data (but only if not currently logging out)
  useEffect(() => {
    if (!currentUser && !isLoading && !isLoggingOut) {
      router.replace('/(auth)/welcome');
    }
  }, [currentUser, isLoading, isLoggingOut]);

  const confirmLogout = useCallback(() => {
    console.log('🚪 confirmLogout called');
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to sign in again to access your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            console.log('🚪 User confirmed logout');
            try {
              setIsLoggingOut(true);
              logger.info('🔄 Starting logout process', { userId: user?.id });

              // Add timeout for logout process
              const logoutTimeout = setTimeout(() => {
                if (isLoggingOut) {
                  logger.warn('⚠️ Logout timeout reached, forcing cleanup');
                  setIsLoggingOut(false);
                  Alert.alert(
                    'Logout Timeout',
                    'Logout is taking longer than expected. Please try again or restart the app.',
                    [{ text: 'OK', style: 'default' }]
                  );
                }
              }, 15000); // 15 second timeout

              // Perform comprehensive logout
              await signOut();

              // Clear timeout since logout completed
              clearTimeout(logoutTimeout);

              logger.info('✅ Logout completed successfully', { userId: user?.id });

              // Clear any local state
              setName('');
              setPhone('');
              setIsEditing(false);
              setDeleteModalVisible(false);
              
              // Note: Navigation will be handled by the auth state change
              // The useEffect will detect currentUser becoming null and redirect
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
              logger.error('❌ Logout failed', {
                userId: user?.id,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
              });

              // Show error to user
              Alert.alert(
                'Logout Failed',
                'There was an issue logging you out. Please try again or restart the app.',
                [
                  { text: 'Try Again', onPress: () => setIsLoggingOut(false) },
                  { text: 'OK', style: 'default' },
                ]
              );
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  }, [user?.id]);

  const handleLogout = useCallback(async () => {
    console.log('🚪 handleLogout called', { isLoggingOut, isSaving, isEditing, hasChanges });
    
    // Prevent multiple logout attempts
    if (isLoggingOut) {
      console.log('🚪 Logout blocked: Already logging out');
      return;
    }

    // Prevent logout during critical operations
    if (isSaving) {
      console.log('🚪 Logout blocked: Saving in progress');
      Alert.alert(
        'Operation in Progress',
        'Please wait for the current operation to complete before logging out.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Check for unsaved changes
    if (isEditing && hasChanges) {
      console.log('🚪 Logout blocked: Unsaved changes');
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes to your profile. Do you want to save them before logging out?',
        [
          { text: 'Discard Changes', style: 'destructive', onPress: () => confirmLogout() },
          {
            text: 'Save First',
            style: 'default',
            onPress: async () => {
              try {
                await handleSave();
                confirmLogout();
              } catch (error) {
                // If save fails, still allow logout
                confirmLogout();
              }
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    // Proceed with logout
    console.log('🚪 Proceeding with logout');
    confirmLogout();
  }, [isLoggingOut, isEditing, hasChanges, isSaving]);

  // Conditional rendering after all hooks are called
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <NetworkBanner />
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your account...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (hasError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <NetworkBanner />
        <ErrorView
          error={new Error('Failed to load account')}
          onRetry={() => {}} // No retry function available
          title="Account Error"
          message="Failed to load your account information"
        />
      </SafeAreaView>
    );
  }

  // Handle no user state - show loading or redirect
  if (!currentUser) {
    // If we're not loading and have no user, show a simple loading state
    // The useEffect will handle the redirect to auth
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <NetworkBanner />
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your account...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <NetworkBanner />
      <StatusBar style="light" backgroundColor={colors.primary} />

      {/* Modern Header with Gradient */}
      <Animated.View 
        style={[
          styles.modernHeader, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Gradient Background */}
        <View style={styles.gradientBackground} />
        
        {/* Floating Elements */}
        <View style={styles.floatingElements}>
          <View style={[styles.floatingCircle, styles.floatingCircle1]} />
          <View style={[styles.floatingCircle, styles.floatingCircle2]} />
          <View style={[styles.floatingCircle, styles.floatingCircle3]} />
        </View>

        <View style={styles.modernHeaderContent}>
          {/* Modern Avatar with Ring */}
          <View style={styles.modernAvatarContainer}>
            <View style={[styles.avatarRing, { borderColor: getAvatarColor(currentUser.fullName || 'Customer') }]} />
            <Animated.View 
              style={[
                styles.modernAvatar, 
                { 
                  backgroundColor: getAvatarColor(currentUser.fullName || 'Customer'),
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={styles.modernAvatarText}>
                {getUserInitials(currentUser.fullName || 'Customer')}
              </Text>
            </Animated.View>
            <View style={[styles.modernStatusIndicator, { backgroundColor: currentUser.verified ? '#10b981' : '#f59e0b' }]} />
          </View>

          {/* Modern User Info */}
          <View style={styles.modernUserInfo}>
            <Text style={styles.modernUserName}>{currentUser.fullName || 'Customer'}</Text>
            <Text style={styles.modernUserSubtitle}>
              {currentUser.email || `${currentUser.countryCode}${currentUser.phoneNumber}`}
            </Text>
            
            {/* Modern Stats Row */}
            <View style={styles.modernStatsRow}>
              <View style={styles.modernStatItem}>
                <View style={styles.modernStatIcon}>
                  <Icon name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.modernStatText} numberOfLines={1}>
                  {new Date(currentUser.createdAt || Date.now()).getFullYear()}
                </Text>
              </View>
              
              {currentUser.customerProfile && (
                <View style={styles.modernStatItem}>
                  <View style={styles.modernStatIcon}>
                    <Icon name="star" size={16} color="rgba(255, 255, 255, 0.9)" />
                  </View>
                  <Text style={styles.modernStatText} numberOfLines={1}>
                    {currentUser.customerProfile.loyaltyPoints} pts
                  </Text>
                </View>
              )}
              
              <View style={styles.modernStatItem}>
                <View style={styles.modernStatIcon}>
                  <Icon name={currentUser.verified ? "shield-checkmark" : "shield-outline"} size={16} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <Text style={styles.modernStatText} numberOfLines={1}>
                  {currentUser.verified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Modern Profile Section with Glassmorphism */}
        <Animated.View 
          style={[
            styles.modernSection, 
            styles.modernProfileSection, 
            { 
              backgroundColor: colors.card,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Section Header with Modern Design */}
          <View style={styles.modernSectionHeader}>
            <View style={styles.modernSectionTitleContainer}>
              <View style={[styles.modernSectionIcon, { backgroundColor: colors.primary }]}>
                <Icon name="account-circle" size={20} color="white" />
              </View>
              <Text style={[styles.modernSectionTitle, { color: colors.text }]}>Profile Information</Text>
            </View>
            <TouchableOpacity 
              style={[styles.modernEditButton, { backgroundColor: colors.primary }]}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Icon name={isEditing ? 'close' : 'pencil'} size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Modern Profile Fields */}
          <View style={styles.modernProfileFields}>
            {/* Full Name Field */}
            <View style={styles.modernFieldGroup}>
              <View style={styles.modernFieldHeader}>
                <Icon name="account" size={16} color={colors.textSecondary} />
                <Text style={[styles.modernFieldLabel, { color: colors.textSecondary }]}>Full Name</Text>
              </View>
              {isEditing ? (
                <View style={[styles.modernInputContainer, { backgroundColor: colors.inputBackground }]}>
                  <TextInput
                    style={[
                      styles.modernInput,
                      {
                        color: colors.text,
                      },
                    ]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textSecondary}
                    editable={!isSaving}
                  />
                </View>
              ) : (
                <View style={[styles.modernFieldValueContainer, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.modernFieldValue, { color: colors.text }]}>{name || 'Not set'}</Text>
                </View>
              )}
            </View>

            {/* Phone Number Field */}
            <View style={styles.modernFieldGroup}>
              <View style={styles.modernFieldHeader}>
                <Icon name="phone" size={16} color={colors.textSecondary} />
                <Text style={[styles.modernFieldLabel, { color: colors.textSecondary }]}>Phone Number</Text>
              </View>
              {isEditing ? (
                <View style={[styles.modernInputContainer, { backgroundColor: colors.inputBackground }]}>
                  <TextInput
                    style={[
                      styles.modernInput,
                      {
                        color: colors.text,
                      },
                    ]}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    editable={!isSaving}
                  />
                </View>
              ) : (
                <View style={[styles.modernFieldValueContainer, { backgroundColor: colors.inputBackground }]}>
                  <Text style={[styles.modernFieldValue, { color: colors.text }]}>
                    {currentUser.countryCode}{currentUser.phoneNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Email Field */}
            <View style={styles.modernFieldGroup}>
              <View style={styles.modernFieldHeader}>
                <Icon name="email" size={16} color={colors.textSecondary} />
                <Text style={[styles.modernFieldLabel, { color: colors.textSecondary }]}>Email</Text>
              </View>
              <View style={[styles.modernFieldValueContainer, { backgroundColor: colors.inputBackground }]}>
                <Text style={[styles.modernFieldValue, { color: colors.textSecondary }]}>
                  {currentUser.email || 'Not provided'}
                </Text>
              </View>
            </View>

            {/* Account Status Field */}
            {/* <View style={styles.modernFieldGroup}>
              <View style={styles.modernFieldHeader}>
                <Icon name="shield-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.modernFieldLabel, { color: colors.textSecondary }]}>Account Status</Text>
              </View>
              <View style={styles.modernStatusContainer}>
                <View style={[styles.modernStatusBadge, { backgroundColor: currentUser.verified ? '#10b981' : '#f59e0b' }]}>
                  <Icon 
                    name={currentUser.verified ? "checkmark-circle" : "clock"} 
                    size={14} 
                    color="white" 
                  />
                  <Text style={styles.modernStatusText}>
                    {currentUser.verified ? 'Verified' : 'Pending Verification'}
                  </Text>
                </View>
              </View>
            </View> */}

            {/* Loyalty Points Field */}
            {currentUser.customerProfile && (
              <View style={styles.modernFieldGroup}>
                <View style={styles.modernFieldHeader}>
                  <Icon name="star-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.modernFieldLabel, { color: colors.textSecondary }]}>Loyalty Points</Text>
                </View>
                <View style={[styles.modernFieldValueContainer, { backgroundColor: colors.inputBackground }]}>
                  <View style={styles.modernLoyaltyContainer}>
                    <Text style={[styles.modernFieldValue, { color: colors.primary }]}>
                      {currentUser.customerProfile.loyaltyPoints} points
                    </Text>
                    <View style={[styles.modernLoyaltyIcon, { backgroundColor: colors.primary }]}>
                      <Icon name="star" size={12} color="white" />
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Modern Save Button */}
            {isEditing && (
              <TouchableOpacity
                style={[
                  styles.modernSaveButton,
                  { 
                    backgroundColor: hasChanges ? colors.primary : colors.disabled,
                    opacity: hasChanges ? 1 : 0.6
                  }
                ]}
                onPress={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Icon name="checkmark" size={16} color="white" />
                <Text style={styles.modernSaveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Modern Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View 
            key={section.title} 
            style={[
              styles.modernSection, 
              { 
                backgroundColor: colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Modern Section Header */}
            <View style={styles.modernSectionHeader}>
              <View style={styles.modernSectionTitleContainer}>
                <View style={[styles.modernSectionIcon, { backgroundColor: colors.primary }]}>
                  <Icon 
                    name={
                      section.title === 'Personalization' ? 'palette' :
                      section.title === 'Legal' ? 'file-document' :
                      'cog'
                    } 
                    size={20} 
                    color="white" 
                  />
                </View>
                <Text style={[styles.modernSectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
            </View>

            {/* Modern Settings Items */}
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.modernSettingItem,
                  { borderBottomColor: colors.border },
                  itemIndex === section.items.length - 1 && styles.modernLastItem,
                ]}
                onPress={() => {
                  console.log('🚪 Settings item pressed:', item.id, 'onPress:', !!item.onPress);
                  if (item.onPress) {
                    item.onPress();
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={styles.modernSettingItemLeft}>
                  <View style={[styles.modernSettingIcon, { backgroundColor: item.color || colors.primary }]}>
                    <Icon
                      name={item.icon as any}
                      size={18}
                      color="white"
                    />
                  </View>
                  <View style={styles.modernSettingContent}>
                    <Text style={[styles.modernSettingTitle, { color: item.color || colors.text }]}>
                      {item.title}
                    </Text>
                    {item.id === 'theme' && (
                      <Text style={[styles.modernSettingSubtitle, { color: colors.textSecondary }]}>
                        {isDark ? 'Dark mode enabled' : 'Light mode enabled'}
                      </Text>
                    )}
                    {item.id === 'logout' && (
                      <Text style={[styles.modernSettingSubtitle, { color: colors.textSecondary }]}>
                        {logoutHelpText}
                      </Text>
                    )}
                  </View>
                </View>

                {item.type === 'toggle' ? (
                  <View style={[styles.modernToggleContainer, { backgroundColor: item.value ? colors.primary : colors.border }]}>
                    <View style={[styles.modernToggleThumb, { backgroundColor: 'white' }]} />
                  </View>
                ) : (
                  <View style={[styles.modernChevronContainer, { backgroundColor: colors.border }]}>
                    <Icon name="chevron-right" size={16} color={colors.textSecondary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        ))}

        {/* App Version */}
        <Animated.View 
          style={[
            styles.appVersion,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.appVersionText, { color: colors.textSecondary }]}>
            Version {APP_VERSION}
          </Text>
        </Animated.View>

        <View style={styles.bottomSpacing} />
      </Animated.ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Icon name="alert" size={48} color={colors.error} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Delete Account</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Loading Overlay */}
      {isLoggingOut && (
        <Modal
          visible={isLoggingOut}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {}} // Prevent closing during logout
        >
          <View style={[styles.logoutOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.logoutContent, { backgroundColor: colors.card }]}>
              <LoadingSpinner size="large" />
              <Text style={[styles.logoutTitle, { color: colors.text }]}>Logging Out</Text>
              <Text style={[styles.logoutMessage, { color: colors.textSecondary }]}>
                Please wait while we securely log you out...
              </Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  // Modern Header Styles
  modernHeader: {
    paddingTop: Platform.OS === 'ios' ? (isSmallScreen ? 60 : 80) : (isSmallScreen ? 40 : 60),
    paddingBottom: isSmallScreen ? 40 : 60,
    paddingHorizontal: horizontalPadding,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#9334ea',
    opacity: 0.95,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    borderRadius: 100,
    opacity: 0.1,
  },
  floatingCircle1: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    top: -20,
    right: -20,
  },
  floatingCircle2: {
    width: 80,
    height: 80,
    backgroundColor: 'white',
    bottom: 20,
    left: -10,
  },
  floatingCircle3: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    top: 100,
    right: 50,
  },
  modernHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  
  // Modern Avatar Styles
  modernAvatarContainer: {
    marginRight: 20,
    position: 'relative',
  },
  avatarRing: {
    position: 'absolute',
    width: isSmallScreen ? 80 : isLargeScreen ? 100 : 90,
    height: isSmallScreen ? 80 : isLargeScreen ? 100 : 90,
    borderRadius: isSmallScreen ? 40 : isLargeScreen ? 50 : 45,
    borderWidth: 3,
    top: -3,
    left: -3,
  },
  modernAvatar: {
    width: isSmallScreen ? 74 : isLargeScreen ? 94 : 84,
    height: isSmallScreen ? 74 : isLargeScreen ? 94 : 84,
    borderRadius: isSmallScreen ? 37 : isLargeScreen ? 47 : 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modernAvatarText: {
    fontSize: isSmallScreen ? 24 : isLargeScreen ? 32 : 28,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  modernStatusIndicator: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  // Modern User Info Styles
  modernUserInfo: {
    flex: 1,
  },
  modernUserName: {
    fontSize: isSmallScreen ? 22 : isLargeScreen ? 28 : 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modernUserSubtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    fontWeight: '500',
  },
  modernStatsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modernStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    flex: 1,
    minWidth: 0,
    maxWidth: '100%',
  },
  modernStatIcon: {
    marginRight: 6,
  },
  modernStatText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    flexShrink: 1,
  },
  
  // Modern Content Styles
  content: {
    flex: 1,
    paddingHorizontal: horizontalPadding,
  },
  scrollContent: {
    paddingBottom: isSmallScreen ? 20 : 40,
  },
  
  // Modern Section Styles
  modernSection: {
    borderRadius: 24,
    padding: cardPadding,
    marginBottom: isSmallScreen ? 16 : 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modernSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 16 : 20,
  },
  modernSectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernSectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modernSectionTitle: {
    fontSize: isSmallScreen ? 18 : isLargeScreen ? 22 : 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modernEditButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Modern Profile Fields Styles
  modernProfileFields: {
    gap: isSmallScreen ? 16 : 20,
  },
  modernFieldGroup: {
    gap: isSmallScreen ? 8 : 12,
  },
  modernFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  modernFieldLabel: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  modernInputContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modernInput: {
    fontSize: isSmallScreen ? 15 : 16,
    paddingVertical: 12,
    fontWeight: '500',
  },
  modernFieldValueContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  modernFieldValue: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '500',
  },
  modernStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    maxWidth: '100%',
    flexShrink: 1,
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginLeft: 4,
  },
  modernLoyaltyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernLoyaltyIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modernSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  
  // Modern Settings Styles
  modernSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 16 : 20,
    borderBottomWidth: 1,
  },
  modernLastItem: {
    borderBottomWidth: 0,
  },
  modernSettingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernSettingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernSettingContent: {
    flex: 1,
  },
  modernSettingTitle: {
    fontSize: isSmallScreen ? 15 : 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modernSettingSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    opacity: 0.7,
  },
  modernToggleContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  modernToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  modernChevronContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // App Version Styles
  appVersion: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 20 : 24,
  },
  appVersionText: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '500',
    opacity: 0.6,
  },
  bottomSpacing: {
    height: isSmallScreen ? 24 : 32,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  modernProfileSection: {
    marginTop: 20,
  },
  logoutOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
    alignItems: 'center',
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  logoutMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
