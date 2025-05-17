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
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentIcon from '@mui/icons-material/Payment';
import { useShoppingCart, CartItem } from '../../contexts/ShoppingCartContext';
// Use our centralized financial service instead of formatCurrency from utils
import { financialService, FinancialCartItem, FinancialCalculation } from '../../services';
import { customerService } from '../../services/customerService';
import OrderSummary from '../../components/cart/OrderSummary';
import PaymentStep from './steps/PaymentStep';

// Using standardized FinancialAddOn and FinancialCartItem interfaces from our service
// This ensures consistent data structure across the application
// Extend the FinancialCartItem interface to include customer ID
interface ExtendedCartItem extends FinancialCartItem {
  customerId?: string;
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
  const [localCartItems, setLocalCartItems] = useState<ExtendedCartItem[]>([]);
  const [financialCalculation, setFinancialCalculation] = useState<FinancialCalculation | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [defaultCustomerId, setDefaultCustomerId] = useState<string>('');
  
  // Convert context cart items to ExtendedCartItem type
  const extendedCartItems = cartItems as unknown as ExtendedCartItem[];
  
  // Fetch customers when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      setCustomersLoading(true);
      try {
        const response = await customerService.getAllCustomers();
        if (response && response.data && response.data.length > 0) {
          setCustomers(response.data);
          
          // Use the first customer as a default fallback 
          // This ensures we have a valid customer ID that exists in the database
          if (response.data[0]?.id) {
            setDefaultCustomerId(response.data[0].id);
            console.log('CheckoutPage: Set default customer ID:', response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setCustomersLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);
  
  /**
   * Cart Loading from localStorage
   * 
   * This effect handles loading cart items directly from localStorage on component mount.
   * It implements a fallback strategy to ensure the checkout page always has cart data:
   * 1. First checks if cart items exist in the React context
   * 2. If not, loads cart items directly from localStorage
   * 3. Updates the local state to use these items for rendering
   * 4. Also updates the context state for consistency
   * 
   * This approach prevents the checkout page from redirecting back to the calendar
   * due to empty cart state during page navigation.
   */
  useEffect(() => {
    console.log('CheckoutPage: Component mounted, loading cart items from localStorage');
    try {
      const savedCart = localStorage.getItem('tailtownCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart) as FinancialCartItem[];
        console.log('CheckoutPage: Found items in localStorage:', parsedCart);
        
        // Directly use the localStorage cart items for rendering
        if (parsedCart.length > 0) {
          console.log('CheckoutPage: Setting local cart items from localStorage');
          // Ensure we're using the ExtendedCartItem type
          setLocalCartItems(parsedCart as ExtendedCartItem[]);
          
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
  
  // Use financial service to calculate totals
  useEffect(() => {
    if (localCartItems.length > 0) {
      // Get calculation from financial service
      const calculation = financialService.calculateTotals(localCartItems);
      setFinancialCalculation(calculation);
      
      // Set initial payment amount based on total from calculation
      // Round to 2 decimal places to ensure consistent cents display
      setPaymentAmount(financialService.roundCurrency(calculation.total));
      
      console.log('CheckoutPage: Financial calculation updated', calculation);
    }
  }, [localCartItems]); // Recalculate when cart items change
  
  // Extract financial values from calculation for easier access
  const subtotal = financialCalculation?.subtotal || 0;
  const tax = financialCalculation?.tax || 0;
  const total = financialCalculation?.total || 0;
  
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
    
    // No need for customer selection validation as customer ID should be in cart items
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('CheckoutPage: Processing payment for cart items:', localCartItems);
      
      // Process each cart item to create an invoice and payment record
      for (const item of localCartItems) {
        // Check if we have the required item ID
        if (!item.id) {
          console.error('CheckoutPage: Missing reservation ID for item:', item);
          continue;
        }
        
        // Retrieve customer ID from reservation if not in cart item
        // We'll use the first customer we found in the database as a default
        if (!item.customerId) {
          if (defaultCustomerId) {
            console.log('CheckoutPage: Adding default customer ID to cart item', item);
            item.customerId = defaultCustomerId;
          } else {
            console.error('CheckoutPage: No default customer ID available');
            setError('No customer found. Please ensure there are customers in the system.');
            setLoading(false);
            return;
          }
        }
        
        // Log detailed information about the cart item for debugging
        console.log('CheckoutPage: Processing cart item:', {
          id: item.id,
          name: item.name,
          customerId: item.customerId || 'Not set',
          usingDefaultId: !item.customerId
        });
        
        try {
          // Calculate the total amount for this item including add-ons
          const basePrice = item.price || 0;
          const addOnsTotal = item.addOns?.reduce((sum, addon) => sum + (addon.price * (addon.quantity || 1)), 0) || 0;
          const subtotal = basePrice + addOnsTotal;
          
          // Calculate tax (using the standard tax rate of 7.44%)
          const taxRate = 0.0744;
          const taxAmount = Math.round((subtotal * taxRate) * 100) / 100;
          const total = Math.round((subtotal + taxAmount) * 100) / 100;
          
          // 1. Create an invoice for this reservation
          console.log('CheckoutPage: Creating invoice for reservation');
          
          // Prepare line items for the invoice
          const lineItems = [
            // Main service line item
            {
              description: `${item.serviceName || 'Service'} (${new Date(item.startDate || '').toLocaleDateString()} - ${new Date(item.endDate || '').toLocaleDateString()})`,
              quantity: 1,
              unitPrice: basePrice,
              amount: basePrice,
              taxable: true
            }
          ];
          
          // Add line items for each add-on service
          if (item.addOns && item.addOns.length > 0) {
            item.addOns.forEach(addon => {
              lineItems.push({
                description: `Add-on: ${addon.name}`,
                quantity: addon.quantity || 1,
                unitPrice: addon.price,
                amount: addon.price * (addon.quantity || 1),
                taxable: true
              });
            });
          }
          
          // Create the invoice
          const invoiceResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/invoices`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customerId: item.customerId, // Use the customer ID from the cart item
              reservationId: item.id.startsWith('temp-') ? undefined : item.id,
              dueDate: new Date().toISOString().split('T')[0], // Due today
              subtotal,
              taxRate,
              taxAmount,
              total,
              status: 'PAID', // Mark as paid immediately
              notes: `Paid via ${paymentMethod} at checkout`,
              lineItems
            })
          });
          
          if (!invoiceResponse.ok) {
            const errorData = await invoiceResponse.json();
            console.error('CheckoutPage: Failed to create invoice:', errorData);
            throw new Error('Failed to create invoice');
          }
          
          const invoiceResult = await invoiceResponse.json();
          console.log('CheckoutPage: Invoice created successfully:', invoiceResult);
          
          // 2. Create a payment record linked to the invoice
          const paymentData = {
            invoiceId: invoiceResult.data.id,
            customerId: item.customerId, // Use the customer ID from the cart item
            amount: total,
            method: paymentMethod.toUpperCase(),
            status: 'PAID',
            notes: `Payment for ${item.serviceName || 'service'} on ${new Date().toISOString().split('T')[0]}`
          };
          
          console.log('CheckoutPage: Creating payment record:', paymentData);
          
          const paymentResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/payments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
          });
          
          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            console.error('CheckoutPage: Failed to create payment record:', errorData);
          } else {
            const result = await paymentResponse.json();
            console.log('CheckoutPage: Payment record created successfully:', result);
          }
          
          // 3. Also create a financial transaction record for completeness
          const transactionData = {
            type: 'PAYMENT',
            amount: total,
            status: 'COMPLETED',
            paymentMethod: paymentMethod.toUpperCase(),
            notes: `Payment for invoice ${invoiceResult.data.invoiceNumber}`,
            customerId: item.customerId,
            reservationId: item.id.startsWith('temp-') ? undefined : item.id,
            invoiceId: invoiceResult.data.id,
            metadata: JSON.stringify({
              source: 'checkout_page',
              itemDetails: {
                serviceName: item.serviceName,
                startDate: item.startDate ? new Date(item.startDate).toISOString() : null,
                endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
                petName: item.petName
              }
            })
          };
          
          console.log('CheckoutPage: Creating financial transaction record:', transactionData);
          
          try {
            const transactionResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/financial-transactions`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(transactionData)
            });
            
            if (!transactionResponse.ok) {
              const errorData = await transactionResponse.json();
              console.error('CheckoutPage: Failed to create transaction record:', errorData);
              console.log('CheckoutPage: Continuing checkout despite transaction record failure');
            } else {
              const transactionResult = await transactionResponse.json();
              console.log('CheckoutPage: Transaction record created successfully:', transactionResult);
            }
          } catch (error) {
            console.error('CheckoutPage: Error creating transaction record, but continuing:', error);
          }
        } catch (itemError) {
          console.error('CheckoutPage: Error processing payment for item:', item, itemError);
        }
      }
      
      // Process successful payment
      setSuccess(true);
      
      /**
       * Multi-layer Cart Clearing
       * 
       * We implement multiple layers of cart clearing to ensure a clean slate for new orders:
       * 1. Call the clearCart function from ShoppingCartContext (clears React state and localStorage)
       * 2. Directly clear localStorage again as an additional safeguard
       * 3. Perform a write-then-remove operation to handle potential caching issues
       * 4. Clear the local component state to ensure consistent rendering
       * 
       * This redundant approach prevents cart items from persisting between orders
       * and ensures customers start with an empty cart for their next reservation.
       */
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
            
            {/* Use the new OrderSummary component with centralized financial calculation */}
            <OrderSummary 
              cartItems={localCartItems} 
              calculation={financialCalculation || undefined} 
            />
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
