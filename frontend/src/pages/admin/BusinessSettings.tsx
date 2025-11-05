/**
 * Business Settings Page
 * 
 * Allows tenants to customize their business settings including logo upload
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface BusinessSettings {
  logoUrl?: string;
}

const BusinessSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Use dynamic API URL based on environment
  const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
      return window.location.origin;
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:4004';
  };
  const API_URL = getApiUrl();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/business-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        if (data.logoUrl) {
          setLogoPreview(data.logoUrl);
        }
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`${API_URL}/api/business-settings/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload logo');
      }

      const data = await response.json();
      setSettings({ ...settings, logoUrl: data.logoUrl });
      setLogoPreview(data.logoUrl);
      // Update localStorage cache
      localStorage.setItem('businessLogo', `${API_URL}${data.logoUrl}`);
      setSuccess('Logo uploaded successfully! Refresh the page to see it in the header.');
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your logo?')) {
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/business-settings/logo`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete logo');
      }

      setSettings({ ...settings, logoUrl: undefined });
      setLogoPreview(null);
      // Clear localStorage cache
      localStorage.removeItem('businessLogo');
      setSuccess('Logo removed successfully! Refresh the page to see the default logo.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Business Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your business appearance and settings
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardHeader title="Business Logo" />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Upload your business logo to display in the application header. Recommended size: 200x200px. Max file size: 2MB.
          </Typography>

          {logoPreview && (
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Current Logo:
              </Typography>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  bgcolor: 'background.paper'
                }}
              >
                <img
                  src={logoPreview}
                  alt="Business Logo"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              </Box>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<UploadIcon />}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : logoPreview ? 'Replace Logo' : 'Upload Logo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </Button>

            {logoPreview && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleLogoDelete}
                disabled={uploading}
              >
                Remove Logo
              </Button>
            )}
          </Box>

          {!logoPreview && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No custom logo uploaded. The default Tailtown logo will be displayed.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default BusinessSettings;
