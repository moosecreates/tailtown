/**
 * Quick Report Card Creator
 * 
 * Mobile-first component for quickly creating report cards with photos
 */

import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Rating,
  Chip,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  Send,
  Save,
  Close
} from '@mui/icons-material';
import { reportCardService, CreateReportCardRequest } from '../../services/reportCardService';

interface QuickReportCardProps {
  petId?: string;
  customerId?: string;
  reservationId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const QuickReportCard: React.FC<QuickReportCardProps> = ({
  petId: initialPetId,
  customerId: initialCustomerId,
  reservationId,
  onSuccess,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [petId, setPetId] = useState(initialPetId || '');
  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [serviceType, setServiceType] = useState<'BOARDING' | 'DAYCARE' | 'GROOMING' | 'TRAINING' | 'GENERAL'>('DAYCARE');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [moodRating, setMoodRating] = useState<number>(4);
  const [energyRating, setEnergyRating] = useState<number>(4);
  const [appetiteRating, setAppetiteRating] = useState<number>(4);
  const [socialRating, setSocialRating] = useState<number>(4);
  const [activities, setActivities] = useState<string[]>([]);
  const [activityInput, setActivityInput] = useState('');
  const [behaviorNotes, setBehaviorNotes] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [highlightInput, setHighlightInput] = useState('');

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: File[] = [];
    const newPreviews: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Compress image
      try {
        const compressed = await reportCardService.compressImage(file);
        newPhotos.push(compressed);
        newPreviews.push(URL.createObjectURL(compressed));
      } catch (err) {
        console.error('Failed to compress image:', err);
        newPhotos.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setPhotos([...photos, ...newPhotos]);
    setPhotoPreview([...photoPreview, ...newPreviews]);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = photoPreview.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoPreview(newPreviews);
  };

  const handleAddActivity = () => {
    if (activityInput.trim()) {
      setActivities([...activities, activityInput.trim()]);
      setActivityInput('');
    }
  };

  const handleRemoveActivity = (index: number) => {
    setActivities(activities.filter((_, i) => i !== index));
  };

  const handleAddHighlight = () => {
    if (highlightInput.trim()) {
      setHighlights([...highlights, highlightInput.trim()]);
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleSave = async (sendNow: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!petId || !customerId) {
        setError('Pet and Customer are required');
        return;
      }

      // Create report card
      const reportData: CreateReportCardRequest = {
        petId,
        customerId,
        reservationId,
        serviceType,
        title: title || undefined,
        summary: summary || undefined,
        moodRating,
        energyRating,
        appetiteRating,
        socialRating,
        activities,
        behaviorNotes: behaviorNotes || undefined,
        highlights
      };

      const reportCard = await reportCardService.createReportCard(reportData);

      // Upload photos
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const uploadResult = await reportCardService.uploadFile(file);
        
        await reportCardService.uploadPhoto(reportCard.id, {
          url: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          order: i,
          mimeType: file.type,
          fileSize: file.size
        });
      }

      // Send if requested
      if (sendNow) {
        await reportCardService.sendReportCard(reportCard.id, {
          sendEmail: true,
          sendSMS: true
        });
      }

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create report card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Create Report Card</Typography>
          {onCancel && (
            <IconButton onClick={onCancel} size="small">
              <Close />
            </IconButton>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack spacing={3}>
          {/* Service Type */}
          <TextField
            select
            label="Service Type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="DAYCARE">Daycare</MenuItem>
            <MenuItem value="BOARDING">Boarding</MenuItem>
            <MenuItem value="GROOMING">Grooming</MenuItem>
            <MenuItem value="TRAINING">Training</MenuItem>
            <MenuItem value="GENERAL">General</MenuItem>
          </TextField>

          {/* Photos */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Photos ({photos.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PhotoCamera />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ mb: 2 }}
            >
              Take Photo / Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotoCapture}
            />

            {photoPreview.length > 0 && (
              <ImageList cols={3} gap={8}>
                {photoPreview.map((preview, index) => (
                  <ImageListItem key={index}>
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      loading="lazy"
                      style={{ height: 120, objectFit: 'cover' }}
                    />
                    <ImageListItemBar
                      actionIcon={
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleRemovePhoto(index)}
                        >
                          <Delete />
                        </IconButton>
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>

          <Divider />

          {/* Ratings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              How was their day?
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Mood {reportCardService.getRatingEmoji(moodRating)}
              </Typography>
              <Rating
                value={moodRating}
                onChange={(_, value) => setMoodRating(value || 3)}
                size="large"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Energy Level ⚡
              </Typography>
              <Rating
                value={energyRating}
                onChange={(_, value) => setEnergyRating(value || 3)}
                size="large"
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Appetite 🍖
              </Typography>
              <Rating
                value={appetiteRating}
                onChange={(_, value) => setAppetiteRating(value || 3)}
                size="large"
              />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Social Behavior 👥
              </Typography>
              <Rating
                value={socialRating}
                onChange={(_, value) => setSocialRating(value || 3)}
                size="large"
              />
            </Box>
          </Box>

          <Divider />

          {/* Quick Notes */}
          <TextField
            label="Quick Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            multiline
            rows={2}
            placeholder="Had a great day playing with friends!"
            fullWidth
          />

          {/* Activities */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Activities
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={activityInput}
                onChange={(e) => setActivityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddActivity()}
                placeholder="e.g., Played fetch"
                fullWidth
              />
              <Button onClick={handleAddActivity} variant="outlined">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activities.map((activity, index) => (
                <Chip
                  key={index}
                  label={activity}
                  onDelete={() => handleRemoveActivity(index)}
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Highlights */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Highlights ⭐
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddHighlight()}
                placeholder="e.g., Made a new friend!"
                fullWidth
              />
              <Button onClick={handleAddHighlight} variant="outlined">
                Add
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {highlights.map((highlight, index) => (
                <Chip
                  key={index}
                  label={highlight}
                  onDelete={() => handleRemoveHighlight(index)}
                  color="primary"
                  size="small"
                />
              ))}
            </Box>
          </Box>

          {/* Detailed Notes */}
          <TextField
            label="Detailed Notes (Optional)"
            value={behaviorNotes}
            onChange={(e) => setBehaviorNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Any additional observations..."
            fullWidth
          />

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={20} /> : <Save />}
              onClick={() => handleSave(false)}
              disabled={loading}
              fullWidth
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              onClick={() => handleSave(true)}
              disabled={loading}
              fullWidth
            >
              Send Now
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default QuickReportCard;
