import { Stack } from 'expo-router';
import React from 'react';

// Importar os nossos dois provedores de contexto
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';

// Este é o único componente de layout que precisamos
export default function RootLayout(): React.JSX.Element {
  return (
    <AuthProvider>
      <CartProvider>
        <Stack>
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="menu/[id]" options={{ headerShown: true, title: "Menu" }} />
          {/* NOVO: Registar a tela de carrinho como um 'modal' */}
          <Stack.Screen name="cart" options={{ presentation: 'modal', title: "Carrinho" }} />
          <Stack.Screen 
            name="order/[id]" 
            options={{ 
              headerShown: true, 
              title: "Avaliar Pedido" 
            }} 
          />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}