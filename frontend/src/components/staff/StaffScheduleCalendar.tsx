import React, { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
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
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
  
  // Generate array of days for the week
  const days = useMemo(() => {
    const daysArray = [];
    let day = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      daysArray.push(new Date(day));
      day = addDays(day, 1);
    }
    
    return daysArray;
  }, [startDate]);
  
  // Fetch schedules for the current date range
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
        // Sort staff alphabetically by last name, then first name
        const sortedStaff = allStaff.sort((a, b) => {
          if (a.lastName === b.lastName) {
            return a.firstName.localeCompare(b.firstName);
          }
          return a.lastName.localeCompare(b.lastName);
        });
        setStaff(sortedStaff);
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

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleAddSchedule = (staffMemberId?: string, day?: Date) => {
    setSelectedStaffId(staffMemberId || null);
    setSelectedDay(day || null);
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
  
  // Function to get schedules for a specific staff member and day
  const getSchedulesForStaffAndDay = (staffId: string, day: Date) => {
    return schedules.filter(schedule => 
      schedule.staffId === staffId && isSameDay(new Date(schedule.date), day)
    );
  };

  /**
   * Convert 24-hour time string to 12-hour format with AM/PM
   * @param timeStr Time string in 24-hour format (HH:MM)
   * @returns Formatted time string in 12-hour format with AM/PM
   */
  const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return '';
    
    try {
      // Parse the time (assuming format like "14:00")
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      
      if (isNaN(hour)) return timeStr;
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12; // Convert 0 to 12
      
      return `${hour12}:${minuteStr} ${ampm}`;
    } catch (e) {
      console.error('Error converting time:', e);
      return timeStr;
    }
  };
  
  /**
   * Format the schedule time range for display in 12-hour format
   * @param schedule Staff schedule object
   * @returns Formatted time range string
   */
  const formatScheduleTime = (schedule: StaffSchedule) => {
    const startTime12h = formatTo12Hour(schedule.startTime);
    const endTime12h = formatTo12Hour(schedule.endTime);
    
    return `${startTime12h} - ${endTime12h}`;
  };

  // Render the schedule cell content
  const renderScheduleCell = (staffMember: Staff, day: Date) => {
    // Make sure staffMember.id is a string before passing it to getSchedulesForStaffAndDay
    const staffId = staffMember.id || '';
    const daySchedules = getSchedulesForStaffAndDay(staffId, day);
    
    if (daySchedules.length === 0) {
      return (
        <Box 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            minHeight: '40px',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)'
            }
          }}
          onClick={() => handleAddSchedule(staffId, day)}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>•</Typography>
        </Box>
      );
    }
    
    return (
      <Box sx={{ p: 0.5 }}>
        {daySchedules.map(schedule => (
          <Box 
            key={schedule.id}
            sx={{
              p: 0.5,
              mb: 0.5,
              borderRadius: 1,
              bgcolor: `${getScheduleColor(schedule.status as ScheduleStatus)}80`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem'
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
              {formatScheduleTime(schedule)}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditSchedule(schedule);
                }}
                sx={{ padding: 0.25, ml: 0.5 }}
              >
                <EditIcon fontSize="small" sx={{ fontSize: '0.75rem' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSchedule(schedule.id!);
                }}
                sx={{ padding: 0.25 }}
              >
                <DeleteIcon fontSize="small" sx={{ fontSize: '0.75rem' }} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };
  
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with title, navigation and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {staffId ? 'Staff Schedule' : 'All Staff Schedules'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleAddSchedule()}
            sx={{ mr: 2 }}
          >
            Add Schedule
          </Button>
          <IconButton onClick={handlePreviousWeek} size="small">
            <ArrowBackIcon />
          </IconButton>
          <IconButton onClick={handleToday} size="small" sx={{ mx: 0.5 }}>
            <TodayIcon />
          </IconButton>
          <Typography variant="subtitle2" component="span" sx={{ mx: 1 }}>
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </Typography>
          <IconButton onClick={handleNextWeek} size="small">
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Schedule Table */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
            <Table stickyHeader size="small" sx={{ '& .MuiTableCell-root': { py: 0.5 } }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      minWidth: 150, 
                      position: 'sticky', 
                      left: 0, 
                      zIndex: 3,
                      bgcolor: 'background.paper',
                      borderBottom: '2px solid rgba(224, 224, 224, 1)'
                    }}
                  >
                    Staff Member
                  </TableCell>
                  {days.map((day, index) => (
                    <TableCell 
                      key={index} 
                      align="center"
                      sx={{ 
                        minWidth: 120,
                        bgcolor: isToday(day) ? theme.palette.primary.light + '20' : 
                                 day.getDay() === 0 || day.getDay() === 6 ? '#f5f5f5' : 'background.paper',
                        fontWeight: isToday(day) ? 'bold' : 'normal',
                        color: isToday(day) ? theme.palette.primary.main : 'inherit',
                        borderBottom: '2px solid rgba(224, 224, 224, 1)'
                      }}
                    >
                      <Typography variant="body2">
                        {format(day, 'EEE')}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {format(day, 'MMM d')}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {staff.map((staffMember) => (
                  <TableRow key={staffMember.id} hover>
                    <TableCell 
                      sx={{ 
                        position: 'sticky', 
                        left: 0, 
                        zIndex: 1,
                        bgcolor: 'background.paper',
                        borderRight: '1px solid rgba(224, 224, 224, 0.5)'
                      }}
                    >
                      <Typography variant="body2" fontWeight="medium">
                        {staffMember.lastName}, {staffMember.firstName}
                        {staffMember.position && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {staffMember.position}
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    {days.map((day, index) => (
                      <TableCell 
                        key={index}
                        sx={{ 
                          p: 0.5,
                          bgcolor: isToday(day) ? theme.palette.primary.light + '10' : 
                                   day.getDay() === 0 || day.getDay() === 6 ? '#f5f5f5' : 'inherit',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                        onClick={() => handleAddSchedule(staffMember.id, day)}
                      >
                        {renderScheduleCell(staffMember, day)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      
      {/* Schedule Form Dialog */}
      <StaffScheduleForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        staffId={staffId || selectedStaffId || undefined}
        schedule={selectedSchedule}
        onSave={handleSaveSchedule}
        isEditing={isEditing}
        allStaff={!staffId ? staff : undefined}
        initialDate={selectedDay || undefined}
      />
    </Paper>
  );
};

export default StaffScheduleCalendar;
