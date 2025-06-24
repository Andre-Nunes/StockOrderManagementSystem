// Ficheiro: src/pages/LoginPage.js (versão MUI)

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// Importar componentes da MUI
import { Button, TextField, Container, Paper, Typography, Box, Alert } from '@mui/material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para guardar mensagens de erro

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(''); // Limpa erros antigos

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message); // Guarda a mensagem de erro para ser exibida
    }
    // Não há 'else' aqui, pois o App.js trata do redirecionamento
    setLoading(false);
  };

  return (
    // O Container da MUI centra o conteúdo e define uma largura máxima.
    <Container component="main" maxWidth="xs">
      {/* O Paper cria o efeito de "cartão elevado". sx é para estilos rápidos. */}
      <Paper elevation={6} sx={{ marginTop: 8, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login do Painel
        </Typography>
        
        {/* Usamos o Box como o nosso formulário */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          {/* Mostra um Alerta da MUI se houver um erro */}
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Palavra-passe"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default LoginPage;