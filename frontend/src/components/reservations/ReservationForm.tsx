import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  SelectChangeEvent,
  Alert,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Customer } from '../../types/customer';
import { Pet } from '../../types/pet';
import { Service } from '../../types/service';
import { customerService } from '../../services/customerService';
import { petService } from '../../services/petService';
import { serviceManagement } from '../../services/serviceManagement';

interface ReservationFormProps {
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  defaultDates?: {
    start: Date;
    end: Date;
  };
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onSubmit, initialData, defaultDates }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(defaultDates?.start || null);
  const [endDate, setEndDate] = useState<Date | null>(defaultDates?.end || null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [customersResponse, servicesResponse] = await Promise.all([
          customerService.getAllCustomers(),
          serviceManagement.getAllServices(),
        ]);
        setCustomers(customersResponse.data || []);
        setServices(servicesResponse.data || []);

        if (initialData) {
          setSelectedCustomer(initialData.customerId);
          setSelectedPet(initialData.petId);
          setSelectedService(initialData.serviceId);
          setStartDate(new Date(initialData.startDate));
          setEndDate(new Date(initialData.endDate));
          // Load pets for the selected customer
          if (initialData.customerId) {
            const petsResponse = await petService.getPetsByCustomer(initialData.customerId);
            setPets(petsResponse.data || []);
          }
        }
      } catch (err) {
        setError('Failed to load initial data');
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [initialData]);

  const handleCustomerChange = async (event: SelectChangeEvent<string>) => {
    const customerId = event.target.value;
    setSelectedCustomer(customerId);
    setSelectedPet(''); // Reset pet selection when customer changes
    
    if (customerId) {
      try {
        const petsResponse = await petService.getPetsByCustomer(customerId);
        setPets(petsResponse.data || []);
      } catch (err) {
        setError('Failed to load customer pets');
        console.error('Error loading customer pets:', err);
      }
    } else {
      setPets([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    // Validate all required fields
    if (!selectedCustomer || !selectedPet || !selectedService || !startDate || !endDate) {
      setError('Please fill in all required fields');
      console.error('Missing required fields:', {
        customer: selectedCustomer,
        pet: selectedPet,
        service: selectedService,
        startDate,
        endDate
      });
      return;
    }

    if (endDate < startDate) {
      setError('End date must be after start date');
      return;
    }

    // Create the reservation data with all required fields
    const formData = {
      customerId: selectedCustomer,
      petId: selectedPet,
      serviceId: selectedService,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status: 'PENDING' as const,
      notes: '', // Add empty notes as it's expected by the backend
    };

    try {
      console.log('Submitting reservation data:', formData);
      await onSubmit(formData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create reservation';
      setError(errorMessage);
      console.error('Error creating reservation:', err.response?.data || err);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <FormControl fullWidth>
            <InputLabel>Customer</InputLabel>
            <Select
              value={selectedCustomer}
              label="Customer"
              onChange={handleCustomerChange}
              required
            >
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Pet</InputLabel>
            <Select
              value={selectedPet}
              label="Pet"
              onChange={(e) => setSelectedPet(e.target.value)}
              required
              disabled={!selectedCustomer}
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  {pet.name} ({pet.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Service</InputLabel>
            <Select
              value={selectedService}
              label="Service"
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <DateTimePicker
            label="Start Date & Time"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
          />

          <DateTimePicker
            label="End Date & Time"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            slotProps={{ textField: { fullWidth: true } }}
            minDateTime={startDate || undefined}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {initialData ? 'Update Reservation' : 'Create Reservation'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

export default ReservationForm;
