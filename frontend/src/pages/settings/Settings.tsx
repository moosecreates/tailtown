import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider
} from '@mui/material';

const Settings: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Configure your application settings and preferences.
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="General Settings" />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    This section will contain general application settings.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coming soon...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title="Users" />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    Manage employee accounts and permissions.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Active Employees</Typography>
                    <Typography variant="body2" color="text.secondary">5</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Roles</Typography>
                    <Typography variant="body2" color="text.secondary">Administrator, Manager, Staff</Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Manage Users →
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardHeader title="System Information" />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    This section will display system information and status.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Application Version</Typography>
                    <Typography variant="body2" color="text.secondary">1.0.0</Typography>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Environment</Typography>
                    <Typography variant="body2" color="text.secondary">Development</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
