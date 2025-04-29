import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Grid,
  Tooltip,
  Chip,
  useTheme
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import staffService, { StaffSchedule, Staff, ScheduleStatus } from '../../services/staffService';
import StaffScheduleForm from './StaffScheduleForm';

interface StaffScheduleCalendarProps {
  staffId?: string; // If provided, show only schedules for this staff member
}

const StaffScheduleCalendar: React.FC<StaffScheduleCalendarProps> = ({ staffId }) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<StaffSchedule[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<StaffSchedule | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      let fetchedSchedules;
      if (staffId) {
        fetchedSchedules = await staffService.getStaffSchedules(
          staffId,
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );
      } else {
        fetchedSchedules = await staffService.getAllSchedules(
          format(startDate, 'yyyy-MM-dd'),
          format(endDate, 'yyyy-MM-dd')
        );
      }
      setSchedules(fetchedSchedules);
      
      if (!staffId) {
        // Fetch all staff for the dropdown
        const allStaff = await staffService.getAllStaff();
        setStaff(allStaff);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSchedules();
  }, [currentDate, staffId]);
  
  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handleAddSchedule = () => {
    setSelectedSchedule(undefined);
    setIsEditing(false);
    setOpenForm(true);
  };
  
  const handleEditSchedule = (schedule: StaffSchedule) => {
    setSelectedSchedule(schedule);
    setIsEditing(true);
    setOpenForm(true);
  };
  
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await staffService.deleteStaffSchedule(scheduleId);
        fetchSchedules(); // Refresh schedules after deletion
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };
  
  const handleSaveSchedule = async (scheduleData: StaffSchedule) => {
    try {
      if (isEditing && selectedSchedule?.id) {
        await staffService.updateStaffSchedule(selectedSchedule.id, scheduleData);
      } else {
        const targetStaffId = staffId || scheduleData.staffId;
        if (targetStaffId) {
          await staffService.createStaffSchedule(targetStaffId, scheduleData);
        }
      }
      setOpenForm(false);
      fetchSchedules(); // Refresh schedules after save
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };
  
  const getScheduleColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return theme.palette.info.light;
      case ScheduleStatus.CONFIRMED:
        return theme.palette.success.light;
      case ScheduleStatus.IN_PROGRESS:
        return theme.palette.warning.light;
      case ScheduleStatus.COMPLETED:
        return theme.palette.success.main;
      case ScheduleStatus.CANCELLED:
        return theme.palette.error.light;
      case ScheduleStatus.NO_SHOW:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[300];
    }
  };
  
  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? `${staffMember.firstName} ${staffMember.lastName}` : 'Unknown';
  };
  
  const renderDays = () => {
    const days = [];
    let day = startDate;
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <Box key={i} sx={{ flex: 1, p: 1, borderRight: i < 6 ? 1 : 0, borderColor: 'divider' }}>
          <Typography variant="subtitle1" align="center" fontWeight="bold">
            {format(day, 'EEEE')}
          </Typography>
          <Typography variant="body2" align="center">
            {format(day, 'MMM d')}
          </Typography>
          {renderSchedulesForDay(day)}
        </Box>
      );
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  const renderSchedulesForDay = (day: Date) => {
    const daySchedules = schedules.filter(schedule => 
      isSameDay(new Date(schedule.date), day)
    );
    
    return (
      <Box sx={{ mt: 1, minHeight: '150px' }}>
        {daySchedules.map(schedule => (
          <Paper
            key={schedule.id}
            elevation={1}
            sx={{
              p: 1,
              mb: 1,
              backgroundColor: getScheduleColor(schedule.status as ScheduleStatus),
              position: 'relative'
            }}
          >
            {!staffId && (
              <Typography variant="subtitle2" fontWeight="bold">
                {getStaffName(schedule.staffId)}
              </Typography>
            )}
            <Typography variant="body2">
              {schedule.startTime} - {schedule.endTime}
            </Typography>
            {schedule.location && (
              <Typography variant="body2" noWrap>
                {schedule.location}
              </Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Chip
                label={schedule.status?.replace('_', ' ')}
                size="small"
                sx={{ fontSize: '0.7rem' }}
              />
              <Box>
                <IconButton
                  size="small"
                  onClick={() => handleEditSchedule(schedule)}
                  sx={{ padding: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSchedule(schedule.id!)}
                  sx={{ padding: 0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {staffId ? 'Staff Schedule' : 'All Staff Schedules'}
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddSchedule}
            sx={{ mr: 2 }}
          >
            Add Schedule
          </Button>
          <IconButton onClick={handlePreviousWeek}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" component="span" sx={{ mx: 1 }}>
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek}>
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', height: 'calc(100% - 60px)', border: 1, borderColor: 'divider' }}>
        {renderDays()}
      </Box>
      
      <StaffScheduleForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        staffId={staffId}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        isEditing={isEditing}
        allStaff={!staffId ? staff : undefined}
      />
    </Paper>
  );
};

export default StaffScheduleCalendar;
