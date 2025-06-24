// Em app/(tabs)/_layout.tsx

import { Tabs, Link } from 'expo-router';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useCart } from '../../src/context/CartContext';

export default function TabLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs screenOptions={{
      headerRight: () => (
        <Link href="/cart" asChild>
          <Pressable style={{ marginRight: 15, flexDirection: 'row', alignItems: 'center' }}>
            <FontAwesome name="shopping-cart" size={24} color="black" />
            {totalItems > 0 && 
              <View style={{ position: 'absolute', right: -8, top: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
                {/* Mudar de 'items.length' para 'totalItems' */}
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{totalItems}</Text>
              </View>
            }
          </Pressable>
        </Link>
      )
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurantes',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meus-pedidos"
        options={{
          title: 'Meus Pedidos',
          tabBarIcon: ({ color }) => <FontAwesome name="list-alt" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}