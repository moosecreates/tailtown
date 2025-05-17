import React, { useState } from 'react';
import { SvgIconComponent } from '@mui/icons-material';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import logoImage from '../../assets/images/tail town logo.jpg';
import { 
  AppBar, 
  Box, 
  CircularProgress,
  CssBaseline,
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  EventNote as EventNoteIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  LocalOffer as ServicesIcon,
  Inventory as ResourcesIcon,
  Hotel as SuitesIcon,
  ContentCut as GroomingIcon,
  FitnessCenter as TrainingIcon,
  Home as DaycareIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Schedule as ScheduleIcon,
  ShoppingCart as OrdersIcon,
  Print as PrintIcon,
  InsertChart as AnalyticsIcon,
  CreditCard as PaymentIcon,
  AssessmentOutlined as ReportIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface NavItem {
  path: string;
  label: string;
  icon: SvgIconComponent;
  children?: NavItem[];
}

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  // 1. All hooks must be called unconditionally at the top level
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 2. Event handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 3. Early returns for loading and unauthenticated states
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleSubMenuToggle = (label: string) => {
    setOpenSubMenu(openSubMenu === label ? null : label);
  };

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { path: '/customers', label: 'Customers', icon: PeopleIcon },
    { path: '/pets', label: 'Pets', icon: PetsIcon },
    { 
      path: '/suites', 
      label: 'Kennels', 
      icon: SuitesIcon,
      children: [
        { path: '/suites', label: 'Kennel Board', icon: SuitesIcon },
        { path: '/kennels/print-cards', label: 'Print Kennel Cards', icon: PrintIcon },
      ] 
    },
    { path: '/reservations', label: 'Reservations', icon: EventNoteIcon },
    // New Order functionality moved to Calendar-based flow - see docs/features/OrderEntry.md
    // Staff Scheduling moved to Admin/Settings
    // Price Rules moved to Settings
    { 
      path: '/calendar', 
      label: 'Calendar', 
      icon: CalendarIcon,
      children: [
        { path: '/calendar', label: 'Boarding & Daycare', icon: DaycareIcon },
        { path: '/calendar/grooming', label: 'Grooming', icon: GroomingIcon },
        { path: '/calendar/training', label: 'Training', icon: TrainingIcon },
      ] 
    },
    // Analytics moved to Admin/Settings
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 2,
        px: 1
      }}>
        <Box sx={{ width: '140px', height: '140px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img 
            src={logoImage} 
            alt="Tailtown Pet Resort" 
            style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.2)' }} 
          />
        </Box>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <React.Fragment key={item.path}>
            {item.children ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleSubMenuToggle(item.label)}
                    selected={location.pathname.startsWith(item.path)}
                    sx={{
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.main',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      <item.icon />
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {openSubMenu === item.label ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemButton>
                </ListItem>
                {openSubMenu === item.label && (
                  <List component="div" disablePadding>
                    {item.children.map((child) => (
                      <ListItem key={child.path} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={child.path}
                          selected={location.pathname === child.path}
                          onClick={handleDrawerToggle}
                          sx={{
                            pl: 4,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                              },
                              '& .MuiListItemIcon-root': {
                                color: 'primary.contrastText',
                              },
                            },
                          }}
                        >
                          <ListItemIcon>
                            <child.icon />
                          </ListItemIcon>
                          <ListItemText primary={child.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.main',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon>
                    <item.icon />
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Admin/Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.firstName?.[0] || 'U'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
          >
            <MenuItem onClick={() => {
              handleProfileMenuClose();
              navigate('/profile');
            }}>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="navigation menu"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;
