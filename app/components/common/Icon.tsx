// @ts-nocheck
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../providers/ThemeProvider';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color, style }) => {
  const { colors } = useTheme();
  return (
    <MaterialCommunityIcons name={name} size={size} color={color || colors.text} style={style} />
  );
};
