// theme.ts
import { Platform } from 'react-native';

// Cores convertidas de oklch() para hexadecimal
export const Colors = {
  light: {
    background: '#FFFFFF', // --background
    foreground: '#252525', // --foreground
    card: '#FFFFFF', // --card
    cardForeground: '#252525', // --card-foreground
    primary: '#343434', // --primary
    primaryForeground: '#FBFBFB', // --primary-foreground
    secondary: '#F7F7F7', // --secondary
    secondaryForeground: '#343434', // --secondary-foreground
    muted: '#F7F7F7', // --muted
    mutedForeground: '#8D8D8D', // --muted-foreground
    accent: '#F7F7F7', // --accent
    accentForeground: '#343434', // --accent-foreground
    destructive: '#B24A3E', // --destructive
    destructiveForeground: '#B24A3E', // --destructive-foreground
    border: '#EAEAEA', // --border
    input: '#EAEAEA', // --input
    ring: '#B4B4B4', // --ring
    sidebar: '#FBFBFB', // --sidebar
    sidebarForeground: '#252525', // --sidebar-foreground
    sidebarPrimary: '#343434', // --sidebar-primary
    sidebarPrimaryForeground: '#FBFBFB', // --sidebar-primary-foreground
    sidebarAccent: '#F7F7F7', // --sidebar-accent
    sidebarAccentForeground: '#343434', // --sidebar-accent-foreground
    sidebarBorder: '#EAEAEA', // --sidebar-border
    sidebarRing: '#B4B4B4', // --sidebar-ring
  },
  dark: {
    background: '#252525', // --background
    foreground: '#FBFBFB', // --foreground
    card: '#252525', // --card
    cardForeground: '#FBFBFB', // --card-foreground
    primary: '#FBFBFB', // --primary
    primaryForeground: '#343434', // --primary-foreground
    secondary: '#444444', // --secondary
    secondaryForeground: '#FBFBFB', // --secondary-foreground
    muted: '#444444', // --muted
    mutedForeground: '#B4B4B4', // --muted-foreground
    accent: '#444444', // --accent
    accentForeground: '#FBFBFB', // --accent-foreground
    destructive: '#8C3B33', // --destructive
    destructiveForeground: '#A85245', // --destructive-foreground
    border: '#444444', // --border
    input: '#444444', // --input
    ring: '#707070', // --ring
    sidebar: '#343434', // --sidebar
    sidebarForeground: '#FBFBFB', // --sidebar-foreground
    sidebarPrimary: '#655DFF', // --sidebar-primary
    sidebarPrimaryForeground: '#FBFBFB', // --sidebar-primary-foreground
    sidebarAccent: '#444444', // --sidebar-accent
    sidebarAccentForeground: '#FBFBFB', // --sidebar-accent-foreground
    sidebarBorder: '#444444', // --sidebar-border
    sidebarRing: '#707070', // --sidebar-ring
  },
};

// Fontes padronizadas (com fallback seguro para iOS, Android e Web)
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Times New Roman',
    rounded: 'SF Pro Rounded',
    mono: 'Menlo',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-rounded',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: 'system-ui',
    serif: 'serif',
    rounded: 'system-ui',
    mono: 'monospace',
  },
});
