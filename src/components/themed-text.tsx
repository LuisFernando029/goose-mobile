// src/components/themed-text.tsx - CORRIGIDO
import { Text, TextProps, TextStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();

  const getColor = (): string => {
    return colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  };

  const getStyles = (): TextStyle => {
    switch (type) {
      case 'title':
        return {
          fontSize: 32,
          fontWeight: 'bold',
          color: getColor(),
        } as TextStyle;
      case 'subtitle':
        return {
          fontSize: 20,
          fontWeight: 'bold',
          color: getColor(),
        } as TextStyle;
      case 'link':
        return {
          fontSize: 16,
          color: '#3B82F6',
          textDecorationLine: 'underline',
        } as TextStyle;
      case 'defaultSemiBold':
        return {
          fontSize: 16,
          fontWeight: '600',
          color: getColor(),
        } as TextStyle;
      default:
        return {
          fontSize: 16,
          color: getColor(),
        } as TextStyle;
    }
  };

  return <Text style={[getStyles(), style]} {...rest} />;
}