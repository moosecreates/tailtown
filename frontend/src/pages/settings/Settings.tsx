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
  Assignment as CheckInIcon,
  ChecklistRtl as ChecklistIcon,
  Vaccines as VaccineIcon,
  ContentCut as GroomingIcon,
  School as TrainingIcon,
  EmojiEmotions as IconsIcon,
  ShoppingCart as ProductsIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  
  const adminSections = [
    {
      title: 'Business Settings',
      description: 'Upload your business logo and customize branding',
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/settings/business',
      stats: 'Customize Logo'
    },
    {
      title: 'Services',
      description: 'Manage boarding, daycare, grooming, and training services',
      icon: <ServicesIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      path: '/services',
      stats: 'Active Services: 12'
    },
    {
      title: 'Products & POS',
      description: 'Manage retail products, inventory, and point-of-sale',
      icon: <ProductsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/products',
      stats: 'Products: 0'
    },
    {
      title: 'Resources',
      description: 'Manage suites, equipment, and facility resources',
      icon: <ResourcesIcon sx={{ fontSize: 40, color: 'info.main' }} />,
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
      title: 'Checklist Templates',
      description: 'Manage operational checklists for kennel check-in/out, grooming, and facility tasks',
      icon: <ChecklistIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/admin/checklist-templates',
      stats: 'Active Templates: 0'
    },
    {
      title: 'Vaccine Requirements',
      description: 'Configure required vaccines per pet type and service, track compliance and expirations',
      icon: <VaccineIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      path: '/admin/vaccine-requirements',
      stats: 'Active Requirements: 8'
    },
    {
      title: 'Groomer Appointments',
      description: 'Manage grooming appointments, schedules, and groomer assignments',
      icon: <GroomingIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      path: '/grooming/appointments',
      stats: 'Appointments: 0'
    },
    {
      title: 'Training Classes',
      description: 'Manage training classes, enrollments, sessions, and certificates',
      icon: <TrainingIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      path: '/training/classes',
      stats: 'Classes: 0'
    },
    {
      title: 'Custom Icons',
      description: 'Upload and manage custom icons for customers and pets',
      icon: <IconsIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      path: '/admin/custom-icons',
      stats: 'Custom Icons: 0'
    },
    {
      title: 'Payment Methods',
      description: 'Configure accepted payment methods and CardConnect integration',
      icon: <PaymentIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      path: '/settings/payment-methods',
      stats: 'Active Methods: 3'
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
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Manage system settings, users, and administrative functions.
        </Typography>
        
        <Paper sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {adminSections.map((section, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => navigate(section.path)}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                        {React.cloneElement(section.icon as React.ReactElement, { 
                          sx: { fontSize: 28, color: (section.icon as any).props.sx.color } 
                        })}
                      </Box>
                      <Typography variant="subtitle2" component="h2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {section.title}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, lineHeight: 1.3 }}>
                      {section.description}
                    </Typography>
                    <Typography variant="caption" color="primary.main" sx={{ fontWeight: 'medium', fontSize: '0.7rem' }}>
                      {section.stats}
                    </Typography>
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
