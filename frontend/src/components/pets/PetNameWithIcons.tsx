import React from 'react';
import { Box, Typography } from '@mui/material';
import PetIconDisplay from './PetIconDisplay';

interface PetNameWithIconsProps {
  petName: string;
  petIcons?: string[];
  iconNotes?: { [iconId: string]: string };
  petType?: 'DOG' | 'CAT' | 'OTHER';
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  nameVariant?: 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'h6';
  nameColor?: string;
  direction?: 'row' | 'column';
  gap?: number;
}

/**
 * Component that displays a pet name with associated icons
 * Used throughout the application for consistent pet identification
 */
const PetNameWithIcons: React.FC<PetNameWithIconsProps> = ({
  petName,
  petIcons = [],
  iconNotes = {},
  petType,
  size = 'small',
  showLabels = false,
  nameVariant = 'body2',
  nameColor,
  direction = 'row',
  gap = 1
}) => {
  console.log(`PetNameWithIcons for ${petName}:`, { petIcons, iconNotes, hasIcons: petIcons && petIcons.length > 0 });
  const hasIcons = petIcons && petIcons.length > 0;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: direction,
        alignItems: direction === 'row' ? 'center' : 'flex-start',
        gap: gap 
      }}
    >
      <Typography 
        variant={nameVariant} 
        color={nameColor}
        sx={{ 
          fontWeight: hasIcons ? 500 : 'normal',
          minWidth: 'fit-content' 
        }}
      >
        {petName}
      </Typography>
      
      {hasIcons && (
        <PetIconDisplay
          iconIds={petIcons}
          size={size}
          showLabels={showLabels}
          customNotes={iconNotes}
        />
      )}
    </Box>
  );
};

export default PetNameWithIcons;
