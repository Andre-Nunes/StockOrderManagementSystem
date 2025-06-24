// Ficheiro: src/components/MenuManager.js (com sanitização de nome de ficheiro)

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import { 
  Box, Button, TextField, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Avatar 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [editingItem, setEditingItem] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('menu_items').select('*').eq('restaurant_id', 1).order('created_at');
    if (data) setMenuItems(data);
    setLoading(false);
  };

  const handleFileSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    let imageUrl = editingItem ? editingItem.image_url : '';

    if (selectedFile) {
      // --- CORREÇÃO APLICADA AQUI ---
      // 1. Limpa o nome do ficheiro para garantir que é seguro para o URL
      const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9-._]/g, '_');
      const filePath = `public/${Date.now()}_${cleanFileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('menu-images')
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        alert("Erro no upload da imagem: " + uploadError.message);
        setLoading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase
        .storage
        .from('menu-images')
        .getPublicUrl(uploadData.path);
        
      imageUrl = publicUrlData.publicUrl;
    }
    
    const itemData = { 
      ...formData, 
      price: parseFloat(formData.price),
      image_url: imageUrl,
    };

    if (editingItem) {
      await supabase.from('menu_items').update(itemData).eq('id', editingItem.id);
    } else {
      await supabase.from('menu_items').insert([{ ...itemData, restaurant_id: 1 }]);
    }
    
    cancelEdit();
    await fetchMenuItems();
  };
  
  const handleDeleteItem = async (id) => {
    if (window.confirm('Tem a certeza que quer apagar este item?')) {
      setLoading(true);
      await supabase.from('menu_items').delete().eq('id', id);
      await fetchMenuItems();
    }
  };
  
  const startEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description, price: item.price });
    setSelectedFile(null);
  };
  
  const cancelEdit = () => {
    setEditingItem(null);
    setFormData({ name: '', description: '', price: '' });
    setSelectedFile(null);
    setLoading(false);
  };

  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>Gerir Menu</Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, marginBottom: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Nome do produto" variant="outlined" size="small" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <TextField label="Descrição" variant="outlined" size="small" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
        <TextField label="Preço (€)" type="number" variant="outlined" size="small" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required inputProps={{ step: "0.01" }}/>
        
        <Button variant="outlined" component="label" startIcon={<AddPhotoAlternateIcon />}>
          {selectedFile ? selectedFile.name.substring(0, 15) + '...' : "Carregar Imagem"}
          <input type="file" hidden onChange={handleFileSelected} accept="image/*" />
        </Button>
        
        <Button type="submit" variant="contained" disabled={loading}>
          {editingItem ? 'Guardar Alterações' : 'Adicionar Item'}
        </Button>
        {editingItem && ( <Button variant="outlined" onClick={cancelEdit} disabled={loading}>Cancelar</Button> )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Imagem</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {menuItems.map((item) => (
              <TableRow key={item.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Avatar src={item.image_url} variant="rounded" sx={{ width: 56, height: 56 }}>
                    {item.name ? item.name.charAt(0) : '?'}
                  </Avatar>
                </TableCell>
                <TableCell component="th" scope="row">{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell align="right">{parseFloat(item.price).toFixed(2)} €</TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => startEdit(item)} color="primary" disabled={loading}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDeleteItem(item.id)} color="error" disabled={loading}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default MenuManager;