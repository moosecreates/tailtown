import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import CustomerSelection from '../../components/orders/CustomerSelection';
import ReservationCreation from '../../components/orders/ReservationCreation';
import AddOnSelection from '../../components/orders/AddOnSelection';
import InvoiceReview from '../../components/orders/InvoiceReview';
import PaymentProcessing from '../../components/orders/PaymentProcessing';
import { Customer } from '../../types/customer';
// Importing the Pet type from petService to ensure type consistency
import { Pet } from '../../services/petService';
import { reservationService } from '../../services/reservationService';
import { invoiceService } from '../../services/invoiceService';
import { paymentService } from '../../services/paymentService';
import { useNavigate } from 'react-router-dom';

// Define the steps for the ordering process
const steps = [
  'Customer Information',
  'Reservation Details',
  'Add-On Services',
  'Review Invoice',
  'Process Payment'
];

// Define the order data structure
interface OrderData {
  customer: Customer | null;
  pet: Pet | null;
  reservation: {
    startDate: Date | null;
    endDate: Date | null;
    serviceId: string;
    resourceId: string;
    status: string;
    notes: string;
    price?: number; // Add price property to fix TypeScript error
  };
  addOns: Array<{
    serviceId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  invoice: {
    invoiceNumber: string;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discount: number;
    total: number;
    notes: string;
  };
  payment: {
    method: string;
    amount: number;
    cardDetails?: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      cardholderName: string;
    };
  };
}

const OrderEntry: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<string | null>(null);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Initialize order data with empty values
  const [orderData, setOrderData] = useState<OrderData>({
    customer: null,
    pet: null,
    reservation: {
      startDate: null,
      endDate: null,
      serviceId: '',
      resourceId: '',
      status: 'PENDING',
      notes: '',
    },
    addOns: [],
    invoice: {
      invoiceNumber: `INV-${Date.now()}`,
      subtotal: 0,
      taxRate: 0.0744, // 7.44% tax rate
      taxAmount: 0,
      discount: 0,
      total: 0,
      notes: '',
    },
    payment: {
      method: 'CREDIT_CARD',
      amount: 0,
    },
  });

  // Handle navigation between steps
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setOrderComplete(false);
    setCreatedReservationId(null);
    setCreatedInvoiceId(null);
    setOrderData({
      customer: null,
      pet: null,
      reservation: {
        startDate: null,
        endDate: null,
        serviceId: '',
        resourceId: '',
        status: 'PENDING',
        notes: '',
      },
      addOns: [],
      invoice: {
        invoiceNumber: `INV-${Date.now()}`,
        subtotal: 0,
        taxRate: 0.0744,
        taxAmount: 0,
        discount: 0,
        total: 0,
        notes: '',
      },
      payment: {
        method: 'CREDIT_CARD',
        amount: 0,
      },
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Handle customer and pet selection
  const handleCustomerUpdate = (customer: Customer, pet: Pet) => {
    setOrderData({
      ...orderData,
      customer: customer,
      pet: pet,
    });
    handleNext();
  };

  // Handle reservation creation
  const handleReservationUpdate = (reservationData: any) => {
    // Calculate initial invoice amounts based on the service price
    const servicePrice = reservationData.price || 0;
    const subtotal = servicePrice;
    const taxRate = 0.0744; // 7.44% tax rate
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    
    setOrderData({
      ...orderData,
      reservation: reservationData,
      invoice: {
        ...orderData.invoice,
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
      },
      payment: {
        ...orderData.payment,
        amount: (reservationData.price || 0) * (1 + orderData.invoice.taxRate),
      },
    });
    handleNext();
  };

  // Handle add-on selection
  const handleAddOnsUpdate = (addOns: any[]) => {
    const addOnTotal = addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    const servicePrice = orderData.reservation.price || 0;
    
    // Log the prices to help with debugging
    console.log('Service price:', servicePrice);
    console.log('Add-on total:', addOnTotal);
    
    const subtotal = servicePrice + addOnTotal;
    const taxAmount = subtotal * orderData.invoice.taxRate;
    const total = subtotal + taxAmount - (orderData.invoice.discount || 0);
    
    console.log('Calculated subtotal:', subtotal);
    console.log('Add-ons included:', addOns);
    console.log('Calculated total:', total);
    
    setOrderData({
      ...orderData,
      addOns,
      invoice: {
        ...orderData.invoice,
        subtotal,
        taxAmount,
        total,
      },
      payment: {
        ...orderData.payment,
        amount: total,
      },
    });
    handleNext();
  };

  // Handle invoice review
  const handleInvoiceUpdate = (invoiceData: any) => {
    setOrderData({
      ...orderData,
      invoice: {
        ...orderData.invoice,
        ...invoiceData,
      },
      payment: {
        ...orderData.payment,
        amount: invoiceData.total,
      },
    });
    handleNext();
  };

  // Handle payment processing
  const handlePaymentUpdate = (paymentData: any) => {
    setOrderData({
      ...orderData,
      payment: {
        ...orderData.payment,
        ...paymentData,
      },
    });
    
    // Trigger final submission
    completeOrder();
  };

  // Complete the order process
  const completeOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!orderData.customer || !orderData.pet) {
        throw new Error('Customer and pet information is required');
      }
      
      // Step 1: Create the reservation
      const reservationData: any = {
        customerId: orderData.customer.id,
        petId: orderData.pet.id,
        serviceId: orderData.reservation.serviceId,
        startDate: orderData.reservation.startDate ? new Date(orderData.reservation.startDate).toISOString() : new Date().toISOString(),
        endDate: orderData.reservation.endDate ? new Date(orderData.reservation.endDate).toISOString() : new Date().toISOString(),
        status: orderData.reservation.status as 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW',
        notes: orderData.reservation.notes || ''
      };
      
      // Only include resourceId if it's not empty
      if (orderData.reservation.resourceId && orderData.reservation.resourceId !== '') {
        reservationData.resourceId = orderData.reservation.resourceId;
      }
      
      const reservation = await reservationService.createReservation(reservationData);
      setCreatedReservationId(reservation.id);
      
      // Step 2: Create the invoice
      // Calculate the base service price (total subtotal minus add-ons)
      const addOnTotal = orderData.addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
      const baseServicePrice = orderData.invoice.subtotal - addOnTotal;
      
      // Log values for debugging
      console.log('Creating invoice with data:');
      console.log('Base service price:', baseServicePrice);
      console.log('Add-on total:', addOnTotal);
      console.log('Subtotal:', orderData.invoice.subtotal);
      console.log('Tax amount:', orderData.invoice.taxAmount);
      console.log('Total:', orderData.invoice.total);
      
      const invoiceData = {
        customerId: orderData.customer.id,
        reservationId: reservation.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        status: 'DRAFT' as 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED',
        subtotal: orderData.invoice.subtotal,
        taxRate: orderData.invoice.taxRate,
        taxAmount: orderData.invoice.taxAmount,
        discount: orderData.invoice.discount,
        total: orderData.invoice.total,
        notes: orderData.invoice.notes,
        lineItems: [
          // Add main service as a line item
          {
            description: "Reservation Service",
            quantity: 1,
            unitPrice: baseServicePrice,
            amount: baseServicePrice,
            taxable: true
          },
          // Add each add-on as a line item
          ...orderData.addOns.map(addon => ({
            description: addon.name,
            quantity: addon.quantity,
            unitPrice: addon.price,
            amount: addon.price * addon.quantity,
            taxable: true
          }))
        ]
      };
      
      const invoice = await invoiceService.createInvoice(invoiceData);
      if (invoice.id) {
        setCreatedInvoiceId(invoice.id);
      }
      
      // Step 3: Process payment (simulated)
      const paymentData = {
        invoiceId: invoice.id as string,
        customerId: orderData.customer.id,
        amount: orderData.payment.amount,
        method: orderData.payment.method as 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'CHECK' | 'BANK_TRANSFER' | 'STORE_CREDIT' | 'GIFT_CARD',
        status: 'PAID' as 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED',
        transactionId: `TXID-${Date.now()}`, // Simulated transaction ID
        notes: `Payment processed via ${orderData.payment.method}`
      };
      
      await paymentService.createPayment(paymentData);
      
      // Step 4: Update invoice status to PAID
      if (invoice.id) {
        await invoiceService.updateInvoice(invoice.id, { status: 'PAID' as 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED' });
      }
      
      // Order completed successfully
      setOrderComplete(true);
      setSnackbar({
        open: true,
        message: 'Order processed successfully!',
        severity: 'success',
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the order');
      setSnackbar({
        open: true,
        message: err.message || 'An error occurred while processing the order',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset the order form
  const handleStartNew = () => {
    handleReset();
  };

  // View customer details
  const handleViewCustomer = () => {
    if (orderData.customer?.id) {
      navigate(`/customers/${orderData.customer.id}`);
    }
  };

  // View reservation details
  const handleViewReservation = () => {
    if (createdReservationId) {
      navigate(`/reservations/${createdReservationId}`);
    }
  };

  // Render the current step
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerSelection 
            onContinue={handleCustomerUpdate} 
            initialCustomer={orderData.customer}
            initialPet={orderData.pet}
          />
        );
      case 1:
        return (
          <ReservationCreation 
            onContinue={handleReservationUpdate} 
            customer={orderData.customer}
            pet={orderData.pet}
            initialReservation={orderData.reservation}
          />
        );
      case 2:
        return (
          <AddOnSelection 
            onContinue={handleAddOnsUpdate} 
            initialAddOns={orderData.addOns}
            serviceId={orderData.reservation.serviceId}
            reservationDates={{
              startDate: orderData.reservation.startDate,
              endDate: orderData.reservation.endDate
            }}
          />
        );
      case 3:
        return (
          <InvoiceReview 
            onContinue={handleInvoiceUpdate} 
            orderData={orderData}
          />
        );
      case 4:
        return (
          <PaymentProcessing 
            onContinue={handlePaymentUpdate} 
            amount={orderData.invoice.total}
            initialPayment={orderData.payment}
            invoiceId={createdInvoiceId || undefined} // Pass the invoice ID to the PaymentProcessing component
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          New Order Entry
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {orderComplete ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                Order completed successfully!
              </Typography>
              <Typography variant="body1" paragraph>
                The reservation has been created and payment has been processed.
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={handleViewCustomer}
                  disabled={!orderData.customer?.id}
                >
                  View Customer
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleViewReservation}
                  disabled={!createdReservationId}
                >
                  View Reservation
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleStartNew}
                >
                  Create New Order
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              {getStepContent(activeStep)}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                {activeStep !== 0 && (
                  <Button
                    disabled={loading}
                    onClick={handleBack}
                    sx={{ mr: 1 }}
                  >
                    Back
                  </Button>
                )}
                
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={
                      (activeStep === 0 && (!orderData.customer || !orderData.pet)) ||
                      (activeStep === 1 && !orderData.reservation.serviceId) ||
                      loading
                    }
                  >
                    Next
                  </Button>
                )}
              </Box>
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderEntry;
