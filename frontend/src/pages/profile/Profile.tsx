import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FormikHelpers, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string(),
});

const PasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState<ProfileFormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Fetch fresh profile data from server
        if (user?.id) {
          const response = await api.get(`/staff/${user.id}`);
          const freshData = response.data;
          
          // Update local state
          setProfileData({
            firstName: freshData.firstName || '',
            lastName: freshData.lastName || '',
            email: freshData.email || '',
            phone: freshData.phone || '',
          });
          
          // Update user context with fresh data
          if (updateUser) {
            updateUser({
              firstName: freshData.firstName,
              lastName: freshData.lastName,
              email: freshData.email,
              phone: freshData.phone,
              isActive: freshData.isActive,
              lastLogin: freshData.lastLogin,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback to cached user data
        if (user) {
          setProfileData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const handleProfileSubmit = async (
    values: ProfileFormValues,
    { setSubmitting }: FormikHelpers<ProfileFormValues>
  ) => {
    try {
      setProfileError(null);
      setProfileSuccess(null);

      // Update profile via API
      const response = await api.put(`/staff/${user?.id}`, values);

      // Update user context
      if (updateUser) {
        updateUser(response.data);
      }

      setProfileSuccess('Profile updated successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update profile';
      setProfileError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (
    values: PasswordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<PasswordFormValues>
  ) => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);

      // Change password via API
      await api.post('/staff/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to change password';
      setPasswordError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            fontSize: '2rem',
          }}
        >
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6">Profile Information</Typography>
              </Box>

              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {profileSuccess}
                </Alert>
              )}

              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}

              <Formik
                initialValues={profileData}
                validationSchema={ProfileSchema}
                onSubmit={handleProfileSubmit}
                enableReinitialize
              >
                {({
                  errors,
                  touched,
                  isSubmitting,
                }: {
                  errors: FormikErrors<ProfileFormValues>;
                  touched: FormikTouched<ProfileFormValues>;
                  isSubmitting: boolean;
                }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="firstName"
                      label="First Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                      disabled={isSubmitting}
                    />

                    <Field
                      as={TextField}
                      name="lastName"
                      label="Last Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                      disabled={isSubmitting}
                    />

                    <Field
                      as={TextField}
                      name="email"
                      label="Email Address"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      name="phone"
                      label="Phone Number"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.phone && Boolean(errors.phone)}
                      helperText={touched.phone && errors.phone}
                      disabled={isSubmitting}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
                      sx={{ mt: 3 }}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LockIcon color="primary" />
                <Typography variant="h6">Change Password</Typography>
              </Box>

              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}

              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}

              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validationSchema={PasswordSchema}
                onSubmit={handlePasswordSubmit}
              >
                {({
                  errors,
                  touched,
                  isSubmitting,
                }: {
                  errors: FormikErrors<PasswordFormValues>;
                  touched: FormikTouched<PasswordFormValues>;
                  isSubmitting: boolean;
                }) => (
                  <Form>
                    <Field
                      as={TextField}
                      name="currentPassword"
                      label="Current Password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.currentPassword && Boolean(errors.currentPassword)}
                      helperText={touched.currentPassword && errors.currentPassword}
                      disabled={isSubmitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              edge="end"
                            >
                              {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      name="newPassword"
                      label="New Password"
                      type={showNewPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.newPassword && Boolean(errors.newPassword)}
                      helperText={touched.newPassword && errors.newPassword}
                      disabled={isSubmitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              edge="end"
                            >
                              {showNewPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      name="confirmPassword"
                      label="Confirm New Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      disabled={isSubmitting}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Password Requirements */}
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" component="div">
                        Password must contain:
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div">
                        • At least 8 characters
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div">
                        • One uppercase and lowercase letter
                      </Typography>
                      <Typography variant="caption" color="text.secondary" component="div">
                        • One number and one special character
                      </Typography>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <LockIcon />}
                      sx={{ mt: 3 }}
                    >
                      {isSubmitting ? 'Changing Password...' : 'Change Password'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Account Type
                  </Typography>
                  <Typography variant="body1">
                    {user?.role || 'Staff'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: user?.isActive ? 'success.main' : 'error.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="body2" color="text.secondary">
                    Last Login
                  </Typography>
                  <Typography variant="body1">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
