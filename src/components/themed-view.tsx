// src/components/themed-view.tsx - CORRIGIDO
import { View, ViewProps } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function ThemedView({ style, ...rest }: ViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#18181B' : '#FFFFFF';

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}