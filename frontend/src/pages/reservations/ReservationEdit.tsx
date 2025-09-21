import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { reservationService } from '../../services/reservationService';
import { Reservation } from '../../services/reservationService';
import { serviceManagement } from '../../services/serviceManagement';
import { resourceService, type Resource } from '../../services/resourceService';
import { Service } from '../../types/service';

export default function ReservationEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

  const [formData, setFormData] = useState({
    startDate: new Date(),
    endDate: new Date(),
    status: 'CONFIRMED' as ReservationStatus,
    serviceId: '',
    resourceId: '',
    notes: '',
    staffNotes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        // Load reservation, services, and resources in parallel
        const [reservationData, servicesResponse, resourcesResponse] = await Promise.all([
          reservationService.getReservationById(id),
          serviceManagement.getAllServices(),
          resourceService.getAllResources()
        ]);
        
        setReservation(reservationData);
        setServices(servicesResponse.data || []);
        setResources(resourcesResponse.data || []);
        
        setFormData({
          startDate: new Date(reservationData.startDate),
          endDate: new Date(reservationData.endDate),
          status: reservationData.status,
          serviceId: reservationData.service?.id || '',
          resourceId: reservationData.resource?.id || '',
          notes: reservationData.notes || '',
          staffNotes: reservationData.staffNotes || '',
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load reservation details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      console.log('Submitting form data:', {
        ...formData,
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
      });
      const updatedReservation = await reservationService.updateReservation(id, {
        startDate: formData.startDate.toISOString(),
        endDate: formData.endDate.toISOString(),
        status: formData.status,
        notes: formData.notes,
        staffNotes: formData.staffNotes,
        // Add the fields that the backend expects
        ...(formData.serviceId && { serviceId: formData.serviceId }),
        ...(formData.resourceId && { resourceId: formData.resourceId }),
      } as any);
      console.log('Updated reservation:', updatedReservation);
      navigate(`/reservations/${id}`);
    } catch (error) {
      console.error('Error updating reservation:', error);
      setError('Failed to update reservation');
    }
  };

  const handleCancel = () => {
    navigate(`/reservations/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !reservation) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error || 'Reservation not found'}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Edit Reservation
        </Typography>
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Service: {reservation.service?.name || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Customer: {reservation.customer?.firstName} {reservation.customer?.lastName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Pet: {reservation.pet?.name}
              </Typography>
            </Box>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mb: 3 }}>
                <DateTimePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => date && setFormData({ ...formData, startDate: date })}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <DateTimePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => date && setFormData({ ...formData, endDate: date })}
                />
              </Box>
            </LocalizationProvider>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ReservationStatus })}
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                <MenuItem value="CHECKED_IN">Checked In</MenuItem>
                <MenuItem value="CHECKED_OUT">Checked Out</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="NO_SHOW">No Show</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Service</InputLabel>
              <Select
                value={formData.serviceId}
                label="Service"
                onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Select a service</em>
                </MenuItem>
                {services.map((service) => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Kennel/Suite</InputLabel>
              <Select
                value={formData.resourceId}
                label="Kennel/Suite"
                onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
              >
                <MenuItem value="">
                  <em>Select a kennel/suite</em>
                </MenuItem>
                {resources.map((resource) => (
                  <MenuItem key={resource.id} value={resource.id}>
                    {resource.name} ({resource.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Customer Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Staff Notes"
              multiline
              rows={3}
              value={formData.staffNotes}
              onChange={(e) => setFormData({ ...formData, staffNotes: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Save Changes
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}
