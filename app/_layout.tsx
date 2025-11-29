// app/_layout.tsx - CRITICO: Este arquivo está faltando!
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userType = await AsyncStorage.getItem('userType');
      
      // Se já está autenticado como admin, vai para o dashboard
      if (userType === 'admin') {
        router.replace('/(admin)/(tabs)');
      }
      // Se já está autenticado como cliente, vai para identificação
      else if (userType === 'client') {
        router.replace('/(client)/identificacao');
      }
      // Se não está autenticado, fica na tela inicial (index.tsx)
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    }
  };

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(client)" />
      <Stack.Screen name="auth" />
    </Stack>
  );
}