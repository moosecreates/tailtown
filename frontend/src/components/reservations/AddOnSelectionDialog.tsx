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
  
  // Load available add-on services
  useEffect(() => {
    const loadAddOns = async () => {
      if (!serviceId || !open) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get add-on services for this specific service
        const response = await serviceManagement.getServiceAddOns(serviceId);
        
        if (response && response.data) {
          console.log('Available add-ons:', response.data);
          setAvailableAddOns(response.data);
        }
      } catch (err) {
        console.error('Error loading add-on services:', err);
        setError('Failed to load add-on services. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      loadAddOns();
    }
  }, [serviceId, open]);
  
  // Update subtotal when selected add-ons change
  useEffect(() => {
    // Calculate add-ons total
    const addOnsTotal = selectedAddOns.reduce(
      (sum, addon) => sum + (addon.price * addon.quantity),
      0
    );
    
    // Set the total
    setSubtotal(addOnsTotal);
  }, [selectedAddOns]);
  
  // Handle adding an add-on service
  const handleAddService = (addon: any) => {
    // Check if the add-on is already selected
    const existingIndex = selectedAddOns.findIndex(item => item.serviceId === addon.id);
    
    if (existingIndex >= 0) {
      // Increment quantity if already selected
      const updatedAddOns = [...selectedAddOns];
      updatedAddOns[existingIndex].quantity += 1;
      setSelectedAddOns(updatedAddOns);
    } else {
      // Add new add-on with quantity 1
      setSelectedAddOns([
        ...selectedAddOns,
        {
          serviceId: addon.id,
          name: addon.name,
          description: addon.description,
          quantity: 1,
          price: addon.price,
        },
      ]);
    }
  };
  
  // Handle changing add-on quantity
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove the add-on if quantity is less than 1
      const updatedAddOns = selectedAddOns.filter((_, i) => i !== index);
      setSelectedAddOns(updatedAddOns);
    } else {
      // Update the quantity
      const updatedAddOns = [...selectedAddOns];
      updatedAddOns[index].quantity = newQuantity;
      setSelectedAddOns(updatedAddOns);
    }
  };
  
  // Handle removing an add-on
  const handleRemoveAddon = (index: number) => {
    const updatedAddOns = selectedAddOns.filter((_, i) => i !== index);
    setSelectedAddOns(updatedAddOns);
  };
  
  // Handle saving add-ons to the reservation
  const handleSaveAddOns = async () => {
    if (!reservationId || selectedAddOns.length === 0) {
      onClose();
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Format the add-ons for the API
      const addOnData = selectedAddOns.map(addon => ({
        serviceId: addon.serviceId,
        quantity: addon.quantity
      }));
      
      // Call the API to add add-ons to the reservation
      const response = await reservationService.addAddOnsToReservation(
        reservationId,
        addOnData
      );
      
      if (response && response.status === 'success') {
        setSuccess('Add-on services successfully added to the reservation');
        setTimeout(() => {
          onAddOnsAdded(true);
          onClose();
        }, 1500);
      } else {
        setError('Failed to add services to the reservation');
        onAddOnsAdded(false);
      }
    } catch (err: any) {
      console.error('Error adding add-ons to reservation:', err);
      setError(err.message || 'Failed to add services to the reservation');
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
    }).format(amount);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ py: 1, px: 2, fontSize: '1rem' }}>
        Add Services to Reservation
      </DialogTitle>
      <DialogContent sx={{ py: 1, px: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Available Add-On Services
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : availableAddOns.length === 0 ? (
            <Alert severity="info">No add-on services available for this reservation type.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Service</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Add</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableAddOns.map((addon) => (
                    <TableRow key={addon.id}>
                      <TableCell>{addon.name}</TableCell>
                      <TableCell>{addon.description || 'No description'}</TableCell>
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
        <Button onClick={onClose} disabled={saving}>
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
