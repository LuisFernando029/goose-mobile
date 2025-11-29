import { Stack } from 'expo-router';

export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="identificacao" />
      <Stack.Screen name="mesas" />
      <Stack.Screen name="cardapio" />
    </Stack>
  );
}