import { Tabs } from 'expo-router';
import { LayoutGrid, Utensils, ShoppingBag, ClipboardList, BarChart3, MapPin } from 'lucide-react-native';

export default function AdminTabLayout() {
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
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mesas"
        options={{
          title: 'Mesas',
          tabBarIcon: ({ color, size }) => <LayoutGrid size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cardapio"
        options={{
          title: 'Cardápio',
          tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}