import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/src/components/haptic-tab';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

const darkTheme = {
  primary: '#10b981',
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  border: '#334155',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: darkTheme.primary,
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderTopWidth: 0,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 20,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        },
        tabBarShowLabel: false,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>

      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.floatingIcon,
              focused && styles.floatingIconActive
            ]}>
              <Ionicons 
                name="home" 
                size={24} 
                color={focused ? 'white' : color} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="mesas"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.floatingIcon,
              focused && styles.floatingIconActive
            ]}>
              <Ionicons 
                name="list" 
                size={24} 
                color={focused ? 'white' : color} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="mapa"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.floatingIcon,
              focused && styles.floatingIconActive
            ]}>
              <Ionicons 
                name="map" 
                size={24} 
                color={focused ? 'white' : color} 
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="cardapio"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.floatingIcon,
              focused && styles.floatingIconActive
            ]}>
              <FontAwesome5 
                name="book-open" 
                size={22} 
                color={focused ? 'white' : color} 
              />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  floatingIconActive: {
    backgroundColor: '#10b981',
  },
});
