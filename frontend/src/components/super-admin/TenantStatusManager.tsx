/**
 * Tenant Status Manager Component
 * 
 * Provides suspend, activate, delete, and restore functionality for tenants.
 * Only visible to super admins.
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  Typography
} from '@mui/material';
import {
  Block as SuspendIcon,
  CheckCircle as ActivateIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useSuperAdmin } from '../../contexts/SuperAdminContext';

interface TenantStatusManagerProps {
  tenant: any;
  onStatusChange: () => void;
}

const TenantStatusManager: React.FC<TenantStatusManagerProps> = ({ tenant, onStatusChange }) => {
  const { superAdmin } = useSuperAdmin();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show to super admins
  if (!superAdmin) {
    return null;
  }

  const getAccessToken = () => localStorage.getItem('superAdminAccessToken');

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      setError('Suspension reason is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:4004/api/super-admin/tenants/${tenant.id}/suspend`,
        { reason: suspendReason },
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        }
      );

      setSuspendDialogOpen(false);
      setSuspendReason('');
      onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to suspend tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:4004/api/super-admin/tenants/${tenant.id}/activate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        }
      );

      onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.delete(
        `http://localhost:4004/api/super-admin/tenants/${tenant.id}`,
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          },
          data: { reason: deleteReason }
        }
      );

      setDeleteDialogOpen(false);
      setDeleteReason('');
      onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:4004/api/super-admin/tenants/${tenant.id}/restore`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${getAccessToken()}`
          }
        }
      );

      onStatusChange();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to restore tenant');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'PAUSED': return 'warning';
      case 'DELETED': return 'error';
      case 'TRIAL': return 'info';
      default: return 'default';
    }
  };

  const isSuspended = tenant.status === 'PAUSED' || tenant.isPaused;
  const isDeleted = tenant.status === 'DELETED' || tenant.deletedAt;
  const isActive = tenant.status === 'ACTIVE' && tenant.isActive;

  return (
    <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        🔐 Super Admin Controls
      </Typography>

      {/* Status Display */}
      <Box sx={{ mb: 2 }}>
        <Chip
          label={tenant.status || 'ACTIVE'}
          color={getStatusColor(tenant.status)}
          sx={{ mr: 1 }}
        />
        {tenant.suspendedAt && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            Suspended: {new Date(tenant.suspendedAt).toLocaleDateString()}
            {tenant.suspendedReason && ` - ${tenant.suspendedReason}`}
          </Typography>
        )}
        {tenant.deletedAt && (
          <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
            Deleted: {new Date(tenant.deletedAt).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {isActive && (
          <Button
            variant="outlined"
            color="warning"
            startIcon={<SuspendIcon />}
            onClick={() => setSuspendDialogOpen(true)}
            disabled={loading}
          >
            Suspend Tenant
          </Button>
        )}

        {isSuspended && !isDeleted && (
          <Button
            variant="outlined"
            color="success"
            startIcon={<ActivateIcon />}
            onClick={handleActivate}
            disabled={loading}
          >
            Activate Tenant
          </Button>
        )}

        {!isDeleted && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={loading}
          >
            Delete Tenant
          </Button>
        )}

        {isDeleted && (
          <Button
            variant="contained"
            color="success"
            startIcon={<RestoreIcon />}
            onClick={handleRestore}
            disabled={loading}
          >
            Restore Tenant
          </Button>
        )}
      </Box>

      {/* Suspend Dialog */}
      <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend Tenant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Suspending this tenant will prevent all users from accessing the system.
            The account can be reactivated at any time.
          </Typography>
          <TextField
            fullWidth
            label="Suspension Reason"
            multiline
            rows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            required
            helperText="Required: Explain why this tenant is being suspended"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuspendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSuspend}
            color="warning"
            variant="contained"
            disabled={loading || !suspendReason.trim()}
          >
            {loading ? 'Suspending...' : 'Suspend Tenant'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Tenant</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This is a soft delete. The tenant can be restored within 1 year.
            After 1 year, all data will be permanently deleted.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Tenant:</strong> {tenant.businessName}
          </Typography>
          <TextField
            fullWidth
            label="Deletion Reason (Optional)"
            multiline
            rows={3}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            helperText="Optional: Explain why this tenant is being deleted"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Tenant'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantStatusManager;
