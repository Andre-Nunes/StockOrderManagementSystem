// Ficheiro: src/context/CartContext.tsx (versão melhorada)

import React, { createContext, useContext, useState } from 'react';
import { MenuItem } from '../types';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  incrementItem: (itemId: number) => void;  // <-- NOVA FUNÇÃO
  decrementItem: (itemId: number) => void;  // <-- NOVA FUNÇÃO
  removeItem: (itemId: number) => void;     // <-- NOVA FUNÇÃO
  clearCart: () => void;
  total: number;
  totalItems: number; // <-- NOVO VALOR para o ícone do carrinho
};

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  incrementItem: () => {},
  decrementItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  total: 0,
  totalItems: 0,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const incrementItem = (itemId: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementItem = (itemId: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0) // Remove o item se a quantidade for 0
    );
  };
  
  const removeItem = (itemId: number) => {
    setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId)
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, incrementItem, decrementItem, removeItem, clearCart, total, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);