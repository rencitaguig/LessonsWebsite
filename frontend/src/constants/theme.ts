/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#242432',
    background: '#101b35',
    backgroundElement: '#F8F7FC',
    backgroundSelected: '#F0EEF6',
    textSecondary: '#c4c9d8',
  },
  dark: {
    text: '#242432',
    background: '#101b35',
    backgroundElement: '#F8F7FC',
    backgroundSelected: '#F0EEF6',
    textSecondary: '#c4c9d8',
  },
} as const;

export const Palette = {
  ink: '#242432',
  muted: '#686775',
  paper: '#F8F7FC',
  surface: '#F8F7FC',
  surfaceSubtle: '#F0EEF6',
  canvas: '#101b35',
  orchid: '#d174d2',
  orchidDeep: '#a84bab',
  coral: '#e0563f',
  slate: '#3f567f',
  plum: '#412653',
  border: '#e6e1eb',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
