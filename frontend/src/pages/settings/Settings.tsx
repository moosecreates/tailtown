import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Settings component for managing application configuration.
 * Includes business settings, notifications, and system preferences.
 */
const Settings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [businessSettings, setBusinessSettings] = useState({
    businessName: 'Tailtown Pet Resort',
    email: 'contact@tailtownresort.com',
    phone: '(555) 123-4567',
    address: '123 Pet Street',
    city: 'Dogville',
    state: 'CA',
    zip: '90210'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    dailyReports: true,
    weeklyReports: true,
    lowInventoryAlerts: true
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBusinessSettingChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleNotificationToggle = (setting: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: event.target.checked
    }));
  };

  const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`settings-tabpanel-${index}`}
        aria-labelledby={`settings-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Paper sx={{ width: '100%', mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Business Settings" />
            <Tab label="Notifications" />
            <Tab label="System" />
          </Tabs>

          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Business Name"
                  value={businessSettings.businessName}
                  onChange={handleBusinessSettingChange('businessName')}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={businessSettings.email}
                  onChange={handleBusinessSettingChange('email')}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Phone"
                  value={businessSettings.phone}
                  onChange={handleBusinessSettingChange('phone')}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address"
                  value={businessSettings.address}
                  onChange={handleBusinessSettingChange('address')}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="City"
                  value={businessSettings.city}
                  onChange={handleBusinessSettingChange('city')}
                  margin="normal"
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={businessSettings.state}
                      onChange={handleBusinessSettingChange('state')}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={businessSettings.zip}
                      onChange={handleBusinessSettingChange('zip')}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary">
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationToggle('emailNotifications')}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={handleNotificationToggle('smsNotifications')}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.dailyReports}
                      onChange={handleNotificationToggle('dailyReports')}
                    />
                  }
                  label="Daily Reports"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onChange={handleNotificationToggle('weeklyReports')}
                    />
                  }
                  label="Weekly Reports"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.lowInventoryAlerts}
                      onChange={handleNotificationToggle('lowInventoryAlerts')}
                    />
                  }
                  label="Low Inventory Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="contained" color="primary">
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" gutterBottom>
              System Information
            </Typography>
            <Typography variant="body1">
              Version: 1.0.0
            </Typography>
            <Typography variant="body1">
              Last Updated: {new Date().toLocaleDateString()}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button variant="outlined" color="primary" sx={{ mr: 2 }}>
                Check for Updates
              </Button>
              <Button variant="outlined" color="secondary">
                Clear Cache
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
