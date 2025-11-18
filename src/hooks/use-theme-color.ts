import { useColorScheme } from './use-color-scheme';

// Primeiro, defina a interface para as cores
interface ColorScheme {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  muted: string;
  border: string;
}

// Depois, defina o objeto Colors com a tipagem
const Colors = {
  light: {
    background: '#ffffff',
    foreground: '#1f2937',
    primary: '#3b82f6',
    secondary: '#6b7280',
    muted: '#9ca3af',
    border: '#e5e7eb',
  },
  dark: {
    background: '#111827',
    foreground: '#f9fafb',
    primary: '#60a5fa',
    secondary: '#9ca3af',
    muted: '#6b7280',
    border: '#374151',
  },
} as const; // 'as const' para tipos literais

// Agora defina o tipo para as chaves de cor
type ColorKey = keyof typeof Colors.light;

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorKey
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[theme][colorName];
}