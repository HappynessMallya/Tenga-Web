// NativeWind type declarations
/// <reference types="nativewind/types" />

// Expo Router types
declare module 'expo-router' {
  import type { FC } from 'react';

  export interface ExpoRootProps {
    context: any;
  }

  export const ExpoRoot: FC<ExpoRootProps>;
}

declare module 'node' {
  interface Require {
    context: (directory: string, useSubdirectories?: boolean, regExp?: RegExp) => any;
  }
}

// SVG type declarations
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
