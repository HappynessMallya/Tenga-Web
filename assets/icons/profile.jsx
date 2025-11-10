import React from 'react';
import { Svg, Path } from 'react-native-svg';

const SvgIcon = props => {
  const isActive = props.color === '#9334ea' || props.color === props.fill;

  return (
    <Svg width={props.width || '25'} height={props.height || '25'} viewBox="0 0 25 25" {...props}>
      <Path
        fill={isActive ? props.fill || props.color || '#9334ea' : 'none'}
        stroke={isActive ? 'none' : props.stroke || props.color || '#000'}
        strokeLinejoin="round"
        strokeWidth="1.875"
        d="M2.583 19.625a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5 2.5 2.5 0 0 1-2.5 2.5h-15a2.5 2.5 0 0 1-2.5-2.5Z"
      />
      <Path
        fill={isActive ? props.fill || props.color || '#9334ea' : 'none'}
        stroke={isActive ? 'none' : props.stroke || props.color || '#000'}
        strokeWidth="1.875"
        d="M12.583 9.625a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
      />
    </Svg>
  );
};

export default SvgIcon;
