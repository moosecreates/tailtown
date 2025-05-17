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
  Card,
  CardContent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { useShoppingCart, CartItem } from '../../contexts/ShoppingCartContext';
import { formatCurrency } from '../../utils/formatters';
import OrderSummary from '../../components/cart/OrderSummary';
import PaymentStep from './steps/PaymentStep';

interface AddOn {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemWithAddOns extends CartItem {
  addOns?: AddOn[];
  serviceName?: string;
  petName?: string;
  startDate?: Date;
  endDate?: Date;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, addToCart } = useShoppingCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to cash instead of creditCard
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [savePaymentInfo, setSavePaymentInfo] = useState(false);
  const [localCartItems, setLocalCartItems] = useState<CartItemWithAddOns[]>([]);
  
  // Convert context cart items to CartItemWithAddOns type
  const extendedCartItems = cartItems as unknown as CartItemWithAddOns[];
  
  // Load and use cart items directly from localStorage
  useEffect(() => {
    console.log('CheckoutPage: Component mounted, loading cart items from localStorage');
    try {
      const savedCart = localStorage.getItem('tailtownCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as CartItemWithAddOns[];
        console.log('CheckoutPage: Found items in localStorage:', parsedCart);
        
        // Directly use the localStorage cart items for rendering
        if (parsedCart.length > 0) {
          console.log('CheckoutPage: Setting local cart items from localStorage');
          setLocalCartItems(parsedCart);
          
          // Also try to update the context (for completeness)
          parsedCart.forEach(item => {
            if (!cartItems.some(cartItem => cartItem.id === item.id)) {
              addToCart(item);
            }
          });
          return;
        }
      }
      
      // If we're here, there are no items in localStorage
      // Check if there are items in the cart context
      if (extendedCartItems.length > 0) {
        console.log('CheckoutPage: No items in localStorage but found in context:', extendedCartItems);
        setLocalCartItems(extendedCartItems);
        return;
      }
      
      // No items in localStorage or context, redirect if not after successful checkout
      if (!success) {
        console.log('CheckoutPage: No cart items found anywhere, redirecting to calendar');
        navigate('/calendar');
      }
    } catch (error) {
      console.error('CheckoutPage: Error loading cart from localStorage:', error);
      
      // Fall back to context cart if localStorage fails
      if (extendedCartItems.length > 0) {
        setLocalCartItems(extendedCartItems);
      } else if (!success) {
        navigate('/calendar');
      }
    }
  }, []);  // Only run once on component mount
  
  // Calculate subtotal using localCartItems instead of context items
  const subtotal = localCartItems.reduce((total: number, item: CartItemWithAddOns) => {
    const itemPrice = item.price || 0;
    const addOnsTotal = item.addOns?.reduce((addOnTotal, addOn) => addOnTotal + (addOn.price * addOn.quantity), 0) || 0;
    return total + itemPrice + addOnsTotal;
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
      
      console.log('CheckoutPage: Payment successful, clearing cart');
      
      // Process successful payment
      setSuccess(true);
      
      // Clear the cart after successful payment - this should also clear localStorage
      clearCart();
      
      // Double-check that localStorage is cleared
      localStorage.removeItem('tailtownCart');
      
      // Force a refresh of localStorage in case of any caching issues
      try {
        localStorage.setItem('tailtownCart', JSON.stringify([]));
        localStorage.removeItem('tailtownCart');
      } catch (error) {
        console.error('CheckoutPage: Error clearing localStorage:', error);
      }
      
      // Set local cart items to empty as well
      setLocalCartItems([]);
      
      console.log('CheckoutPage: Cart cleared after successful payment');
      
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
            Your reservation has been confirmed and your cart has been cleared. Thank you for your business!
          </Alert>
          <Typography variant="body1" paragraph>
            A confirmation email has been sent to your registered email address.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => navigate('/calendar')}
            >
              Create New Reservation
            </Button>
          </Box>
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
            <OrderSummary cartItems={localCartItems} tax={tax} />
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
                onPaymentMethodChange={(method) => {
                  console.log('CheckoutPage: Payment method changed to:', method);
                  setPaymentMethod(method);
                }}
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
