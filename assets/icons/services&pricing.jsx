import React from 'react';
import { Svg, Path, G, Defs, ClipPath } from 'react-native-svg';

const SvgIcon = props => {
  const isActive = props.color === '#9334ea' || props.color === props.fill;

  return (
    <Svg width={props.width || '25'} height={props.height || '25'} viewBox="0 0 25 25" {...props}>
      <G clipPath="url(#clip0_260_1285)">
        <Path
          fill={isActive ? props.fill || props.color || '#9334ea' : 'none'}
          stroke={isActive ? 'none' : props.stroke || props.color || '#000'}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18.988 1.625h-5.763c-.179 0-.35.07-.478.197L1.227 13.339a1.35 1.35 0 0 0 0 1.908l5.485 5.484a1.353 1.353 0 0 0 1.908 0L20.137 9.22a.68.68 0 0 0 .196-.478V2.975a1.344 1.344 0 0 0-1.345-1.35"
        />
        {/* Main circle - white when active, original color when not */}
        <Path
          fill={isActive ? '#FFFFFF' : props.fill || props.color || '#000'}
          d="M16.583 6.875a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
        />
        {/* Wire with unique color when active */}
        <Path
          fill={isActive ? '#FFD700' : 'none'}
          stroke={isActive ? '#FFD700' : props.stroke || props.color || '#000'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2 : 1}
          d="m13.62 18.731 7.5-11.25m-6.062 14.393a2.25 2.25 0 1 1-3.182-3.182 2.25 2.25 0 0 1 3.182 3.182"
        />
        {/* Additional small white circle when active */}
        {isActive && (
          <Path fill="#FFFFFF" d="M14.583 18.875a0.75 0.75 0 1 1 0-1.5 0.75 0.75 0 0 1 0 1.5" />
        )}
      </G>
      <Defs>
        <ClipPath id="clip0_260_1285">
          <Path fill="#fff" d="M.583.625h24v24h-24z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIcon;
