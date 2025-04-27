import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Chip,
  Divider,
  SelectChangeEvent
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import staffService, { Staff } from '../../services/staffService';
import { CircularProgress, Alert, Snackbar } from '@mui/material';

// Available roles, departments, and positions
const roles = ['Administrator', 'Manager', 'Staff'];
const departments = ['Management', 'Front Desk', 'Grooming', 'Training', 'Kennel', 'Veterinary'];
const positions = [
  'General Manager',
  'Front Desk Manager',
  'Front Desk Associate',
  'Lead Groomer',
  'Groomer',
  'Dog Trainer',
  'Kennel Manager',
  'Kennel Technician',
  'Veterinarian',
  'Vet Technician'
];

interface FormDataType extends Staff {
  confirmPassword?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Staff | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    position: '',
    status: 'Active',
    hireDate: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleOpenDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        confirmPassword: user.password,
        role: user.role,
        department: user.department,
        position: user.position,
        status: user.status,
        hireDate: user.hireDate,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: '',
        position: '',
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0],
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Load all staff members when component mounts
  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      setLoading(true);
      const staffData = await staffService.getAllStaff();
      setUsers(staffData);
      setError(null);
    } catch (err) {
      console.error('Failed to load staff members:', err);
      setError('Failed to load staff members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async () => {
    // Validate passwords match for new users or when changing password
    if (!editingUser && formData.password !== formData.confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return;
    }

    // Remove confirmPassword from data before saving
    const { confirmPassword, ...dataToSave } = formData;

    try {
      if (editingUser && editingUser.id) {
        // If password is empty, remove it from the data to be sent
        const dataToUpdate = { ...dataToSave };
        if (!dataToUpdate.password) {
          delete dataToUpdate.password;
        }
        
        // Update existing user
        await staffService.updateStaff(editingUser.id, dataToUpdate);
        showSnackbar('Staff member updated successfully', 'success');
      } else {
        // Add new user
        await staffService.createStaff(dataToSave as Staff);
        showSnackbar('Staff member added successfully', 'success');
      }
      
      // Reload staff members to get the updated list
      await loadStaffMembers();
      handleCloseDialog();
    } catch (err) {
      console.error('Error saving staff member:', err);
      showSnackbar('Failed to save staff member. Please try again.', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await staffService.deleteStaff(userId);
      showSnackbar('Staff member deleted successfully', 'success');
      await loadStaffMembers();
    } catch (err) {
      console.error('Error deleting staff member:', err);
      showSnackbar('Failed to delete staff member. Please try again.', 'error');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button 
            component={Link} 
            to="/settings" 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 2 }}
          >
            Back to Settings
          </Button>
          <Typography variant="h4" component="h1">
            User Management
          </Typography>
        </Box>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Employees</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Employee
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No staff members found</TableCell>
                    </TableRow>
                  ) : users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'Administrator' ? 'primary' : 
                            user.role === 'Manager' ? 'secondary' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.position}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={user.status === 'Active' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => user.id ? handleDeleteUser(user.id) : undefined}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          {editingUser ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  required
                />
              </Grid>
            </Grid>

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              size="small"
              margin="dense"
              required
            />

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
            </Grid>

            <Grid container spacing={1}>
              <Grid item xs={4}>
                <TextField
                  name="city"
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="state"
                  label="State"
                  value={formData.state}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="zipCode"
                  label="Zip Code"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>Security</Typography>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <TextField
                  name="password"
                  label={editingUser ? 'New Password' : 'Password'}
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  required={!editingUser}
                  helperText={editingUser ? 'Leave blank to keep current' : ''}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  required={!editingUser}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5 }}>Job Information</Typography>

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    label="Role"
                    onChange={handleSelectChange}
                    required
                  >
                    {roles.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Department</InputLabel>
                  <Select
                    name="department"
                    value={formData.department}
                    label="Department"
                    onChange={handleSelectChange}
                    required
                  >
                    {departments.map(dept => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Position</InputLabel>
                  <Select
                    name="position"
                    value={formData.position}
                    label="Position"
                    onChange={handleSelectChange}
                    required
                  >
                    {positions.map(pos => (
                      <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small" margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="hireDate"
                  label="Hire Date"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  margin="dense"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} size="small">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            size="small"
          >
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;
