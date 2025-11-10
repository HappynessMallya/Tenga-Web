import * as React from 'react';
import { Svg, Path, G, Circle, Rect } from 'react-native-svg';

const SvgIcon = props => (
  <Svg
    width={props.width || '397'}
    height={props.height || '211'}
    viewBox="0 0 397 211"
    style={props.style}
    {...props}
  >
    <G>
      {/* Washing machine body */}
      <Path
        fill="#E0E0E0"
        d="M10.333 10.625c0-5.523 4.478-10 10-10h366c5.523 0 10 4.477 10 10v180h-386z"
      />

      {/* Washing machine door */}
      <Circle cx="198.333" cy="100.625" r="40" fill="#D0D0D0" stroke="#A0A0A0" strokeWidth="2" />

      {/* Door handle */}
      <Circle cx="198.333" cy="100.625" r="8" fill="#808080" />

      {/* Control panel */}
      <Rect x="30.333" y="30.625" width="336" height="30" fill="#C0C0C0" />

      {/* Control buttons */}
      <Circle cx="60.333" cy="45.625" r="8" fill="#606060" />
      <Circle cx="90.333" cy="45.625" r="8" fill="#606060" />
      <Circle cx="120.333" cy="45.625" r="8" fill="#606060" />

      {/* Display */}
      <Rect x="200.333" y="35.625" width="120" height="10" fill="#404040" />
    </G>
  </Svg>
);

export default SvgIcon;
