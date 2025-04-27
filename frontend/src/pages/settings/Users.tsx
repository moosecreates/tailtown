import React, { useState } from 'react';
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

// Mock data for users
const mockUsers = [
  { 
    id: '1', 
    firstName: 'John', 
    lastName: 'Doe', 
    email: 'john.doe@example.com', 
    password: 'password123', // This would be hashed in a real application
    role: 'Administrator',
    department: 'Management',
    position: 'General Manager',
    status: 'Active',
    hireDate: '2024-01-15'
  },
  { 
    id: '2', 
    firstName: 'Jane', 
    lastName: 'Smith', 
    email: 'jane.smith@example.com', 
    password: 'password123', // This would be hashed in a real application
    role: 'Manager',
    department: 'Front Desk',
    position: 'Front Desk Manager',
    status: 'Active',
    hireDate: '2024-02-10'
  },
  { 
    id: '3', 
    firstName: 'Michael', 
    lastName: 'Johnson', 
    email: 'michael.j@example.com', 
    password: 'password123', // This would be hashed in a real application
    role: 'Staff',
    department: 'Grooming',
    position: 'Lead Groomer',
    status: 'Active',
    hireDate: '2024-03-05'
  },
  { 
    id: '4', 
    firstName: 'Sarah', 
    lastName: 'Williams', 
    email: 'sarah.w@example.com', 
    password: 'password123', // This would be hashed in a real application
    role: 'Staff',
    department: 'Training',
    position: 'Dog Trainer',
    status: 'Active',
    hireDate: '2024-03-15'
  },
  { 
    id: '5', 
    firstName: 'Robert', 
    lastName: 'Brown', 
    email: 'robert.b@example.com', 
    password: 'password123', // This would be hashed in a real application
    role: 'Staff',
    department: 'Kennel',
    position: 'Kennel Technician',
    status: 'Active',
    hireDate: '2024-04-01'
  }
];

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

const Users: React.FC = () => {
  const [users, setUsers] = useState(mockUsers);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    position: '',
    status: 'Active',
    hireDate: ''
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
        hireDate: user.hireDate
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
        hireDate: new Date().toISOString().split('T')[0]
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

  const handleSubmit = () => {
    // Validate passwords match for new users or when changing password
    if (!editingUser && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Remove confirmPassword from data before saving
    const { confirmPassword, ...dataToSave } = formData;

    if (editingUser) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...dataToSave } : user
      );
      setUsers(updatedUsers);
    } else {
      // Add new user
      const newUser = {
        id: (users.length + 1).toString(),
        ...dataToSave
      };
      setUsers([...users, newUser]);
    }
    handleCloseDialog();
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
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
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
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
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Add/Edit User Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="password"
                label={editingUser ? 'Change Password (leave blank to keep current)' : 'Password'}
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required={!editingUser}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required={!editingUser}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
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
            <Grid item xs={12} md={6}>
              <TextField
                name="hireDate"
                label="Hire Date"
                type="date"
                value={formData.hireDate}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
          >
            {editingUser ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;
