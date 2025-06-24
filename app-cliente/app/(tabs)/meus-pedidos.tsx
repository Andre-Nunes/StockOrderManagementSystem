// Ficheiro: app/(tabs)/meus-pedidos.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/supabaseClient';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router'; // Importar o router
import { Button } from 'react-native'; // Importar o Button

// Usaremos um tipo parcial porque não precisamos de todos os dados do pedido aqui
type Order = {
  id: number;
  created_at: string;
  status: string;
  total_price: number;
};

// GARANTA QUE ESTA LINHA ESTÁ EXATAMENTE ASSIM
export default function MyOrdersScreen() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Inicializar o router

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  // Efeito para ouvir por atualizações em tempo real
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel(`my-orders-${session.user.id}`) // Nome de canal único e simples
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${session.user.id}`,
        },
        (payload) => {
          console.log('Estado do pedido atualizado!', payload.new);
          setOrders((currentOrders) =>
            currentOrders.map((order) =>
              order.id === payload.new.id ? { ...order, status: payload.new.status } : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);


  const fetchOrders = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total_price')
        .eq('customer_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setOrders(data);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pedido #{item.id}</Text>
            <Text style={styles.cardDate}>
              {new Date(item.created_at).toLocaleDateString()} - {new Date(item.created_at).toLocaleTimeString()}
            </Text>
            <Text style={styles.cardTotal}>{item.total_price.toFixed(2)} €</Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            {/* Botão de avaliação condicional */}
            {item.status === 'entregue' && (
              <View style={{marginTop: 10}}>
                <Button 
                  title="Avaliar Pedido" 
                  onPress={() => router.push(`/order/${item.id}`)}
                />
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Você ainda não fez nenhum pedido.</Text>}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8' },
    card: { backgroundColor: 'white', padding: 15, marginVertical: 8, borderRadius: 10, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardDate: { color: 'gray', marginVertical: 4 },
    cardTotal: { fontSize: 16, fontWeight: 'bold' },
    statusContainer: {
        marginTop: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    statusText: { fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});