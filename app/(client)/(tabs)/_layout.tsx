import { Tabs } from 'expo-router';
import { ShoppingBag, Receipt } from 'lucide-react-native';

export default function ClientTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#18181B',
          borderTopColor: '#3F3F46',
        },
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#9CA3AF',
      }}>
      <Tabs.Screen
        name="cardapio"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ color, size }) => <ShoppingBag size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meusPedidos"
        options={{
          title: 'Meus Pedidos',
          tabBarIcon: ({ color, size }) => <Receipt size={size} color={color} />,
        }}
      />
      {/* Esconde as outras tabs mas mantém as rotas disponíveis */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Remove do tab bar
        }}
      />
      <Tabs.Screen
        name="mesas"
        options={{
          href: null, // Remove do tab bar
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          href: null, // Remove do tab bar
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Remove do tab bar
        }}
      />
    </Tabs>
  );
}