import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import { financialService, FinancialCartItem, FinancialCalculation } from '../../services';
import { CartItem } from '../../contexts/ShoppingCartContext';

// Use the standardized FinancialCartItem interface from our Financial Service
interface OrderSummaryProps {
  cartItems: FinancialCartItem[];
  tax?: number;
  calculation?: FinancialCalculation; // Optional pre-calculated values
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cartItems, tax, calculation }) => {
  // Use the financial service to calculate totals if not provided
  const financialData = calculation || financialService.calculateTotals(cartItems);
  
  // Extract values from calculation
  const { subtotal, tax: calculatedTax, total: totalAmount } = financialData;
  
  // Use provided tax if available, otherwise use calculated tax
  const displayTax = tax !== undefined ? tax : calculatedTax;
  const displayTotal = tax !== undefined ? subtotal + tax : totalAmount;
  
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>
      <Box sx={{ mb: 2 }}>
        {cartItems.map((item, index) => (
          <Box key={index} sx={{ mb: 1 }}>
            <Typography variant="body2">
              {item.name || `Item #${index + 1}`}: {financialService.formatCurrency(item.price || 0)}
            </Typography>
            
            {/* Display add-ons if any */}
            {item.addOns && item.addOns.length > 0 && (
              <Box sx={{ pl: 2 }}>
                {item.addOns.map((addOn, addOnIndex) => (
                  <Typography key={addOnIndex} variant="body2" color="text.secondary">
                    {addOn.name} ({addOn.quantity}): {financialService.formatCurrency(addOn.price * addOn.quantity)}
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
        <Typography variant="body1">{financialService.formatCurrency(subtotal)}</Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body1">Tax:</Typography>
        <Typography variant="body1">{financialService.formatCurrency(displayTax)}</Typography>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6">{financialService.formatCurrency(displayTotal)}</Typography>
      </Box>
    </Paper>
  );
};

export default OrderSummary;
