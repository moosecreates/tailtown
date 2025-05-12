import React, { useState, useEffect } from 'react';
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
import { reservationService } from '../../services/reservationService';

interface AddOnSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  reservationId: string;
  serviceId: string;
  onAddOnsAdded: (success: boolean) => void;
}

interface AddOn {
  serviceId: string;
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
      console.log('AddOnSelectionDialog: Not loading add-ons - dialog not open or no serviceId');
      return;
    }
    
    console.log('AddOnSelectionDialog: Loading add-ons for service ID:', serviceId);
    
    try {
      setLoading(true);
      setError(null);
      setSelectedAddOns([]); // Reset selected add-ons when loading new ones
      
      // For now, use hardcoded add-ons based on service ID
      // In a real implementation, you would fetch from the API
      let hardcodedAddOns = [];
      
      // Check if this is a grooming service (assuming nail trim has this ID)
      if (serviceId === '15a3885b-f62d-436a-8cbb-2155557c46b1') {
        // Grooming add-ons
        hardcodedAddOns = [
          {
            id: '8a51bb58-a600-439f-8642-1dd3d3a62b61',
            name: 'Hair Blow Out',
            description: 'Professional blow drying and styling',
            price: 15,
            selected: false
          },
          {
            id: '93e5da0b-6103-4abf-b266-2b775717c781',
            name: 'Nail Polish',
            description: 'Colorful nail polish application',
            price: 5,
            selected: false
          }
        ];
      } else {
        // Daycare add-ons
        hardcodedAddOns = [
          {
            id: 'c4e7f8d9-a1b2-3c4d-5e6f-7g8h9i0j1k2l',
            name: 'Extra Playtime',
            description: 'Additional 30 minutes of supervised play',
            price: 10,
            selected: false
          },
          {
            id: 'd5f6g7h8-i9j0-k1l2-m3n4-o5p6q7r8s9t0',
            name: 'Special Treat',
            description: 'Premium dog treat during the day',
            price: 3,
            selected: false
          }
        ];
      }
      
      console.log('AddOnSelectionDialog: Setting add-ons:', hardcodedAddOns);
      setAvailableAddOns(hardcodedAddOns);
      
    } catch (error: any) {
      console.error('Error loading add-ons:', error);
      setError('Failed to load available add-on services. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle adding an add-on service
  const handleAddService = (addon: any) => {
    // Check if the add-on is already in the selected list
    const existingIndex = selectedAddOns.findIndex(item => item.serviceId === addon.id);
    
    if (existingIndex >= 0) {
      // If it exists, just increment the quantity
      const updatedAddOns = [...selectedAddOns];
      updatedAddOns[existingIndex].quantity += 1;
      setSelectedAddOns(updatedAddOns);
    } else {
      // Otherwise, add it to the list with quantity 1
      const newAddOn: AddOn = {
        serviceId: addon.id,
        name: addon.name,
        description: addon.description,
        quantity: 1,
        price: addon.price
      };
      
      setSelectedAddOns([...selectedAddOns, newAddOn]);
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
   * If there are no add-ons selected, simply close the dialog
   * Otherwise, save the add-ons and show a success message
   */
  const handleSaveAddOns = async () => {
    // If no add-ons are selected, just close the dialog without saving
    if (selectedAddOns.length === 0) {
      onClose();
      return;
    }
    
    try {
      // Start saving process and clear any previous errors
      setSaving(true);
      setError(null);
      
      // Prepare add-on data for API submission
      const addOnData = selectedAddOns.map(addon => ({
        name: addon.name,
        price: addon.price,
        quantity: addon.quantity,
        total: addon.price * addon.quantity
      }));
      
      // TODO: Replace this with actual API call when backend is ready
      // For now, we'll simulate a successful API response
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success message to the user
      setSuccess('Add-on services have been added to the reservation.');
      
      // Notify parent component that add-ons were successfully added
      // This will trigger the form to close via the custom event system
      onAddOnsAdded(true);
      
      // Close dialog after a short delay
      // First clear focus from any element inside the dialog
      // to prevent accessibility warnings
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving add-ons:', error);
      setError('Failed to add services to the reservation. Please try again.');
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
                  {availableAddOns.map((addon, index) => (
                    <TableRow key={index}>
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
          disabled={selectedAddOns.length === 0 || saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Add to Reservation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddOnSelectionDialog;
