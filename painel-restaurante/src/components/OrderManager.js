import React, { useState, useEffect, useRef } from 'react'; // 1. Importar useRef
import { supabase } from '../supabaseClient';
import { useReactToPrint } from 'react-to-print'; // 2. Importar o hook da biblioteca
import { Receipt } from './Receipt'; // 3. Importar o nosso componente de recibo

import { 
  Typography, Paper, Grid, Card, CardContent, CardActions, 
  FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Divider, CircularProgress, Box, IconButton 
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print'; // 4. Importar o ícone de impressora

const pastStatus = ['entregue', 'cancelado'];
const possibleStatus = ['recebido', 'em preparação', 'pronto', 'entregue', 'cancelado'];

function OrderManager() {
  const [activeOrders, setActiveOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderToPrint, setOrderToPrint] = useState(null); // 5. Estado para saber qual pedido imprimir
  const receiptRef = useRef(); // 6. Referência para o nosso componente de recibo

  useEffect(() => {
    fetchOrders();
    const channel = supabase.channel('public:orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => { fetchSingleOrder(payload.new.id); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);
  
  // 7. Configurar o hook de impressão
  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    onAfterPrint: () => setOrderToPrint(null), // Limpa o estado depois de imprimir
  });

  // 8. Efeito que chama a impressão DEPOIS do estado ser atualizado
  useEffect(() => {
    if (orderToPrint) {
      handlePrint();
    }
  }, [orderToPrint, handlePrint]);

  const sortOrders = (allOrders) => {
    const active = allOrders.filter(order => !pastStatus.includes(order.status));
    const past = allOrders.filter(order => pastStatus.includes(order.status));
    setActiveOrders(active);
    setPastOrders(past);
  };

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, status, total_price, profiles ( email ), order_items ( id, quantity, menu_items ( name, price ) )')
      .eq('restaurant_id', 1)
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Erro ao buscar pedidos:", error);
    } else if (data) {
        sortOrders(data);
    }
    setLoading(false);
  };

  const fetchSingleOrder = async (orderId) => {
    const { data } = await supabase
      .from('orders')
      .select('id, created_at, status, total_price, profiles ( email ), order_items ( id, quantity, menu_items ( name, price ) )')
      .eq('id', orderId)
      .single();

    if (data) {
      setActiveOrders(currentOrders => [data, ...currentOrders]);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { data: updatedOrderFromDB, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('*, profiles ( email ), order_items ( id, quantity, menu_items ( name, price ) )')
      .single();

    if (error) {
      alert(error.message);
      return;
    }
    
    if (updatedOrderFromDB) {
      if (pastStatus.includes(newStatus)) {
        setActiveOrders(prev => prev.filter(o => o.id !== orderId));
        setPastOrders(prev => [updatedOrderFromDB, ...prev].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      } else {
        setPastOrders(prev => prev.filter(o => o.id !== orderId));
        setActiveOrders(prev => [updatedOrderFromDB, ...prev].sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    }
  };

  const renderOrderList = (orders, title) => (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>{title}</Typography>
      <Grid container spacing={3}>
        {orders.length === 0 ? (
          <Grid item xs={12}>
             <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>Nenhum pedido nesta secção.</Typography>
         </Grid>
       ) : (
         orders.map(order => (
           <Grid item xs={12} sm={6} md={4} key={order.id}>
             <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2">Pedido #{order.id}</Typography>
                  <Typography color="text.secondary" gutterBottom>Cliente: {order.profiles ? order.profiles.email : 'N/A'}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>Recebido em: {new Date(order.created_at).toLocaleString()}</Typography>
                  <Divider sx={{ my: 1 }} />
                  <List dense>
                    {order.order_items.map((item) => (
                      <ListItem key={item.id} disableGutters>
                        <ListItemText primary={`${item.quantity}x ${item.menu_items ? item.menu_items.name : 'Item não encontrado'}`} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" align="right">Total: {parseFloat(order.total_price).toFixed(2)}€</Typography>
                </CardContent>
                {/* 9. CardActions agora com o botão de imprimir */}
                <CardActions sx={{ justifyContent: 'space-between', backgroundColor: '#f5f5f5', alignItems: 'center' }}>
                  <FormControl sx={{ flex: 1 }} size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select value={order.status} label="Estado" onChange={(e) => handleUpdateStatus(order.id, e.target.value)}>
                      {possibleStatus.map(status => (<MenuItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <IconButton onClick={() => setOrderToPrint(order)}>
                    <PrintIcon />
                  </IconButton>
                </CardActions>
             </Card>
           </Grid>
         ))
       )}
      </Grid>
    </Box>
  );

  return (
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>Gestão de Pedidos</Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
      ) : (
        <>
          {renderOrderList(activeOrders, 'Pedidos Atuais')}
          {renderOrderList(pastOrders, 'Pedidos Passados')}
        </>
      )}
      {/* 10. Componente de recibo escondido, pronto para ser usado */}
      <div style={{ display: 'none' }}>
        <Receipt ref={receiptRef} order={orderToPrint} />
      </div>
    </Paper>
  );
}

export default OrderManager;