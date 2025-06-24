// Ficheiro: app/order/[id].tsx (Versão Final e Funcional)

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/supabaseClient';
import { useAuth } from '../../src/context/AuthContext';
import { Rating } from 'react-native-ratings';
import { OrderItem as OrderItemType } from '../../src/types'; // Importar o tipo do nosso ficheiro de tipos

export default function OrderDetailsScreen() {
  const { id: orderId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderItems();
    }
  }, [orderId]);

  const fetchOrderItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, menu_items!inner(id, name)') // Usar !inner para garantir que menu_items não é nulo
        .eq('order_id', orderId);
        
      if (error) throw error;
      
      if (data) {
        // Usamos 'as' para dizer ao TypeScript para confiar na nossa estrutura de tipos
        setOrderItems(data as any[]); 
      }

    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível carregar os itens do pedido.");
    } finally {
      setLoading(false);
    }
  };

  const handleRating = (menuItemId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [menuItemId]: rating }));
  };

  const handleSubmitReviews = async () => {
    if (Object.keys(ratings).length === 0) {
      Alert.alert("Nenhuma avaliação", "Por favor, avalie pelo menos um item.");
      return;
    }
    setLoading(true);
    try {
      if (!session?.user) throw new Error("Sessão não encontrada.");

      const reviewsToInsert = Object.entries(ratings).map(([menu_item_id, rating]) => ({
        user_id: session.user.id,
        menu_item_id: parseInt(menu_item_id, 10),
        rating: rating,
      }));

      const { error } = await supabase.from('reviews').upsert(reviewsToInsert);
      if (error) throw error;

      Alert.alert("Obrigado!", "As suas avaliações foram submetidas com sucesso.");
      router.back();
    } catch (error: any) {
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orderItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>{item.menu_items.name}</Text>
            <Rating
              showRating
              startingValue={0}
              imageSize={30}
              onFinishRating={(rating: number) => handleRating(item.menu_items.id, rating)}
              style={{ paddingVertical: 10 }}
            />
          </View>
        )}
        ListHeaderComponent={<Text style={styles.header}>Avalie os Produtos</Text>}
        ListFooterComponent={
            <View style={{ marginTop: 20 }}>
                <Button title={loading ? "A enviar..." : "Enviar Avaliações"} onPress={handleSubmitReviews} disabled={loading || orderItems.length === 0} />
            </View>
        }
        contentContainerStyle={{paddingBottom: 40}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f8f8f8' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    card: { backgroundColor: 'white', padding: 15, marginVertical: 8, borderRadius: 10, elevation: 3 },
    itemName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});