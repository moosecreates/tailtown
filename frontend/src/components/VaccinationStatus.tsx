import React from 'react';
import {
  Box,
  FormControl,
  TextField,
  Typography,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';

interface VaccineInfo {
  status: 'CURRENT' | 'EXPIRED' | 'PENDING';
  lastGiven?: string;
  notes?: string;
}

interface VaccineExpirations {
  [key: string]: string; // ISO date string
}

interface VaccinationStatusProps {
  vaccinationStatus: { [key: string]: VaccineInfo } | undefined;
  vaccineExpirations: VaccineExpirations | undefined;
  onVaccinationStatusChange: (key: string, value: VaccineInfo) => void;
  onVaccineExpirationChange: (key: string, value: string) => void;
}

const VACCINE_TYPES = [
  'Rabies',
  'DHPP',
  'Bordetella',
  'FVRCP',
  'Lepto',
  'Influenza',
];

export const VaccinationStatus: React.FC<VaccinationStatusProps> = ({
  vaccinationStatus,
  vaccineExpirations,
  onVaccinationStatusChange,
  onVaccineExpirationChange,
}) => {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h6" gutterBottom>
        Vaccination Status
      </Typography>
      {VACCINE_TYPES.map((vaccineType) => (
        <Box
          key={vaccineType}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Typography variant="subtitle1">{vaccineType}</Typography>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={(vaccinationStatus && vaccinationStatus[vaccineType]?.status) || 'PENDING'}
              label="Status"
              onChange={(e) =>
                onVaccinationStatusChange(vaccineType, {
                  ...(vaccinationStatus?.[vaccineType] || {}),
                  status: e.target.value as 'CURRENT' | 'EXPIRED' | 'PENDING',
                })
              }
            >
              <MenuItem value="CURRENT">Current</MenuItem>
              <MenuItem value="EXPIRED">Expired</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Expiration Date"
            type="date"
            value={(vaccineExpirations && vaccineExpirations[vaccineType]?.split('T')[0]) || ''}
            onChange={(e) => {
              if (e.target.value) {
                onVaccineExpirationChange(
                  vaccineType,
                  new Date(e.target.value).toISOString()
                );
              }
            }}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
          />
        </Box>
      ))}
    </Box>
  );
};

export default VaccinationStatus;
