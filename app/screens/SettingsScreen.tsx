// @ts-nocheck
import { useState } from 'react';
import { View, StyleSheet, Switch, Alert, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../hooks/useAuth';

// SettingItem component
const SettingItem = ({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={onToggle}
    >
      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={value ? colors.background : colors.text}
      />
    </TouchableOpacity>
  );
};

export const SettingsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    locationServices: true,
  });

  const handleToggle = async (key: string) => {
    try {
      const newValue = !settings[key];
      setSettings(prev => ({ ...prev, [key]: newValue }));
      // UI-only: no backend update
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
      setSettings(prev => ({ ...prev, [key]: !settings[key] }));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <SettingItem
          label="Push Notifications"
          value={settings.pushNotifications}
          onToggle={() => handleToggle('pushNotifications')}
        />
        <SettingItem
          label="Email Notifications"
          value={settings.emailNotifications}
          onToggle={() => handleToggle('emailNotifications')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <SettingItem
          label="Dark Mode"
          value={settings.darkMode}
          onToggle={() => handleToggle('darkMode')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
        <SettingItem
          label="Location Services"
          value={settings.locationServices}
          onToggle={() => handleToggle('locationServices')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
});
