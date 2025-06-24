// Ficheiro: app/(tabs)/profile.tsx

import { supabase } from '../../src/supabaseClient';
import { useAuth } from '../../src/context/AuthContext';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';

export default function ProfileScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  
  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  // Função para ir buscar os dados atuais do perfil
  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`full_name`)
        .eq('id', session.user.id)
        .single();
        
      if (error && status !== 406) throw error;

      if (data) {
        setFullName(data.full_name || '');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  // Função para atualizar os dados do perfil
  async function updateProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error('No user on the session!');

      const updates = {
        id: session.user.id,
        full_name: fullName,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>O Meu Perfil</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={session?.user?.email}
          editable={false} // O email não pode ser editado
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? "A guardar..." : "Guardar Alterações"} 
          onPress={updateProfile}
          disabled={loading} 
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          title="Sair (Logout)"
          onPress={() => supabase.auth.signOut()}
          color="red"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: 'gray',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f8f8f8'
  },
  buttonContainer: {
      marginTop: 20,
  }
});