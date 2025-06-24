// Ficheiro: src/pages/DashboardPage.js (Layout com Navegação)

import React from 'react';
import { supabase } from '../supabaseClient';
import { Routes, Route, Link } from 'react-router-dom';

// Importar os componentes de gestão
import AnalyticsManager from '../components/AnalyticsManager';
import MenuManager from '../components/MenuManager';
import OrderManager from '../components/OrderManager';
import StockManager from '../components/StockManager';

// Importar componentes e ícones da MUI
import { 
  AppBar, Toolbar, Typography, Button, Container, Box, Drawer, List,
  ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline 
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';

const drawerWidth = 240; // Largura do nosso menu lateral

function DashboardPage({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { text: 'Análises', path: '/', icon: <DashboardIcon /> },
    { text: 'Pedidos', path: '/pedidos', icon: <ShoppingCartIcon /> },
    { text: 'Menu', path: '/menu', icon: <MenuBookIcon /> },
    { text: 'Stock', path: '/stock', icon: <InventoryIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      {/* Barra de Topo */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Painel de Gestão
          </Typography>
          <Button color="inherit" onClick={handleLogout}>Sair</Button>
        </Toolbar>
      </AppBar>

      {/* Menu Lateral (Drawer) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar /> {/* Espaçador para alinhar com o conteúdo abaixo da AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              // Usamos o componente Link do React Router para a navegação
              <ListItem key={item.text} disablePadding component={Link} to={item.path}>
                <ListItemButton>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Área de Conteúdo Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* Outro espaçador para o conteúdo da página */}
        
        {/* O <Routes> define qual componente renderizar com base no URL */}
        <Routes>
          <Route path="/" element={<AnalyticsManager />} />
          <Route path="/pedidos" element={<OrderManager />} />
          <Route path="/menu" element={<MenuManager />} />
          <Route path="/stock" element={<StockManager />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default DashboardPage;