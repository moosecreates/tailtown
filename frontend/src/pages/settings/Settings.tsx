import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  LocalOffer as ServicesIcon,
  Inventory as ResourcesIcon,
  Schedule as ScheduleIcon,
  People as UsersIcon,
  AttachMoney as PriceRulesIcon,
  Settings as GeneralIcon,
  Campaign as MarketingIcon,
  Assignment as CheckInIcon
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const adminSections = [
    {
      title: 'Tenant Management',
      description: 'Manage multi-tenant accounts, subscriptions, and provisioning',
      icon: <UsersIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/admin/tenants',
      stats: 'Active Tenants: 1'
    },
    {
      title: 'Services',
      description: 'Manage boarding, daycare, grooming, and training services',
      icon: <ServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/services',
      stats: 'Active Services: 12'
    },
    {
      title: 'Resources',
      description: 'Manage suites, equipment, and facility resources',
      icon: <ResourcesIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/resources',
      stats: 'Total Resources: 173'
    },
    {
      title: 'Staff Scheduling',
      description: 'Manage employee schedules and work assignments',
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/staff/scheduling',
      stats: 'Active Staff: 8'
    },
    {
      title: 'Users',
      description: 'Manage employee accounts and permissions',
      icon: <UsersIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/settings/users',
      stats: 'Active Users: 5'
    },
    {
      title: 'Marketing',
      description: 'Manage SMS and email marketing campaigns with Twilio and SendGrid',
      icon: <MarketingIcon sx={{ fontSize: 40, color: 'purple' }} />,
      path: '/admin/marketing',
      stats: 'Campaigns: 0'
    },
    {
      title: 'Check-In Templates',
      description: 'Configure check-in questionnaires, fields, and pre-populated options',
      icon: <CheckInIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/admin/check-in-templates',
      stats: 'Templates: 1'
    },
    {
      title: 'Price Rules',
      description: 'Configure discount rules and pricing policies',
      icon: <PriceRulesIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/settings/price-rules',
      stats: 'Active Rules: 3'
    },
    {
      title: 'General Settings',
      description: 'System configuration and preferences',
      icon: <GeneralIcon sx={{ fontSize: 40, color: 'text.secondary' }} />,
      path: '/settings',
      stats: 'Version: 1.2.1'
    }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Manage system settings, users, and administrative functions.
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            {adminSections.map((section, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 4
                    }
                  }}
                  onClick={() => navigate(section.path)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ mr: 2 }}>
                        {section.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {section.description}
                        </Typography>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'medium' }}>
                          {section.stats}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        color="primary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(section.path);
                        }}
                      >
                        Manage →
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings;
