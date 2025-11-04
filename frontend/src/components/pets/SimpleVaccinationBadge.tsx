import React from 'react';
import {
  Chip,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { Pet } from '../../services/petService';

interface SimpleVaccinationBadgeProps {
  pet: Pet;
  showDetails?: boolean;
}

/**
 * Simple vaccination badge that uses pet's actual vaccination data
 * instead of making external API calls
 */
const SimpleVaccinationBadge: React.FC<SimpleVaccinationBadgeProps> = ({
  pet,
  showDetails = false,
}) => {
  // Get required vaccines based on pet type
  const getRequiredVaccines = (petType: string) => {
    switch (petType) {
      case 'DOG':
        return ['rabies', 'dhpp', 'bordetella'];
      case 'CAT':
        return ['rabies', 'fvrcp'];
      default:
        return ['rabies'];
    }
  };

  const requiredVaccines = getRequiredVaccines(pet.type || 'DOG');
  
  // Count vaccination status
  let expiredCount = 0;
  let missingCount = 0;
  let currentCount = 0;

  requiredVaccines.forEach(vaccine => {
    const vaccineRecord = pet.vaccinationStatus?.[vaccine];
    if (!vaccineRecord) {
      missingCount++;
    } else if (vaccineRecord.status === 'EXPIRED') {
      expiredCount++;
    } else if (vaccineRecord.status === 'CURRENT') {
      currentCount++;
    } else {
      missingCount++;
    }
  });

  // Determine status and color - only based on expired vaccines
  const getStatusColor = () => {
    if (expiredCount === 0) return 'success';
    return 'error';
  };

  const getStatusIcon = () => {
    if (expiredCount === 0) return <CheckIcon />;
    return <ErrorIcon />;
  };

  const getStatusLabel = () => {
    // Only show expired count, not missing/due
    if (expiredCount === 0) return 'Current';
    if (expiredCount === 1) return '1 Expired';
    return `${expiredCount} Expired`;
  };

  const getTooltipText = () => {
    const parts = [];
    if (expiredCount > 0) parts.push(`${expiredCount} expired`);
    if (missingCount > 0) parts.push(`${missingCount} due`);
    if (currentCount > 0) parts.push(`${currentCount} current`);
    
    if (parts.length === 0) {
      return 'All required vaccines are current';
    }
    return `Vaccine status: ${parts.join(', ')}`;
  };

  // Get detailed vaccine info for tooltip
  const getDetailedTooltip = () => {
    const vaccineDetails: string[] = [];
    
    requiredVaccines.forEach(vaccine => {
      const vaccineRecord = pet.vaccinationStatus?.[vaccine] as any;
      const vaccineName = vaccine.charAt(0).toUpperCase() + vaccine.slice(1);
      
      if (!vaccineRecord) {
        vaccineDetails.push(`${vaccineName}: Missing`);
      } else if (vaccineRecord.status === 'EXPIRED') {
        const expiredDate = vaccineRecord.expiration ? 
          new Date(vaccineRecord.expiration).toLocaleDateString() : 'Unknown';
        vaccineDetails.push(`${vaccineName}: Expired (${expiredDate})`);
      } else if (vaccineRecord.status === 'CURRENT') {
        const expireDate = vaccineRecord.expiration ? 
          new Date(vaccineRecord.expiration).toLocaleDateString() : 'Unknown';
        vaccineDetails.push(`${vaccineName}: Current (expires ${expireDate})`);
      }
    });
    
    return vaccineDetails.join('\n');
  };

  return (
    <Tooltip title={showDetails ? getDetailedTooltip() : getTooltipText()}>
      <Chip
        icon={getStatusIcon()}
        label={getStatusLabel()}
        size="small"
        color={getStatusColor()}
        variant="outlined"
        sx={{ fontSize: '0.7rem', height: '20px' }}
      />
    </Tooltip>
  );
};

export default SimpleVaccinationBadge;
