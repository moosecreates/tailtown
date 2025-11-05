import React, { memo, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import PetIconDisplay from './PetIconDisplay';
import EmojiIconDisplay from '../customers/EmojiIconDisplay';
import ClickableAvatar from './ClickableAvatar';

interface PetNameWithIconsProps {
  petName: string;
  petIcons?: string[];
  iconNotes?: { [iconId: string]: string };
  petType?: 'DOG' | 'CAT' | 'OTHER';
  profilePhoto?: string | null;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  showPhoto?: boolean;
  nameVariant?: 'body1' | 'body2' | 'subtitle1' | 'subtitle2' | 'h6';
  nameColor?: string;
  direction?: 'row' | 'column';
  gap?: number;
}

/**
 * Optimized component that displays a pet name with associated icons
 * Used throughout the application for consistent pet identification
 * Memoized to prevent unnecessary re-renders
 */
const PetNameWithIcons: React.FC<PetNameWithIconsProps> = memo(({
  petName,
  petIcons = [],
  iconNotes = {},
  petType,
  profilePhoto,
  size = 'small',
  showLabels = false,
  showPhoto = true,
  nameVariant = 'body2',
  nameColor,
  direction = 'row',
  gap = 1
}) => {
  const hasIcons = useMemo(() => petIcons && petIcons.length > 0, [petIcons]);
  
  // Memoized size mapping for avatars
  const avatarSize = useMemo(() => {
    const sizeMap = { small: 24, medium: 32, large: 40 };
    return sizeMap[size];
  }, [size]);
  
  // Memoized profile photo URL
  const photoUrl = useMemo(() => {
    return profilePhoto ? `${process.env.REACT_APP_API_URL || 'http://localhost:4004'}${profilePhoto}` : undefined;
  }, [profilePhoto]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: direction,
        alignItems: direction === 'row' ? 'center' : 'flex-start',
        gap: gap 
      }}
    >
      {showPhoto && (
        <ClickableAvatar
          src={photoUrl}
          alt={petName}
          size={avatarSize}
          fontSize={size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem'}
        />
      )}
      
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
        <EmojiIconDisplay
          icons={petIcons}
          size={size === 'large' ? 'medium' : size}
          maxDisplay={5}
        />
      )}
    </Box>
  );
});

PetNameWithIcons.displayName = 'PetNameWithIcons';

export default PetNameWithIcons;
