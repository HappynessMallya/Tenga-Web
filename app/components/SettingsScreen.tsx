// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  SafeAreaView,
  Linking,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

// Hooks and Services
import { useTheme } from '../providers/ThemeProvider';
import { useCurrentUser, useUpdateUser, useUpdateUserProfile } from '../hooks/useServiceQueries';
import { useAuth } from '../hooks/useAuth';
import { logger } from '../utils/logger';

// Components
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorView } from './ErrorView';
import { Button } from './Button';

interface SettingsScreenProps {
  userRole: 'customer' | 'vendor' | 'delivery';
  extraSections?: React.ReactNode;
  headerGradient?: string[];
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  userRole,
  extraSections,
  headerGradient = ['#9334ea', '#9334ea'],
}) => {
  const { colors, theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Query hooks
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  const updateUserMutation = useUpdateUser();
  const updateProfileMutation = useUpdateUserProfile();

  // Derived state
  const isLoading = userLoading;
  const hasError = userError;
  const isSaving = updateUserMutation.isPending || updateProfileMutation.isPending;
  const isDarkMode = theme === 'dark';

  // Initialize form data
  useEffect(() => {
    if (user) {
      setName(user.full_name || '');
      setPhone(user.phone || '');
      setEmail(user.email || '');

      logger.info('Settings screen accessed', { userId: user.id, role: userRole });
    }
  }, [user, userRole]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    // Validation
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    try {
      // Update both user and profile data
      await Promise.all([
        updateUserMutation.mutateAsync({
          userId: user.id,
          data: { full_name: trimmedName, phone: trimmedPhone },
        }),
        updateProfileMutation.mutateAsync({
          userId: user.id,
          data: { full_name: trimmedName, phone: trimmedPhone },
        }),
      ]);

      Alert.alert('Success', 'Profile updated successfully!');
      logger.info('Profile updated successfully', {
        userId: user.id,
        role: userRole,
        changes: { name: trimmedName, phone: trimmedPhone },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Error', errorMessage);
      logger.error('Failed to update profile', {
        userId: user.id,
        role: userRole,
        error: errorMessage,
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            logger.info('🔄 Starting logout process', { userId: user?.id, role: userRole });
            
            await signOut();
            
            logger.info('✅ User logged out successfully', { userId: user?.id, role: userRole });
            
            // Show success message
            Alert.alert(
              'Logged Out',
              'You have been successfully logged out.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // Navigation will be handled by auth state change
                    console.log('✅ Logout confirmation acknowledged');
                  }
                }
              ]
            );
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
            
            logger.error('❌ Failed to logout', { 
              userId: user?.id, 
              role: userRole,
              error: errorMessage,
              stack: error instanceof Error ? error.stack : undefined
            });
            
            Alert.alert(
              'Logout Failed',
              `There was an issue logging you out: ${errorMessage}\n\nPlease try again or restart the app if the problem persists.`,
              [
                { text: 'Try Again', style: 'default' },
                { text: 'OK', style: 'cancel' }
              ]
            );
          }
        },
      },
    ]);
  };

  const handleOpenLink = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        logger.info('External link opened', { url, title, userId: user?.id });
      } else {
        Alert.alert('Error', `Cannot open ${title}. Please check your browser settings.`);
      }
    } catch (error) {
      logger.error('Failed to open external link', { url, title, error });
      Alert.alert('Error', `Failed to open ${title}`);
    }
  };

  const getRoleDisplayName = () => {
    switch (userRole) {
      case 'customer':
        return 'Customer';
      case 'vendor':
        return 'Vendor';
      case 'delivery':
        return 'Delivery Agent';
      default:
        return 'User';
    }
  };

  const hasProfileChanges =
    name.trim() !== (user?.full_name || '') || phone.trim() !== (user?.phone || '');

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" backgroundColor="#9334ea" />
        <LoadingSpinner size="large" message="Loading your settings..." variant="default" />
      </SafeAreaView>
    );
  }

  // Error state
  if (hasError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" backgroundColor="#9334ea" />
        <ErrorView message="Failed to load your settings" onRetry={refetchUser} />
      </SafeAreaView>
    );
  }

  // No user - redirect to auth
  if (!user) {
    router.replace('/(auth)/auth');
    return null;
  }

  const SettingsCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({
    title,
    subtitle,
    icon,
    rightElement,
    onPress,
    showArrow = false,
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightElement}
        {showArrow && <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
      </View>
    </TouchableOpacity>
  );

  const InputField = ({
    label,
    value,
    onChangeText,
    placeholder,
    editable = true,
    keyboardType = 'default',
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    editable?: boolean;
    keyboardType?: any;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          {
            color: colors.text,
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
          !editable && { opacity: 0.6 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        editable={editable && !isSaving}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar style="light" backgroundColor="#9334ea" />

      {/* Header */}
      <LinearGradient colors={headerGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage your {getRoleDisplayName().toLowerCase()} account
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Information */}
        <SettingsCard title="Profile Information">
          <View style={styles.profileInfo}>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              {getRoleDisplayName()}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
          </View>

          <InputField
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
          />

          <InputField
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <InputField
            label="Email Address"
            value={email}
            onChangeText={() => {}} // Email is read-only
            placeholder="Email address"
            editable={false}
          />

          {hasProfileChanges && (
            <Button
              title={isSaving ? 'Saving...' : 'Save Changes'}
              onPress={handleSaveProfile}
              loading={isSaving}
              style={styles.saveButton}
              size="medium"
            />
          )}
        </SettingsCard>

        {/* Theme Settings */}
        <SettingsCard title="Appearance">
          <SettingsItem
            title="Dark Mode"
            subtitle={isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
            icon="moon-outline"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
          />
        </SettingsCard>

        {/* Notification Settings */}
        <SettingsCard title="Notifications">
          <SettingsItem
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            icon="bell-outline"
            rightElement={
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
          />

          <SettingsItem
            title="Email Updates"
            subtitle="Receive updates via email"
            icon="mail-outline"
            rightElement={
              <Switch
                value={emailUpdates}
                onValueChange={setEmailUpdates}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
              />
            }
          />
        </SettingsCard>

        {/* Role-specific extra sections */}
        {extraSections}

        {/* Legal & Support */}
        <SettingsCard title="Legal & Support">
          <SettingsItem
            title="Privacy Policy"
            subtitle="Learn how we protect your data"
            icon="shield-checkmark-outline"
            onPress={() => handleOpenLink('https://example.com/privacy', 'Privacy Policy')}
            showArrow
          />

          <SettingsItem
            title="Terms & Conditions"
            subtitle="Read our terms of service"
            icon="document-text-outline"
            onPress={() => handleOpenLink('https://example.com/terms', 'Terms & Conditions')}
            showArrow
          />

          <SettingsItem
            title="Contact Support"
            subtitle="Get help when you need it"
            icon="help-circle-outline"
            onPress={() => handleOpenLink('mailto:support@tengalaundry.com', 'Contact Support')}
            showArrow
          />
        </SettingsCard>

        {/* Account Actions */}
        <SettingsCard title="Account">
          <SettingsItem
            title="App Version"
            subtitle="Version 1.0.0"
            icon="information-circle-outline"
          />

          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.error }]}
            onPress={handleLogout}
            disabled={isSaving}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
          </TouchableOpacity>
        </SettingsCard>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    marginTop: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 4,
  },
  scrollContainer: {
    flex: 1,
    marginTop: -20,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileInfo: {
    marginBottom: 20,
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileRole: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
