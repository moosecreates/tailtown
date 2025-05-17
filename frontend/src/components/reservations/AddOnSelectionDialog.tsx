import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { serviceManagement } from '../../services/serviceManagement';
import { reservationService, Reservation } from '../../services/reservationService';
import addonService, { AddOnService } from '../../services/addonService';
import { useShoppingCart } from '../../contexts/ShoppingCartContext';

interface AddOnSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  serviceId: string;
  onAddOnsAdded: (success: boolean) => void;
}

interface AddOn {
  serviceId: string;
  addOnId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

const AddOnSelectionDialog: React.FC<AddOnSelectionDialogProps> = ({
  open,
  onClose,
  reservationId,
  serviceId,
  onAddOnsAdded
}) => {
  const navigate = useNavigate();
  // State for available add-ons
  const [availableAddOns, setAvailableAddOns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // State for selected add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  
  // Calculate subtotal
  const [subtotal, setSubtotal] = useState<number>(0);
  
  // Calculate subtotal whenever selected add-ons change
  useEffect(() => {
    const total = selectedAddOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    setSubtotal(total);
  }, [selectedAddOns]);
  
  // Load available add-on services when the dialog opens
  useEffect(() => {
    if (open && serviceId) {
      console.log('AddOnSelectionDialog: Dialog opened, loading add-ons for service ID:', serviceId);
      loadAddOns();
    }
  }, [open, serviceId]);
  
  const loadAddOns = async () => {
    if (!serviceId || !open) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSelectedAddOns([]); // Reset selected add-ons when loading new ones
      
      console.log('AddOnSelectionDialog: Loading add-ons for service ID:', serviceId);
      
      // First try to find add-ons specifically for this service
      const addOns = await addonService.getAllAddOns(serviceId);
      
      console.log('AddOnSelectionDialog: Loaded add-ons:', addOns);
      
      if (addOns.length === 0) {
        console.log('AddOnSelectionDialog: No add-ons found for this service, showing all available add-ons');
        // If no add-ons found for this specific service, get all add-ons
        const allAddOns = await addonService.getAllAddOns();
        setAvailableAddOns(allAddOns);
      } else {
        setAvailableAddOns(addOns);
      }
    } catch (err: any) {
      console.error('AddOnSelectionDialog: Error loading add-ons:', err);
      setError('Failed to load add-on services. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding an add-on service
  const handleAddService = (addon: AddOnService) => {
    // Check if the add-on is already selected
    const existingIndex = selectedAddOns.findIndex(item => item.addOnId === addon.id);
    
    if (existingIndex >= 0) {
      // If already selected, increase the quantity
      const updatedAddOns = [...selectedAddOns];
      updatedAddOns[existingIndex].quantity += 1;
      setSelectedAddOns(updatedAddOns);
    } else {
      // Otherwise, add it to the selected add-ons with quantity 1
      setSelectedAddOns([...selectedAddOns, {
        serviceId: addon.serviceId, // This is the service this add-on belongs to
        addOnId: addon.id, // This is the actual add-on ID
        name: addon.name,
        description: addon.description,
        price: addon.price,
        quantity: 1
      }]);
    }
  };
  
  // Handle changing add-on quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return; // Don't allow quantities less than 1
    
    const updatedAddOns = [...selectedAddOns];
    updatedAddOns[index].quantity = newQuantity;
    setSelectedAddOns(updatedAddOns);
  };
  
  // Handle removing an add-on
  const handleRemoveAddon = (index: number) => {
    const updatedAddOns = selectedAddOns.filter((_, i) => i !== index);
    setSelectedAddOns(updatedAddOns);
  };
  
  /**
   * Handle saving add-ons to the reservation
   * If there are no add-ons selected, add the reservation to cart and proceed to checkout
   * Otherwise, save the add-ons and show a success message
   */
  // Get access to shopping cart context
  const { addToCart } = useShoppingCart();

  /**
   * Handles saving add-ons to a reservation and navigating to checkout
   * 
   * This function manages several critical processes:
   * 1. Fetches reservation details to create a cart item
   * 2. Adds the reservation to the cart (with or without add-ons)
   * 3. Updates localStorage directly as a backup mechanism
   * 4. Uses direct form submission to navigate to checkout without intermediate steps
   */
  const handleSaveAddOns = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Fetch reservation details to add to cart
      console.log('AddOnSelectionDialog: Fetching reservation details for cart, ID:', reservationId);
      const reservationDetails = await reservationService.getReservationById(reservationId);
      
      if (!reservationDetails) {
        throw new Error('Could not retrieve reservation details');
      }
      
      console.log('AddOnSelectionDialog: Got reservation details:', reservationDetails);
      
      // If no add-ons are selected, add reservation to cart and proceed to checkout
      if (selectedAddOns.length === 0) {
        // Create cart item from reservation
        const cartItem = {
          id: reservationId,
          name: `${reservationDetails.service?.name || 'Reservation'} - ${reservationDetails.pet?.name || 'Pet'}`,
          price: reservationDetails.service?.price || 0,
          quantity: 1,
          serviceName: reservationDetails.service?.name,
          petName: reservationDetails.pet?.name,
          startDate: new Date(reservationDetails.startDate),
          endDate: new Date(reservationDetails.endDate)
        };
        
        // Add to cart through context
        console.log('AddOnSelectionDialog: Adding reservation to cart:', cartItem);
        addToCart(cartItem);
        
        // Also directly update localStorage as backup
        try {
          const existingCart = localStorage.getItem('tailtownCart');
          let cartArray = [];
          
          if (existingCart) {
            cartArray = JSON.parse(existingCart);
          }
          
          cartArray.push(cartItem);
          localStorage.setItem('tailtownCart', JSON.stringify(cartArray));
          console.log('AddOnSelectionDialog: Successfully added to localStorage:', cartArray);
        } catch (error) {
          console.error('AddOnSelectionDialog: Error updating localStorage:', error);
        }
        
        /**
         * Direct Navigation Approach
         * 
         * We use a hidden form submission instead of React Router navigation to:
         * 1. Bypass any React state update race conditions
         * 2. Prevent the calendar from briefly appearing during navigation
         * 3. Force a complete page reload to ensure fresh state at checkout
         */
        // Create a hidden form to submit directly to checkout page
        // This bypasses React Router completely and prevents any intermediate navigation
        console.log('AddOnSelectionDialog: No add-ons selected, creating direct navigation form to checkout');
        
        // Create a hidden form element
        const form = document.createElement('form');
        form.style.display = 'none';
        form.method = 'get';
        form.action = '/checkout';
        
        // Add a timestamp to prevent caching
        const timestamp = document.createElement('input');
        timestamp.type = 'hidden';
        timestamp.name = 'timestamp';
        timestamp.value = Date.now().toString();
        form.appendChild(timestamp);
        
        // Add the form to the document body
        document.body.appendChild(form);
        
        // Close the dialog
        onClose();
        
        // Submit the form immediately
        console.log('AddOnSelectionDialog: Submitting direct navigation form to checkout');
        form.submit();
        
        // Remove the form after submission
        setTimeout(() => {
          document.body.removeChild(form);
        }, 100);
        return;
      }
      
      // Prepare add-on data for API submission
      // The backend expects an array of objects with serviceId and quantity
      // But we're sending the addOnId as the serviceId because that's what the backend controller expects
      const addOnData = selectedAddOns.map(addon => ({
        serviceId: addon.addOnId, // Send the add-on ID as the serviceId parameter
        quantity: addon.quantity
      }));
      
      console.log('AddOnSelectionDialog: Sending add-on data to backend:', addOnData);
      
      // Save add-ons to the reservation using the reservation service
      await reservationService.addAddOnsToReservation(reservationId, addOnData);
      
      // Create cart item with add-ons
      // Transform AddOn objects to match CartItem.addOns interface
      const formattedAddOns = selectedAddOns.map(addon => ({
        id: addon.addOnId,
        name: addon.name,
        price: addon.price,
        quantity: addon.quantity
      }));
      
      const cartItem = {
        id: reservationId,
        name: `${reservationDetails.service?.name || 'Reservation'} - ${reservationDetails.pet?.name || 'Pet'}`,
        price: reservationDetails.service?.price || 0,
        quantity: 1,
        serviceName: reservationDetails.service?.name,
        petName: reservationDetails.pet?.name,
        startDate: new Date(reservationDetails.startDate),
        endDate: new Date(reservationDetails.endDate),
        addOns: formattedAddOns
      };
      
      // Add to cart through context
      console.log('AddOnSelectionDialog: Adding reservation with add-ons to cart:', cartItem);
      addToCart(cartItem);
      
      // Also directly update localStorage as backup
      try {
        const existingCart = localStorage.getItem('tailtownCart');
        let cartArray = [];
        
        if (existingCart) {
          cartArray = JSON.parse(existingCart);
        }
        
        cartArray.push(cartItem);
        localStorage.setItem('tailtownCart', JSON.stringify(cartArray));
        console.log('AddOnSelectionDialog: Successfully added to localStorage with add-ons:', cartArray);
      } catch (error) {
        console.error('AddOnSelectionDialog: Error updating localStorage:', error);
      }
      
      // Show success message to the user
      setSuccess('Add-on services have been added to the reservation.');
      
      // Notify parent component that add-ons were added successfully
      onAddOnsAdded(true);
      
      // Create a hidden form to submit directly to checkout page
      // This bypasses React Router completely and prevents any intermediate navigation
      console.log('AddOnSelectionDialog: Creating direct navigation form to checkout');
      
      // Create a hidden form element
      const form = document.createElement('form');
      form.style.display = 'none';
      form.method = 'get';
      form.action = '/checkout';
      
      // Add a timestamp to prevent caching
      const timestamp = document.createElement('input');
      timestamp.type = 'hidden';
      timestamp.name = 'timestamp';
      timestamp.value = Date.now().toString();
      form.appendChild(timestamp);
      
      // Add the form to the document body
      document.body.appendChild(form);
      
      // Close the dialog
      onClose();
      
      // Submit the form immediately
      console.log('AddOnSelectionDialog: Submitting direct navigation form to checkout');
      form.submit();
      
      // Remove the form after submission
      setTimeout(() => {
        document.body.removeChild(form);
      }, 100);
    } catch (err: any) {
      console.error('AddOnSelectionDialog: Error saving add-ons:', err);
      setError(err.response?.data?.message || 'Failed to add services to the reservation. Please try again.');
      onAddOnsAdded(false);
    } finally {
      setSaving(false);
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Improved close handler that properly manages focus to prevent accessibility warnings
   * This ensures focus is not trapped in the dialog when it closes
   */
  const handleClose = () => {
    // First, move focus to the document body to ensure it's not trapped in the dialog
    document.body.focus();
    
    // Clear focus from any element inside the dialog to prevent accessibility warnings
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // Use a small timeout to ensure focus management happens before dialog closes
    // This prevents React warnings about state updates during unmounting
    setTimeout(() => {
      onClose();
    }, 0);
  };
  
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="add-on-dialog-title"
      maxWidth="md"
      fullWidth
      // Add proper focus management to prevent accessibility warnings
      disableRestoreFocus
      // Prevent dialog from closing when clicking outside
      disableEscapeKeyDown={false}
      // Ensure proper focus management
      keepMounted={false}
      TransitionProps={{
        onEnter: () => {
          console.log('AddOnSelectionDialog: Dialog entering');
        }
      }}
    >
      <DialogTitle id="add-on-dialog-title">
        Add Services to Your Reservation
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <Typography variant="subtitle1" gutterBottom>
            Available Add-On Services
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : availableAddOns.length === 0 ? (
            <Alert severity="info">No add-on services are available for this reservation.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableAddOns.map((addon) => (
                    <TableRow key={addon.id}>
                      <TableCell>{addon.name}</TableCell>
                      <TableCell>{addon.description}</TableCell>
                      <TableCell align="right">{formatCurrency(addon.price)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAddService(addon)}
                        >
                          <AddIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Services
          </Typography>
          
          {selectedAddOns.length === 0 ? (
            <Alert severity="info">No services selected yet.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedAddOns.map((addon, index) => (
                    <TableRow key={index}>
                      <TableCell>{addon.name}</TableCell>
                      <TableCell align="right">{formatCurrency(addon.price)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(index, addon.quantity - 1)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ mx: 1 }}>{addon.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(index, addon.quantity + 1)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(addon.price * addon.quantity)}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveAddon(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Subtotal row */}
                  <TableRow>
                    <TableCell colSpan={3} align="right"><strong>Subtotal</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(subtotal)}</strong></TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSaveAddOns}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : selectedAddOns.length === 0 ? 'Continue Without Add-ons' : 'Add to Reservation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOnSelectionDialog;
