import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { supabase } from '../../src/supabaseClient';
import { useRouter } from 'expo-router';

// Definir o "formato" de um objeto Restaurante para o TypeScript
type Restaurant = {
  id: number;
  name: string;
  address: string;
};

export default function HomeScreen(): React.JSX.Element {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Inicializar o router

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase.from('restaurants').select('*');
      if (error) throw error;
      if (data) {
        setRestaurants(data);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Função que navega para o menu do restaurante selecionado
  const handleRestaurantPress = (item: Restaurant) => {
    router.push({
      pathname: "/menu/[id]",
      params: { id: item.id.toString() }
    });
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          // Usamos o onPress do Pressable para chamar a nossa função de navegação
          <Pressable 
            style={styles.card}
            onPress={() => handleRestaurantPress(item)}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardAddress}>{item.address}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>Nenhum restaurante encontrado.</Text>}
        contentContainerStyle={{ padding: 10 }}
      />
    </View>
  );
}

// Os estilos permanecem os mesmos
const styles = StyleSheet.create({
  container: { flex: 1, },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', },
  card: { backgroundColor: 'white', padding: 20, marginVertical: 8, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4, },
  cardTitle: { fontSize: 18, fontWeight: 'bold', },
  cardAddress: { fontSize: 14, color: 'gray', marginTop: 5, },
});