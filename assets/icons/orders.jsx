import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

const SvgIcon = props => {
  const isActive = props.color === '#9334ea' || props.color === props.fill;
  const iconColor = isActive ? props.fill || props.color || '#9334ea' : props.stroke || props.color || '#6B7280';
  const strokeWidth = 1.5;

  return (
    <Svg width={props.width || '24'} height={props.height || '24'} viewBox="0 0 24 24" {...props}>
      {/* Modern shopping bag/clipboard design */}
      <Path
        fill={isActive ? iconColor : 'none'}
        stroke={isActive ? 'none' : iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 8V6a4 4 0 0 0-8 0v2"
      />
      <Path
        fill={isActive ? iconColor : 'none'}
        stroke={isActive ? 'none' : iconColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 8h14l-1 12H6L5 8z"
      />
      
      {/* Modern order lines with better spacing */}
      <Path
        fill={isActive ? '#FFFFFF' : iconColor}
        stroke={isActive ? 'none' : 'none'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        d="M8 12h8M8 15h6M8 18h4"
      />
      
      {/* Small notification dot for active state */}
      {isActive && (
        <Circle
          cx="18"
          cy="6"
          r="3"
          fill="#FF6B6B"
          stroke="#FFFFFF"
          strokeWidth="1"
        />
      )}
    </Svg>
  );
};

export default SvgIcon;
