// Ficheiro: src/components/AnalyticsManager.js (versão final)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Paper, Typography, Grid, Box, CircularProgress } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ReceiptIcon from '@mui/icons-material/Receipt';

// Importar os componentes do Chart.js
import { Line, Bar } from 'react-chartjs-2'; // Adicionar 'Bar'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Adicionar o elemento de Barra
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registar os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement, // Registar o elemento de Barra
  Title,
  Tooltip,
  Legend
);


function AnalyticsManager() {
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0 });
  const [salesData, setSalesData] = useState(null);
  const [bestSellersData, setBestSellersData] = useState(null); // Estado para o novo gráfico
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsPromise, salesPromise, bestSellersPromise] = await Promise.all([
        supabase.from('orders').select('total_price', { count: 'exact' }),
        supabase.rpc('get_daily_sales', { days_to_track: 30 }),
        // NOVA CHAMADA: Chamar a nossa nova função 'get_best_sellers'
        supabase.rpc('get_best_sellers')
      ]);

      // Processar totais
      const { data: statsData, error: statsError, count } = statsPromise;
      if (statsError) throw statsError;
      const totalSales = statsData.reduce((sum, order) => sum + order.total_price, 0);
      setStats({ totalSales: totalSales, totalOrders: count });

      // Processar vendas diárias para o gráfico de linhas
      const { data: rpcData, error: rpcError } = salesPromise;
      if (rpcError) throw rpcError;
      setSalesData({
        labels: rpcData.map(d => d.day),
        datasets: [{
          label: 'Vendas Diárias (€)',
          data: rpcData.map(d => d.total_sales),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        }],
      });

      // Processar os mais vendidos para o gráfico de barras
      const { data: bestSellersRpcData, error: bestSellersError } = bestSellersPromise;
      if (bestSellersError) throw bestSellersError;
      setBestSellersData({
        labels: bestSellersRpcData.map(d => d.product_name),
        datasets: [{
          label: 'Quantidade Vendida',
          data: bestSellersRpcData.map(d => d.total_quantity_sold),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }],
      });

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
      <Typography variant="h4" gutterBottom>Análise de Vendas</Typography>
      <Grid container spacing={3}>
        {/* ... (Cartões de Vendas Totais e Pedidos Totais inalterados) ... */}
        <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center' }}><PointOfSaleIcon color="primary" sx={{ fontSize: 40, mr: 2 }} /><Box><Typography color="text.secondary">Vendas Totais</Typography><Typography variant="h5" component="p">{stats.totalSales.toFixed(2)}€</Typography></Box></Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
            <Paper elevation={2} sx={{ p: 2, display: 'flex', alignItems: 'center' }}><ReceiptIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} /><Box><Typography color="text.secondary">Pedidos Totais</Typography><Typography variant="h5" component="p">{stats.totalOrders}</Typography></Box></Paper>
        </Grid>

        {/* Gráfico de Linhas: Vendas nos Últimos 30 Dias */}
        <Grid item xs={12} lg={7}>
            <Typography variant="h5" gutterBottom>Vendas nos Últimos 30 Dias</Typography>
            {salesData ? <Line data={salesData} /> : <Typography>Sem dados para exibir.</Typography>}
        </Grid>
        
        {/* NOVO GRÁFICO: Gráfico de Barras dos Mais Vendidos */}
        <Grid item xs={12} lg={5}>
            <Typography variant="h5" gutterBottom>Top 5 Produtos Mais Vendidos</Typography>
            {bestSellersData ? <Bar data={bestSellersData} /> : <Typography>Sem dados para exibir.</Typography>}
        </Grid>
      </Grid>
    </Paper>
  );
}

export default AnalyticsManager;