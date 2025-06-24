import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '../src/supabaseClient';
import { useRouter } from 'expo-router'; // Importar o router

export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter(); // Inicializar o router

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro no Login', error.message);
    } else {
      // SUCESSO! Navegamos manualmente para a área principal.
      router.replace('/(tabs)');
    }
    setLoading(false);
  }
  
  // A função de registo permanece igual...
  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: email, password: password });
    if (error) Alert.alert('Erro no Registo', error.message);
    else Alert.alert('Registo completo!', 'Verifique o seu email para confirmar a conta.');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bem-vindo</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Palavra-passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Pressable style={styles.button} onPress={signInWithEmail} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'A entrar...' : 'Entrar'}</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.buttonOutline]} onPress={signUpWithEmail} disabled={loading}>
        <Text style={styles.buttonOutlineText}>{loading ? 'A registar...' : 'Registar'}</Text>
      </Pressable>
    </View>
  );
}

// Os estilos (styles) permanecem inalterados.
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, },
    header: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 24, },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16, },
    button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center', },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16, },
    buttonOutline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#007AFF', marginTop: 10, },
    buttonOutlineText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16, },
});