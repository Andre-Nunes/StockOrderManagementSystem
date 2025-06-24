// Ficheiro: src/components/StockManager.js (versão MUI)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// Importar os componentes da MUI
import {
  Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Button, Box, CircularProgress
} from '@mui/material';

function StockManager() {
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);
  const [editingValues, setEditingValues] = useState({});

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    setLoading(true);
    try {
      const { data: menuItems, error: menuError } = await supabase.from('menu_items').select('id, name').eq('restaurant_id', 1);
      if (menuError) throw menuError;

      const { data: stockEntries, error: stockError } = await supabase.from('stock').select('*');
      if (stockError) throw stockError;

      const combinedData = menuItems.map(menuItem => {
        const stockInfo = stockEntries.find(entry => entry.menu_item_id === menuItem.id);
        return {
          ...menuItem,
          stock_id: stockInfo?.id,
          quantity: stockInfo?.quantity ?? 'N/A',
          low_stock_threshold: stockInfo?.low_stock_threshold ?? 'N/A',
        };
      });
      
      setStockItems(combinedData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (itemId, field, value) => {
    setEditingValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSaveChanges = async (item) => {
    const newValues = editingValues[item.id];
    if (!newValues) return;

    const quantity = parseInt(newValues.quantity, 10);
    const threshold = parseInt(newValues.low_stock_threshold, 10);

    try {
      if (item.stock_id) {
        await supabase.from('stock').update({ 
            quantity: isNaN(quantity) ? item.quantity : quantity, 
            low_stock_threshold: isNaN(threshold) ? item.low_stock_threshold : threshold,
          }).eq('id', item.stock_id);
      } else {
        await supabase.from('stock').insert([{ 
            menu_item_id: item.id,
            quantity: isNaN(quantity) ? 0 : quantity,
            low_stock_threshold: isNaN(threshold) ? 0 : threshold,
          }]);
      }
      
      alert('Stock atualizado com sucesso!');
      fetchStockData();
      setEditingValues({});
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gerir Stock
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="stock management table">
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell align="center">Quantidade Atual</TableCell>
                <TableCell align="center">Limite Stock Baixo</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stockItems.map(item => {
                const isLowStock = item.quantity !== 'N/A' && item.low_stock_threshold !== 'N/A' && item.quantity <= item.low_stock_threshold;
                return (
                  // O estilo do alerta de stock baixo é agora aplicado com a prop 'sx'
                  <TableRow key={item.id} sx={{ backgroundColor: isLowStock ? 'rgba(255, 0, 0, 0.1)' : 'inherit' }}>
                    <TableCell component="th" scope="row">
                      <Typography variant="body1" sx={{ fontWeight: isLowStock ? 'bold' : 'normal' }}>
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <TextField 
                        type="number"
                        size="small"
                        variant="outlined"
                        placeholder={String(item.quantity)}
                        onChange={(e) => handleValueChange(item.id, 'quantity', e.target.value)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField 
                        type="number"
                        size="small"
                        variant="outlined"
                        placeholder={String(item.low_stock_threshold)}
                        onChange={(e) => handleValueChange(item.id, 'low_stock_threshold', e.target.value)}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => handleSaveChanges(item)}
                      >
                        Guardar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}

export default StockManager;