/**
 * Tenant Management Page
 * 
 * Super admin interface for managing all tenant accounts.
 * Features: list, create, clone, update flags, suspend/delete.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CloneIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import TenantStatusManager from '../../components/super-admin/TenantStatusManager';

interface Tenant {
  id: string;
  businessName: string;
  subdomain: string;
  contactEmail: string;
  contactName: string;
  status: string;
  isActive: boolean;
  isPaused: boolean;
  isProduction: boolean;
  isTemplate: boolean;
  gingrSyncEnabled: boolean;
  lastGingrSyncAt: string | null;
  clonedFromId: string | null;
  planType: string;
  employeeCount: number;
  customerCount: number;
  reservationCount: number;
  createdAt: string;
  suspendedAt: string | null;
  deletedAt: string | null;
}

const TenantManagement: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productionFilter, setProductionFilter] = useState('ALL');
  const [templateFilter, setTemplateFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    businessName: '',
    subdomain: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    isProduction: false,
    isTemplate: false,
    gingrSyncEnabled: false,
    planType: 'STARTER'
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4004';

  const loadTenants = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (productionFilter !== 'ALL') params.append('isProduction', productionFilter);
      if (templateFilter !== 'ALL') params.append('isTemplate', templateFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`${API_URL}/api/super-admin/tenants?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superAdminAccessToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to load tenants');

      const data = await response.json();
      setTenants(data.data.tenants);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, productionFilter, templateFilter, searchTerm, API_URL]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const handleCreateTenant = async () => {
    try {
      setError('');
      const response = await fetch(`${API_URL}/api/super-admin/tenants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminAccessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create tenant');
      }

      setSuccess('Tenant created successfully!');
      setCreateDialogOpen(false);
      resetForm();
      loadTenants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCloneTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      setError('');
      const response = await fetch(`${API_URL}/api/super-admin/tenants/${selectedTenant.id}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminAccessToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to clone tenant');
      }

      setSuccess('Tenant cloned successfully!');
      setCloneDialogOpen(false);
      resetForm();
      loadTenants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTenant = async () => {
    if (!selectedTenant) return;
    
    try {
      setError('');
      const response = await fetch(`${API_URL}/api/super-admin/tenants/${selectedTenant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superAdminAccessToken')}`
        },
        body: JSON.stringify({
          isProduction: formData.isProduction,
          isTemplate: formData.isTemplate,
          gingrSyncEnabled: formData.gingrSyncEnabled
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update tenant');
      }

      setSuccess('Tenant updated successfully!');
      setEditDialogOpen(false);
      resetForm();
      loadTenants();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openCloneDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      ...formData,
      businessName: '',
      subdomain: '',
      contactName: '',
      contactEmail: '',
      contactPhone: ''
    });
    setCloneDialogOpen(true);
  };

  const openEditDialog = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData({
      ...formData,
      isProduction: tenant.isProduction,
      isTemplate: tenant.isTemplate,
      gingrSyncEnabled: tenant.gingrSyncEnabled
    });
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      businessName: '',
      subdomain: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      isProduction: false,
      isTemplate: false,
      gingrSyncEnabled: false,
      planType: 'STARTER'
    });
    setSelectedTenant(null);
  };

  const getStatusColor = (tenant: Tenant) => {
    if (tenant.deletedAt) return 'error';
    if (tenant.suspendedAt) return 'warning';
    if (tenant.isActive) return 'success';
    return 'default';
  };

  const getStatusLabel = (tenant: Tenant) => {
    if (tenant.deletedAt) return 'DELETED';
    if (tenant.suspendedAt) return 'SUSPENDED';
    return tenant.status;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Tenant Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTenants}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Tenant
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Business name, subdomain, email..."
            sx={{ minWidth: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="ALL">All Status</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="TRIAL">Trial</MenuItem>
              <MenuItem value="PAUSED">Paused</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Production</InputLabel>
            <Select
              value={productionFilter}
              label="Production"
              onChange={(e) => setProductionFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="true">Production Only</MenuItem>
              <MenuItem value="false">Non-Production</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={templateFilter}
              label="Template"
              onChange={(e) => setTemplateFilter(e.target.value)}
            >
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="true">Templates Only</MenuItem>
              <MenuItem value="false">Non-Templates</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Tenants Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business Name</TableCell>
                <TableCell>Subdomain</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Flags</TableCell>
                <TableCell>Stats</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {tenant.businessName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tenant.contactEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={tenant.subdomain} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(tenant)} 
                      color={getStatusColor(tenant)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {tenant.isProduction && (
                        <Chip label="PROD" color="error" size="small" />
                      )}
                      {tenant.isTemplate && (
                        <Chip label="TEMPLATE" color="info" size="small" />
                      )}
                      {tenant.gingrSyncEnabled && (
                        <Chip label="GINGR" color="warning" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" display="block">
                      {tenant.customerCount} customers
                    </Typography>
                    <Typography variant="caption" display="block">
                      {tenant.reservationCount} reservations
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Tooltip title="Clone">
                        <IconButton 
                          size="small"
                          onClick={() => openCloneDialog(tenant)}
                        >
                          <CloneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Flags">
                        <IconButton 
                          size="small"
                          onClick={() => openEditDialog(tenant)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <TenantStatusManager 
                        tenant={tenant}
                        onStatusChange={loadTenants}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 4 }}>
                      No tenants found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Tenant Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tenant</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Subdomain"
              value={formData.subdomain}
              onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
              required
              fullWidth
              helperText="Will be used as: subdomain.canicloud.com"
            />
            <TextField
              label="Contact Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isProduction}
                  onChange={(e) => setFormData({ ...formData, isProduction: e.target.checked })}
                />
              }
              label="Production Account (protected from deletion)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isTemplate}
                  onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                />
              }
              label="Template (can be cloned)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.gingrSyncEnabled}
                  onChange={(e) => setFormData({ ...formData, gingrSyncEnabled: e.target.checked })}
                />
              }
              label="Enable Gingr Sync"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleCreateTenant} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clone Tenant Dialog */}
      <Dialog open={cloneDialogOpen} onClose={() => setCloneDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Clone Tenant: {selectedTenant?.businessName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              This will create a new tenant with the same settings as the source tenant.
            </Alert>
            <TextField
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Subdomain"
              value={formData.subdomain}
              onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
              required
              fullWidth
            />
            <TextField
              label="Contact Name"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contact Email"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setCloneDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleCloneTenant} variant="contained">
            Clone
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Tenant Flags Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit Flags: {selectedTenant?.businessName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isProduction}
                  onChange={(e) => setFormData({ ...formData, isProduction: e.target.checked })}
                />
              }
              label="Production Account (protected from deletion)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isTemplate}
                  onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                />
              }
              label="Template (can be cloned)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.gingrSyncEnabled}
                  onChange={(e) => setFormData({ ...formData, gingrSyncEnabled: e.target.checked })}
                />
              }
              label="Enable Gingr Sync"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleUpdateTenant} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TenantManagement;
