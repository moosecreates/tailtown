import React from 'react';
import { Paper, Box, Typography, CircularProgress } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: number | string | React.ReactNode | null;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

/**
 * MetricCard - Displays a single metric with icon and optional click handler
 * Used on the Dashboard to show key business metrics
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  onClick,
  isActive = false,
  isLoading = false
}) => {
  const displayValue = isLoading || value === null 
    ? <CircularProgress size={20} /> 
    : value;

  return (
    <Paper
      elevation={2}
      onClick={onClick}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        height: 100,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isActive ? 1 : 0.9,
        border: isActive ? 2 : 0,
        borderColor: isActive ? 'primary.main' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        } : {}
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" component="div" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
          {title}
        </Typography>
        <Box sx={{ transform: 'scale(0.8)' }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', mt: 'auto' }}>
        {displayValue}
      </Typography>
    </Paper>
  );
};

export default MetricCard;
