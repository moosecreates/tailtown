import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Paper,
} from '@mui/material';

interface EmojiPetIconSelectorProps {
  selectedIcons: string[];
  onChange: (selectedIcons: string[]) => void;
}

// Available emoji icons for pets
const AVAILABLE_EMOJIS = [
  '😊', '😟', '⚡', '😌', '🎾', '💊', '🥗', '👴', '🤧', '⭐',
  '🔄', '🆕', '🎓', '😰', '🍖', '🏃', '❤️', '🐕', '🐈', '🎯',
  '🦴', '🎈', '🌟', '💤', '🏥', '💉', '🩺', '🦷', '👁️', '👂',
  '🐾', '🎀', '🧸', '🎪', '🏆', '🥇', '🎁', '🌈', '☀️', '🌙'
];

/**
 * Simple emoji selector for pet icons
 * Works with emoji strings directly (not icon IDs)
 */
const EmojiPetIconSelector: React.FC<EmojiPetIconSelectorProps> = ({ 
  selectedIcons, 
  onChange 
}) => {
  const handleIconToggle = (emoji: string) => {
    if (selectedIcons.includes(emoji)) {
      onChange(selectedIcons.filter(e => e !== emoji));
    } else {
      onChange([...selectedIcons, emoji]);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pet Icons
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select emoji icons that apply to this pet. Click to add or remove.
      </Typography>

      {/* Selected Icons Display */}
      {selectedIcons.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected ({selectedIcons.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selectedIcons.map((emoji, index) => (
              <Chip
                key={`selected-${emoji}-${index}`}
                label={emoji}
                onDelete={() => handleIconToggle(emoji)}
                color="primary"
                sx={{ fontSize: '1.2rem' }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Available Icons Grid */}
      <Typography variant="subtitle2" gutterBottom>
        Available Icons:
      </Typography>
      <Grid container spacing={1}>
        {AVAILABLE_EMOJIS.map((emoji) => {
          const isSelected = selectedIcons.includes(emoji);
          return (
            <Grid item key={emoji}>
              <Chip
                label={emoji}
                onClick={() => handleIconToggle(emoji)}
                color={isSelected ? "primary" : "default"}
                variant={isSelected ? "filled" : "outlined"}
                sx={{
                  fontSize: '1.5rem',
                  minWidth: '48px',
                  height: '48px',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s'
                  }
                }}
              />
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default EmojiPetIconSelector;
