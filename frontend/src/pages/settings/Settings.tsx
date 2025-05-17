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
  Divider,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Inventory as ResourcesIcon } from '@mui/icons-material';

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
            <Grid item xs={12} md={4}>
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
            
            <Grid item xs={12} md={4}>
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
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      component={Link} 
                      to="/settings/users"
                      variant="outlined" 
                      color="primary" 
                      size="small"
                    >
                      Manage Users →
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader title="Price Rules" />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    Configure discount rules for services based on booking criteria.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Rule Types</Typography>
                    <Typography variant="body2" color="text.secondary">Day of Week, Multi-Day Stay, Multiple Pets</Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      component={Link} 
                      to="/settings/price-rules"
                      variant="outlined" 
                      color="primary" 
                      size="small"
                    >
                      Manage Price Rules →
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardHeader 
                  title="Resources" 
                  avatar={<ResourcesIcon color="primary" />}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" paragraph>
                    Manage facility resources including kennels, grooming stations, and equipment.
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Resource Types</Typography>
                    <Typography variant="body2" color="text.secondary">Kennels, Grooming Stations, Training Areas</Typography>
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      component={Link} 
                      to="/resources"
                      variant="outlined" 
                      color="primary" 
                      size="small"
                    >
                      Manage Resources →
                    </Button>
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
