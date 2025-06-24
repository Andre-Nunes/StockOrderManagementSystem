// Ficheiro: src/components/Receipt.js

import React from 'react';

// Usamos React.forwardRef para que o hook de impressão possa ter uma referência a este componente
export const Receipt = React.forwardRef((props, ref) => {
  const { order } = props;

  // Estilos inline para simplicidade e compatibilidade com impressão
  const styles = {
    receipt: { fontFamily: '"Courier New", Courier, monospace', width: '280px', padding: '10px' },
    header: { textAlign: 'center', marginBottom: '10px' },
    title: { fontSize: '18px', fontWeight: 'bold' },
    section: { marginBottom: '10px' },
    item: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    total: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '10px', borderTop: '1px dashed black', paddingTop: '5px' },
    footer: { textAlign: 'center', marginTop: '20px', fontSize: '12px' },
  };

  if (!order) {
    return null; // Não renderiza nada se não houver pedido para imprimir
  }

  return (
    <div ref={ref} style={styles.receipt}>
      <div style={styles.header}>
        <div style={styles.title}>Recibo do Pedido #{order.id}</div>
        <div>{new Date(order.created_at).toLocaleString()}</div>
      </div>

      <div style={styles.section}>
        <div>Cliente: {order.profiles ? order.profiles.email : 'N/A'}</div>
      </div>
      
      <hr style={{ border: '1px dashed black' }} />

      <div style={styles.section}>
        {order.order_items.map((item) => (
          <div key={item.id} style={styles.item}>
            <span>{item.quantity}x {item.menu_items ? item.menu_items.name : 'Item'}</span>
            <span>{(item.menu_items.price * item.quantity).toFixed(2)}€</span>
          </div>
        ))}
      </div>

      <div style={styles.total}>
        <span>TOTAL</span>
        <span>{parseFloat(order.total_price).toFixed(2)}€</span>
      </div>

      <div style={styles.footer}>
        Obrigado e volte sempre!
      </div>
    </div>
  );
});