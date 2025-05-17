import React from 'react';
import { 
  Box, 
  Tooltip, 
  Paper,
  Typography
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

interface DataQualityIndicatorProps {
  quality: 'high' | 'medium' | 'low';
  lastUpdated?: string;
  showBadge?: boolean;
}

/**
 * Component that displays a data quality indicator with tooltip
 * For consistent data quality presentation across analytics
 */
const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  quality,
  lastUpdated,
  showBadge = true
}) => {
  const formattedDate = lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Unknown';
  
  const getQualityData = () => {
    switch(quality) {
      case 'high':
        return {
          icon: <VerifiedIcon fontSize="small" sx={{ color: 'success.main' }} />,
          label: 'High Quality Data',
          message: 'This data comes from our centralized financial service and has been verified for accuracy.',
          color: 'success.main'
        };
      case 'medium':
        return {
          icon: <InfoIcon fontSize="small" sx={{ color: 'warning.main' }} />,
          label: 'Medium Quality Data',
          message: 'This data is being migrated to our centralized financial service but may still have some inconsistencies.',
          color: 'warning.main'
        };
      case 'low':
        return {
          icon: <WarningIcon fontSize="small" sx={{ color: 'error.main' }} />,
          label: 'Low Quality Data',
          message: 'This data has known inconsistencies and needs to be migrated to our centralized financial service.',
          color: 'error.main'
        };
      default:
        return {
          icon: <InfoIcon fontSize="small" sx={{ color: 'info.main' }} />,
          label: 'Unknown Quality',
          message: 'The quality of this data has not been assessed.',
          color: 'info.main'
        };
    }
  };
  
  const qualityData = getQualityData();
  
  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {qualityData.label}
          </Typography>
          <Typography variant="body2">
            {qualityData.message}
          </Typography>
          <Typography variant="body2" mt={1}>
            Last updated: {formattedDate}
          </Typography>
        </Box>
      }
      arrow
    >
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {qualityData.icon}
        {showBadge && (
          <Paper
            sx={{
              ml: 0.5,
              py: 0.25,
              px: 0.75,
              backgroundColor: quality === 'high' ? 'success.light' : 
                              quality === 'medium' ? 'warning.light' : 'error.light',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              height: 18
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 'bold',
                color: '#fff'
              }}
            >
              {quality.toUpperCase()}
            </Typography>
          </Paper>
        )}
      </Box>
    </Tooltip>
  );
};

export default DataQualityIndicator;
