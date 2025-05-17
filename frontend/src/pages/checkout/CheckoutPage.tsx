import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import { useShoppingCart, CartItem } from '../../contexts/ShoppingCartContext';
import OrderSummary from '../../components/cart/OrderSummary';
import PaymentStep from './steps/PaymentStep';

interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Explicitly include all required properties including those from CartItem
interface CartItemWithAddOns extends CartItem {
  id: string;
  price: number;
  quantity?: number;
  addOns?: AddOn[];
  serviceName?: string;
  petName?: string;
  startDate?: Date;
  endDate?: Date;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, clearCart } = useShoppingCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  
  // Use items from the shopping cart state
  const cartItems = state.items as CartItemWithAddOns[];
  
  useEffect(() => {
    // If cart is empty and not after a successful checkout, redirect to calendar
    if (cartItems.length === 0 && !success) {
      navigate('/calendar');
    }
  }, [cartItems, navigate, success]);
  
  // Calculate subtotal
  const subtotal = cartItems.reduce((total: number, item: CartItemWithAddOns) => {
    // Calculate reservation price
    let itemTotal = item.price || 0;
    
    // Add add-ons if any
    if (item.addOns && item.addOns.length > 0) {
      itemTotal += item.addOns.reduce((addOnTotal: number, addOn: AddOn) => 
        addOnTotal + (addOn.price * (addOn.quantity || 1)), 0);
    }
    
    return total + itemTotal;
  }, 0);
  
  // Calculate tax (using 7.44% tax rate as per standard)
  const taxRate = 0.0744;
  const tax = subtotal * taxRate;
  
  // Calculate total
  const total = subtotal + tax;
  
  // Set initial payment amount when total changes
  useEffect(() => {
    // Round to 2 decimal places to ensure consistent cents display
    setPaymentAmount(parseFloat(total.toFixed(2)));
  }, [total]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on selected payment method
    if (paymentMethod === 'credit_card') {
      const form = e.target as HTMLFormElement;
      const cardNameInput = form.querySelector('[name="cardName"]') as HTMLInputElement;
      const cardNumberInput = form.querySelector('[name="cardNumber"]') as HTMLInputElement;
      const expiryInput = form.querySelector('[name="expiry"]') as HTMLInputElement;
      const cvvInput = form.querySelector('[name="cvv"]') as HTMLInputElement;
      
      if (!cardNameInput?.value || !cardNumberInput?.value || !expiryInput?.value || !cvvInput?.value) {
        setError('Please fill in all credit card details');
        return;
      }
    }
    
    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would call a payment processing API
      // For demo purposes, we'll simulate a successful payment after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Process successful payment
      setSuccess(true);
      
      // Clear the cart after successful payment
      clearCart();
      
      // In a real app, you would also create reservations in the database here
      
    } catch (err: any) {
      setError('Payment processing failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleContinueShopping = () => {
    navigate('/calendar');
  };
  
  // If payment was successful, show success message
  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Payment Successful!
          </Typography>
          <Alert severity="success" sx={{ my: 3 }}>
            Your reservation has been confirmed. Thank you for your business!
          </Alert>
          <Typography variant="body1" paragraph>
            A confirmation email has been sent to your registered email address.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleContinueShopping}
          sx={{ mr: 2 }}
        >
          Continue Shopping
        </Button>
        <Typography variant="h4" component="h1">
          Checkout
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Order Summary */}
        <Grid item xs={12} md={5}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Use the new OrderSummary component */}
            <OrderSummary taxRate={taxRate} />
          </Paper>
        </Grid>
        
        {/* Payment Information */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Information
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit}>
              {/* Use the PaymentStep component */}
              <PaymentStep
                paymentMethod={paymentMethod}
                onPaymentMethodChange={(method) => setPaymentMethod(method)}
                paymentAmount={paymentAmount}
                onPaymentAmountChange={(amount) => setPaymentAmount(amount)}
                totalAmount={total}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={savePaymentInfo}
                        onChange={(e) => setSavePaymentInfo(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Save payment information for future bookings"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled={loading}
                    startIcon={<PaymentIcon />}
                    sx={{ mt: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : `Complete Payment`}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
