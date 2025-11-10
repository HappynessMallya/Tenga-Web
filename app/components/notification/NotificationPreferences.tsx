// @ts-nocheck
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { useNotifications } from '../../providers/NotificationProvider';

export const NotificationPreferences: React.FC = () => {
  const { colors } = useTheme();
  const { preferences, updatePreferences } = useNotifications();

  const togglePreference = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Notification Preferences</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <View style={styles.preference}>
          <Text style={[styles.label, { color: colors.text }]}>Order Updates</Text>
          <Switch
            value={preferences.orderUpdates}
            onValueChange={() => togglePreference('orderUpdates')}
          />
        </View>
        <View style={styles.preference}>
          <Text style={[styles.label, { color: colors.text }]}>Promotions</Text>
          <Switch
            value={preferences.promotions}
            onValueChange={() => togglePreference('promotions')}
          />
        </View>
        <View style={styles.preference}>
          <Text style={[styles.label, { color: colors.text }]}>Delivery Updates</Text>
          <Switch
            value={preferences.deliveryUpdates}
            onValueChange={() => togglePreference('deliveryUpdates')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sound & Vibration</Text>
        <View style={styles.preference}>
          <Text style={[styles.label, { color: colors.text }]}>Sound</Text>
          <Switch
            value={preferences.soundEnabled}
            onValueChange={() => togglePreference('soundEnabled')}
          />
        </View>
        <View style={styles.preference}>
          <Text style={[styles.label, { color: colors.text }]}>Vibration</Text>
          <Switch
            value={preferences.vibrationEnabled}
            onValueChange={() => togglePreference('vibrationEnabled')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
  },
});
