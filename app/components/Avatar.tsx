// @ts-nocheck
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';

interface AvatarProps {
  size?: number;
  source?: { uri: string } | number;
  name?: string;
  onPress?: () => void;
  showEditIcon?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 80,
  source,
  name = '',
  onPress,
  showEditIcon = false,
}) => {
  const { colors } = useTheme();

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const renderContent = () => {
    if (source) {
      return <Image source={source} style={[avatarStyle, styles.image]} resizeMode="cover" />;
    }

    return (
      <View style={[avatarStyle, styles.placeholder, { backgroundColor: colors.primary + '20' }]}>
        <Text
          style={[
            styles.initials,
            {
              color: colors.primary,
              fontSize: size * 0.35,
            },
          ]}
        >
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  const avatar = (
    <View style={styles.container}>
      {renderContent()}
      {showEditIcon && (
        <View style={[styles.editIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="camera-outline" size={size * 0.25} color={colors.text} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{avatar}</TouchableOpacity>;
  }

  return avatar;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {},
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '600',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
});
