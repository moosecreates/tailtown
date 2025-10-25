import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
  People as EnrollmentsIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  List as SessionsIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import schedulingService from '../../services/schedulingService';
import {
  TrainingClass,
  CreateTrainingClassRequest,
} from '../../types/scheduling';

const TrainingClasses: React.FC = () => {
  const [classes, setClasses] = useState<TrainingClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<TrainingClass | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState<CreateTrainingClassRequest>({
    name: '',
    description: '',
    level: 'BEGINNER',
    category: 'OBEDIENCE',
    instructorId: '',
    maxCapacity: 8,
    startDate: new Date(),
    totalWeeks: 6,
    daysOfWeek: [1], // Monday
    startTime: '18:00',
    endTime: '19:00',
    pricePerSeries: 200,
    notes: '',
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    level: '',
    isActive: true,
  });

  useEffect(() => {
    loadClasses();
  }, [filters]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await schedulingService.trainingClasses.getAll(filters);
      setClasses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load training classes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (trainingClass?: TrainingClass) => {
    if (trainingClass) {
      setEditingClass(trainingClass);
      setFormData({
        name: trainingClass.name,
        description: trainingClass.description || '',
        level: trainingClass.level,
        category: trainingClass.category,
        instructorId: trainingClass.instructorId,
        maxCapacity: trainingClass.maxCapacity,
        startDate: new Date(trainingClass.startDate),
        totalWeeks: trainingClass.totalWeeks,
        daysOfWeek: trainingClass.daysOfWeek,
        startTime: trainingClass.startTime,
        endTime: trainingClass.endTime,
        pricePerSeries: trainingClass.pricePerSeries,
        pricePerSession: trainingClass.pricePerSession,
        depositRequired: trainingClass.depositRequired,
        minAge: trainingClass.minAge,
        maxAge: trainingClass.maxAge,
        prerequisites: trainingClass.prerequisites,
        notes: trainingClass.notes || '',
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        description: '',
        level: 'BEGINNER',
        category: 'OBEDIENCE',
        instructorId: '',
        maxCapacity: 8,
        startDate: new Date(),
        totalWeeks: 6,
        daysOfWeek: [1],
        startTime: '18:00',
        endTime: '19:00',
        pricePerSeries: 200,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  const handleSave = async () => {
    try {
      if (editingClass) {
        await schedulingService.trainingClasses.update(editingClass.id, formData as any);
      } else {
        await schedulingService.trainingClasses.create(formData);
      }
      await loadClasses();
      handleCloseDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save training class');
    }
  };

  const handleDuplicate = async (id: string) => {
    const startDate = prompt('Enter start date for new class (YYYY-MM-DD):');
    if (startDate) {
      try {
        await schedulingService.trainingClasses.duplicate(id, startDate);
        await loadClasses();
      } catch (err: any) {
        setError(err.message || 'Failed to duplicate class');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this training class?')) {
      try {
        await schedulingService.trainingClasses.delete(id);
        await loadClasses();
      } catch (err: any) {
        setError(err.message || 'Failed to delete class');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'IN_PROGRESS':
        return 'warning';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'success';
      case 'INTERMEDIATE':
        return 'warning';
      case 'ADVANCED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[day];
  };

  if (loading && classes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Training Classes</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          New Class
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                label="Category"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PUPPY">Puppy</MenuItem>
                <MenuItem value="OBEDIENCE">Obedience</MenuItem>
                <MenuItem value="AGILITY">Agility</MenuItem>
                <MenuItem value="BEHAVIOR">Behavior</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                label="Level"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="BEGINNER">Beginner</MenuItem>
                <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                <MenuItem value="ADVANCED">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              onClick={() => setFilters({ status: '', category: '', level: '', isActive: true })}
              fullWidth
              sx={{ height: '56px' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Class Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Enrollment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary" py={4}>
                      No training classes found. Click "New Class" to create one.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((trainingClass) => (
                  <TableRow key={trainingClass.id}>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {trainingClass.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {trainingClass.totalWeeks} weeks • ${trainingClass.pricePerSeries}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={trainingClass.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trainingClass.level}
                        size="small"
                        color={getLevelColor(trainingClass.level)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {trainingClass.daysOfWeek.map(getDayName).join(', ')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {trainingClass.startTime} - {trainingClass.endTime}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {trainingClass.instructor
                        ? `${trainingClass.instructor.firstName} ${trainingClass.instructor.lastName}`
                        : 'TBD'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {trainingClass.currentEnrolled} / {trainingClass.maxCapacity}
                      </Typography>
                      {trainingClass._count?.waitlist && trainingClass._count.waitlist > 0 && (
                        <Typography variant="caption" color="warning.main">
                          +{trainingClass._count.waitlist} waitlist
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trainingClass.status.replace('_', ' ')}
                        color={getStatusColor(trainingClass.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(trainingClass)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicate(trainingClass.id)}
                          color="primary"
                        >
                          <DuplicateIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(trainingClass.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClass ? 'Edit Training Class' : 'New Training Class'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Class Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    label="Category"
                  >
                    <MenuItem value="PUPPY">Puppy</MenuItem>
                    <MenuItem value="OBEDIENCE">Obedience</MenuItem>
                    <MenuItem value="AGILITY">Agility</MenuItem>
                    <MenuItem value="BEHAVIOR">Behavior</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                    label="Level"
                  >
                    <MenuItem value="BEGINNER">Beginner</MenuItem>
                    <MenuItem value="INTERMEDIATE">Intermediate</MenuItem>
                    <MenuItem value="ADVANCED">Advanced</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Max Capacity"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Total Weeks"
                  type="number"
                  value={formData.totalWeeks}
                  onChange={(e) => setFormData({ ...formData, totalWeeks: parseInt(e.target.value) })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date || new Date() })}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Price Per Series"
              type="number"
              value={formData.pricePerSeries}
              onChange={(e) => setFormData({ ...formData, pricePerSeries: parseFloat(e.target.value) })}
              fullWidth
            />

            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />

            {!editingClass && (
              <Alert severity="info">
                Note: Instructor assignment and day selection require additional configuration.
                This simplified form covers the basics.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrainingClasses;
