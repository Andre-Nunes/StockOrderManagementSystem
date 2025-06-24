// Ficheiro: src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Importar os componentes necessários da MUI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 2. Criar um tema básico (podemos personalizá-lo mais tarde)
const theme = createTheme({
  palette: {
    mode: 'light', // Pode ser 'light' ou 'dark'
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. Envolver a nossa App com o ThemeProvider */}
    <ThemeProvider theme={theme}>
      {/* O CssBaseline normaliza os estilos em diferentes navegadores */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);