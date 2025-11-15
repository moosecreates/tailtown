import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as TaskIcon,
  Pets as PetIcon,
  People as StaffIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { MobileHeader } from '../../components/mobile/MobileHeader';
import mobileService, { DashboardData } from '../../services/mobileService';
import { useAuth } from '../../contexts/AuthContext';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mobileService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !dashboardData) {
    return (
      <Box>
        <MobileHeader title="Dashboard" showNotifications userName={user?.firstName} />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error && !dashboardData) {
    return (
      <Box>
        <MobileHeader title="Dashboard" showNotifications userName={user?.firstName} />
        <Box sx={{ p: 2 }}>
          <Alert severity="error" action={
            <Chip label="Retry" size="small" onClick={handleRefresh} />
          }>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  const stats = dashboardData?.stats || { petsInFacility: 0, staffOnDuty: 0, tasksCompleted: 0, totalTasks: 0 };
  const todaySchedule = dashboardData?.todaySchedule || [];
  const pendingTasks = dashboardData?.pendingTasks || [];

  return (
    <Box>
      <MobileHeader
        title="Dashboard"
        showNotifications
        notificationCount={dashboardData?.unreadMessages || 0}
        userName={user?.firstName || 'Staff'}
      />

      <Box sx={{ p: 2 }}>
        {/* Quick Stats */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <PetIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {stats.petsInFacility}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pets in Facility
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6}>
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'success.light',
                    width: 48,
                    height: 48,
                    mx: 'auto',
                    mb: 1,
                  }}
                >
                  <StaffIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">
                  {stats.staffOnDuty}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Staff on Duty
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={1}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TaskIcon sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Tasks Progress
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h6">
                    {stats.tasksCompleted}/{stats.totalTasks}
                  </Typography>
                  <Chip
                    label={`${Math.round((stats.tasksCompleted / stats.totalTasks) * 100)}%`}
                    size="small"
                    color="warning"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Today's Schedule */}
        <Card elevation={1} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Today's Schedule
              </Typography>
            </Box>
            <List disablePadding>
              {todaySchedule.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                        {item.time.split(':')[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={item.location}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                  {index < todaySchedule.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card elevation={1}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TaskIcon sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Pending Tasks
              </Typography>
            </Box>
            <List disablePadding>
              {pendingTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemText
                      primary={task.title}
                      secondary={`${task.completed}/${task.total} completed`}
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Chip
                      label="View"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </ListItem>
                  {index < pendingTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default MobileDashboard;
