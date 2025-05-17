import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';
import { CartItem } from '../../contexts/ShoppingCartContext';

interface ExtendedCartItem extends CartItem {
  price?: number;
  quantity?: number;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface OrderSummaryProps {
  cartItems: ExtendedCartItem[];
  tax?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, tax = 0 }) => {
  // Calculate subtotal from all cart items and their add-ons
  const subtotal = cartItems.reduce((total: number, item: ExtendedCartItem) => {
    return total + (item.price || 0) + 
      ((item.addOns?.reduce((addOnTotal, addOn) => addOnTotal + (addOn.price * addOn.quantity), 0)) || 0);
  }, 0);
  
  // Calculate final total
  const totalAmount = subtotal + tax;
  
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Box sx={{ mb: 2 }}>
        {cartItems.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {item.name || `Item #${index + 1}`}: {formatCurrency(item.price || 0)}
            </Typography>
            
            {/* Display add-ons if any */}
            {item.addOns && item.addOns.length > 0 && (
              <Box sx={{ pl: 2 }}>
                {item.addOns.map((addOn, addOnIndex) => (
                  <Typography key={addOnIndex} variant="body2" color="text.secondary">
                    {addOn.name} ({addOn.quantity}): {formatCurrency(addOn.price * addOn.quantity)}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body1">Subtotal:</Typography>
        <Typography variant="body1">{formatCurrency(subtotal)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body1">Tax:</Typography>
        <Typography variant="body1">{formatCurrency(tax)}</Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6">{formatCurrency(totalAmount)}</Typography>
      </Box>
    </Paper>
  );
};

export default OrderSummary;
