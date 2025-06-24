import React from 'react';
import { View, Text, StyleSheet, FlatList, Button, Pressable, Alert } from 'react-native';
import { useCart } from '../src/context/CartContext';
import { supabase } from '../src/supabaseClient';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function CartScreen() {
  const { items, total, incrementItem, decrementItem, removeItem, clearCart } = useCart();
  const { session } = useAuth();
  const router = useRouter();

  const placeOrder = async () => {
    if (!session?.user) {
      Alert.alert("Erro", "Você precisa de estar logado para fazer um pedido.");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens ao carrinho antes de finalizar o pedido.");
      return;
    }
    const userId = session.user.id;
    
    // Simplificação: Assume que todos os itens do carrinho pertencem ao mesmo restaurante.
    // Busca o restaurant_id a partir do primeiro item do carrinho.
    const { data: menuItemData, error: menuItemError } = await supabase
      .from('menu_items')
      .select('restaurant_id')
      .eq('id', items[0].id)
      .single();

    if (menuItemError || !menuItemData) {
      Alert.alert("Erro", "Não foi possível identificar o restaurante para este pedido.");
      return;
    }
    const restaurantId = menuItemData.restaurant_id;

    try {
      // 1. Inserir o pedido na tabela 'orders'
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: userId,
          restaurant_id: restaurantId,
          total_price: total,
          status: 'recebido'
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // 2. Preparar e inserir os itens do pedido na tabela 'order_items'
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        menu_item_id: item.id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Limpar o carrinho e notificar o utilizador
      Alert.alert("Sucesso!", "O seu pedido foi realizado.");
      clearCart();
      router.back(); // Volta para a tela anterior

    } catch (error: any) {
      Alert.alert("Erro ao fazer o pedido", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meu Carrinho</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
                <FontAwesome name="trash" size={20} color="#c0392b" />
            </Pressable>

            <Text style={styles.itemName}>{item.name}</Text>
            
            <View style={styles.quantityContainer}>
              <Pressable onPress={() => decrementItem(item.id)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>-</Text>
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable onPress={() => incrementItem(item.id)} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </Pressable>
            </View>

            <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}€</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>O seu carrinho está vazio.</Text>}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: {total.toFixed(2)}€</Text>
        <View style={{marginTop: 10}}>
          <Button title="Finalizar Pedido" onPress={placeOrder} disabled={items.length === 0} />
        </View>
        {items.length > 0 && 
            <View style={{marginTop: 10}}>
                <Button title="Limpar Carrinho" onPress={clearCart} color="#c0392b" />
            </View>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f8f8f8' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    itemContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: 'white', paddingHorizontal: 10, borderRadius: 8, marginBottom: 10 },
    itemName: { flex: 1, fontSize: 16, marginLeft: 10 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', minWidth: 60, textAlign: 'right' },
    totalText: { fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
    emptyText: { textAlign: 'center', color: 'gray', marginTop: 20, fontSize: 16 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
    quantityButton: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
    quantityButtonText: { fontSize: 18, fontWeight: 'bold' },
    quantityText: { fontSize: 16, fontWeight: 'bold', marginHorizontal: 15 },
    removeButton: { padding: 5 },
    footer: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#f8f8f8',
    }
});