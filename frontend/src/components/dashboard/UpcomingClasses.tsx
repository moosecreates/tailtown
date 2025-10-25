import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Box,
  LinearProgress,
} from '@mui/material';
import { School as TrainingIcon, ArrowForward as ViewAllIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import schedulingService from '../../services/schedulingService';
import { TrainingClass } from '../../types/scheduling';

const UpcomingClasses: React.FC = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await schedulingService.trainingClasses.getAll({
        status: 'SCHEDULED',
        isActive: true,
      });
      
      // Sort by start date and take first 5
      const sorted = data
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5);
      
      setClasses(sorted);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEnrollmentPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardHeader
        avatar={<TrainingIcon color="primary" />}
        title="Upcoming Training Classes"
        subheader="Active classes"
        action={
          <Button
            size="small"
            endIcon={<ViewAllIcon />}
            onClick={() => navigate('/training/classes')}
          >
            View All
          </Button>
        }
      />
      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : classes.length === 0 ? (
          <Typography color="textSecondary" align="center" py={3}>
            No upcoming classes
          </Typography>
        ) : (
          <List>
            {classes.map((trainingClass) => {
              const enrollmentPercentage = getEnrollmentPercentage(
                trainingClass.currentEnrolled,
                trainingClass.maxCapacity
              );
              
              return (
                <ListItem
                  key={trainingClass.id}
                  sx={{
                    borderLeft: 3,
                    borderColor: 'primary.main',
                    mb: 1,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body1" fontWeight="medium">
                          {trainingClass.name}
                        </Typography>
                        <Chip label={trainingClass.level} size="small" color="primary" variant="outlined" />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          Starts: {format(new Date(trainingClass.startDate), 'MMM dd, yyyy')}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          {trainingClass.totalWeeks} weeks • {trainingClass.category}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="textSecondary">
                          {trainingClass.startTime} - {trainingClass.endTime}
                        </Typography>
                      </>
                    }
                  />
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="caption" color="textSecondary">
                        Enrollment
                      </Typography>
                      <Typography variant="caption" fontWeight="medium">
                        {trainingClass.currentEnrolled} / {trainingClass.maxCapacity}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={enrollmentPercentage}
                      color={getEnrollmentColor(enrollmentPercentage)}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    {trainingClass._count?.waitlist && trainingClass._count.waitlist > 0 && (
                      <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
                        +{trainingClass._count.waitlist} on waitlist
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingClasses;
