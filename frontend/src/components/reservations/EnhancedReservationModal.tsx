import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Grid,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { Reservation, reservationService } from '../../services/reservationService';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';

interface EnhancedReservationModalProps {
  open: boolean;
  onClose: () => void;
  reservationId: string | null;
  selectedDate?: { start: Date; end: Date } | null;
  onFormSubmit?: (formData: any) => Promise<{ reservationId?: string }>;
  onReservationUpdate?: (reservation: Reservation) => void;
}

const EnhancedReservationModal: React.FC<EnhancedReservationModalProps> = ({
  open,
  onClose,
  reservationId,
  selectedDate,
  onFormSubmit,
  onReservationUpdate,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch reservation data when the modal opens with a reservationId
  useEffect(() => {
    const fetchReservationData = async () => {
      if (!open || !reservationId) {
        setReservation(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await reservationService.getReservationById(reservationId);
        setReservation(data);
      } catch (err) {
        console.error('Error fetching reservation:', err);
        setError('Failed to load reservation details');
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [open, reservationId]);

  // Format currency helper
  const formatCurrencyValue = (value: number): string => {
    return formatCurrency(value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        {reservationId ? 'Reservation Details' : 'Create New Reservation'}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : reservation ? (
          <Box>
            {/* Basic Reservation Information */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #4c8bf5', pb: 1, mb: 2 }}>
                  Reservation Information
                </Typography>
              </Grid>
              
              {/* Status */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip 
                  label={reservation.status} 
                  color={
                    reservation.status === 'CONFIRMED' ? 'success' :
                    reservation.status === 'CHECKED_IN' ? 'primary' :
                    reservation.status === 'PENDING' ? 'warning' :
                    reservation.status === 'CANCELLED' ? 'error' :
                    'default'
                  }
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              
              {/* Order Number */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Order Number</Typography>
                <Typography variant="body1">{reservation.orderNumber || 'N/A'}</Typography>
              </Grid>
              
              {/* Dates */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1">{formatDate(reservation.startDate)}</Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                <Typography variant="body1">{formatDate(reservation.endDate)}</Typography>
              </Grid>
            </Grid>

            {/* Customer and Pet Information */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #4c8bf5', pb: 1, mb: 2 }}>
                  Customer & Pet Information
                </Typography>
              </Grid>
              
              {/* Customer Name */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                <Typography variant="body1">
                  {reservation.customer ? `${reservation.customer.firstName} ${reservation.customer.lastName}` : 'N/A'}
                </Typography>
              </Grid>
              
              {/* Pet Name */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Pet</Typography>
                <Typography variant="body1">
                  {reservation.pet ? `${reservation.pet.name} (${reservation.pet.breed})` : 'N/A'}
                </Typography>
              </Grid>
            </Grid>

            {/* Payment Information */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #4c8bf5', pb: 1, mb: 2 }}>Payment History</Typography>
                
                {reservation.payments && reservation.payments.length > 0 ? (
                  <>
                    {reservation.payments.map((payment, index) => (
                      <Box key={`payment-${index}`} sx={{ mb: 1, mt: 1 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={7}>
                            <Typography variant="body2">
                              {payment.method} - {payment.status}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={5} sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2">
                              {formatCurrencyValue(payment.amount)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                    
                    <Box sx={{ mt: 2, pt: 1, borderTop: '1px dashed #ccc' }}>
                      <Grid container>
                        <Grid item xs={7}>
                          <Typography variant="subtitle2">Total Payments</Typography>
                        </Grid>
                        <Grid item xs={5} sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2">
                            {formatCurrency(
                              reservation.payments.reduce((sum, p) => sum + p.amount, 0)
                            )}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">No payment records found</Typography>
                )}
              </Grid>
            </Grid>

            {/* Invoice Information */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', borderBottom: '2px solid #4c8bf5', pb: 1, mb: 2 }}>Invoice Information</Typography>
                
                {reservation.invoices && reservation.invoices.length > 0 ? (
                  <>
                    {reservation.invoices.map((invoice, index) => (
                      <Box key={`invoice-${index}`} sx={{ mb: 2 }}>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2">
                              Invoice #{invoice.invoiceNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              {formatDate(invoice.createdAt)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2">Status: {invoice.status}</Typography>
                          </Grid>
                          <Grid item xs={6} sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle2">
                              {formatCurrencyValue(invoice.total)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </>
                ) : reservation.invoice ? (
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2">
                          Invoice #{reservation.invoice.invoiceNumber}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">Status: {reservation.invoice.status}</Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle2">
                          {formatCurrencyValue(reservation.invoice.total)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No invoice records found</Typography>
                )}
              </Grid>
            </Grid>
            
            {/* Action Buttons */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onClose} color="primary">
                Close
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography>Loading reservation form...</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedReservationModal;
