import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useShoppingCart, CartItem } from '../../contexts/ShoppingCartContext';

// Define the props interface
interface OrderSummaryProps {
  taxRate: number;
}

// Define a minimal implementation of OrderSummary that doesn't change functionality
const OrderSummary: React.FC<OrderSummaryProps> = ({ taxRate }) => {
  // Access the cart state
  const { state } = useShoppingCart();
  
  // Calculate subtotal (simplified implementation)
  const subtotal = state.items.reduce((total, item) => total + (item.price || 0), 0);
  
  // Calculate tax
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Details</TableCell>
            <TableCell align="right">Price</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>Service</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>-</TableCell>
              <TableCell align="right">${item.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          
          {/* Summary rows */}
          <TableRow>
            <TableCell colSpan={3}>Subtotal</TableCell>
            <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>Tax ({(taxRate * 100).toFixed(2)}%)</TableCell>
            <TableCell align="right">${tax.toFixed(2)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>
              <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle1" fontWeight="bold">${total.toFixed(2)}</Typography>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OrderSummary;
