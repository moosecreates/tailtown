import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useShoppingCart, CartItem } from '../../contexts/ShoppingCartContext';

interface OrderSummaryProps {
  taxRate: number;
}

interface ExtendedCartItem extends CartItem {
  serviceName?: string;
  petName?: string;
  startDate?: Date;
  endDate?: Date;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ taxRate }) => {
  const { state } = useShoppingCart();
  const cartItems = state.items as ExtendedCartItem[];
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total: number, item: ExtendedCartItem) => {
    // Calculate reservation price
    let itemTotal = item.price || 0;
    
    // Add add-ons if any
    if (item.addOns && item.addOns.length > 0) {
      itemTotal += item.addOns.reduce((addOnTotal: number, addOn) => 
        addOnTotal + (addOn.price * (addOn.quantity || 1)), 0);
    }
    
    return total + itemTotal;
  }, 0);
  
  // Calculate tax
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Format dates
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date instanceof Date 
      ? date.toLocaleDateString() 
      : new Date(date).toLocaleDateString();
  };
  
  return (
    <>
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
            {cartItems.map((item) => (
              <React.Fragment key={item.id}>
                {/* Main service item */}
                <TableRow>
                  <TableCell>{item.serviceName || 'Service'}</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>
                    {item.startDate && item.endDate && (
                      <>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        <br />
                      </>
                    )}
                    {item.petName && <>Pet ID: {item.petName}</>}
                  </TableCell>
                  <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                </TableRow>
                
                {/* Add-ons */}
                {item.addOns?.map((addOn) => (
                  <TableRow key={`${item.id}-${addOn.id}`}>
                    <TableCell sx={{ pl: 4 }}>{addOn.name}</TableCell>
                    <TableCell>Add-on</TableCell>
                    <TableCell>{addOn.quantity > 1 ? `Qty: ${addOn.quantity}` : ''}</TableCell>
                    <TableCell align="right">
                      ${(addOn.price * (addOn.quantity || 1)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
            
            {/* Subtotal row */}
            <TableRow>
              <TableCell colSpan={3}>Subtotal</TableCell>
              <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
            </TableRow>
            
            {/* Tax row */}
            <TableRow>
              <TableCell colSpan={3}>Tax ({(taxRate * 100).toFixed(2)}%)</TableCell>
              <TableCell align="right">${tax.toFixed(2)}</TableCell>
            </TableRow>
            
            {/* Total row */}
            <TableRow>
              <TableCell colSpan={3} sx={{ fontWeight: 'bold' }}>
                <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                <Typography variant="subtitle1" fontWeight="bold">${total.toFixed(2)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default OrderSummary;
