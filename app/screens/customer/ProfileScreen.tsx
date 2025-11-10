// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { router } from 'expo-router';

// TanStack Query Hooks
import { useCurrentUser, useUpdateUser, useUpdateUserProfile } from '../../hooks/useServiceQueries';

// Services and Components
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../providers/ThemeProvider';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Avatar } from '../../components/Avatar';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { ErrorView } from '../../components/ErrorView';
import { logger } from '../../utils/logger';

export const ProfileScreen = () => {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  // TanStack Query hooks
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useCurrentUser();

  const updateUserMutation = useUpdateUser();
  const updateProfileMutation = useUpdateUserProfile();

  // Local state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
      logger.info('Profile screen accessed', { userId: user.id });
    }
  }, [user]);

  // Derived state
  const isLoading = userLoading;
  const isUpdating = updateUserMutation.isPending || updateProfileMutation.isPending;

  const handleUpdateUser = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    // Validate required fields
    if (!formData.full_name.trim()) {
      Alert.alert('Validation Error', 'Full name is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Validation Error', 'Phone number is required');
      return;
    }

    try {
      logger.info('Updating user profile', { userId: user.id });

      const updateData = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
      };

      // Use TanStack Query mutation for updating user
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: updateData,
      });

      Alert.alert('Success', 'Profile updated successfully!');

      // Refresh user data to get latest information
      await refetchUser();

      logger.info('Profile updated successfully', { userId: user.id });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      logger.error('Failed to update profile', { userId: user.id, error: errorMessage });
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSignOut = async () => {
    try {
      logger.info('User signing out', { userId: user?.id });
      await signOut();
      // Navigate to welcome screen after logout
      router.replace('/(auth)/welcome');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      logger.error('Sign out error', { error: errorMessage });
      Alert.alert('Error', errorMessage);
    }
  };

  const handleChangePhoto = () => {
    // TODO: Implement photo upload functionality
    Alert.alert('Photo Upload', 'Photo upload functionality will be available soon!', [
      { text: 'OK' },
    ]);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <LoadingSpinner size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorView
          error={userError || new Error('User not found')}
          onRetry={refetchUser}
          title="Profile Error"
          message="Unable to load your profile information"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <Avatar
          size={100}
          {...(user.avatar_url && { source: { uri: user.avatar_url } })}
          name={user.full_name || user.email || 'User'}
        />
        <Button
          title="Change Photo"
          onPress={handleChangePhoto}
          variant="secondary"
          style={styles.changePhotoButton}
          disabled={isUpdating}
        />
      </View>

      {/* Profile Form */}
      <View style={styles.form}>
        <Input
          label="Full Name"
          value={formData.full_name}
          onChangeText={text => handleInputChange('full_name', text)}
          placeholder="Enter your full name"
          autoCapitalize="words"
          editable={!isUpdating}
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
          keyboardType="phone-pad"
          placeholder="Enter your phone number"
          editable={!isUpdating}
        />

        <Input
          label="Email Address"
          value={formData.email}
          editable={false}
          placeholder="Email cannot be changed"
          style={[styles.disabledInput, { backgroundColor: colors.border }]}
        />

        <Button
          title="Update Profile"
          onPress={handleUpdateUser}
          loading={isUpdating}
          disabled={isUpdating || !formData.full_name.trim() || !formData.phone.trim()}
          style={styles.updateButton}
        />

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          style={styles.signOutButton}
          disabled={isUpdating}
        />
      </View>

      {/* Profile Stats Section */}
      <View
        style={[styles.statsSection, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.statsTitle, { color: colors.text }]}>Account Information</Text>

        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>User ID</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {user.id.slice(-8).toUpperCase()}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Member Since</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {new Date(user.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Account Status</Text>
          <Text style={[styles.statValue, { color: colors.success }]}>Active</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
  },
  changePhotoButton: {
    marginTop: 16,
    minWidth: 120,
  },
  form: {
    padding: 16,
    gap: 16,
  },
  disabledInput: {
    opacity: 0.6,
  },
  updateButton: {
    marginTop: 8,
  },
  signOutButton: {
    marginTop: 16,
  },
  statsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
