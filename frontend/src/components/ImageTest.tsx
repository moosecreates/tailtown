import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

const ImageTest = () => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    // Get the URL from Prisma Studio and set it here
    const testUrl = '/uploads/pets/pet-1744685553244-883005399.jpg';
    setImageUrl(`http://localhost:3002${testUrl}`);
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Image Test</Typography>
      <Typography>Testing URL: {imageUrl}</Typography>
      <Box sx={{ mt: 2 }}>
        <img 
          src={imageUrl} 
          alt="Test"
          style={{ maxWidth: '200px', border: '1px solid #ccc' }}
          onError={(e) => {
            console.error('Error loading image in test component');
            const target = e.target as HTMLImageElement;
            target.style.border = '2px solid red';
          }}
          onLoad={() => {
            console.log('Image loaded successfully in test component');
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageTest;
