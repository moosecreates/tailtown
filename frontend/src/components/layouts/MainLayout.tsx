import React, { useState, useEffect } from 'react';
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
  AssessmentOutlined as ReportIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ImpersonationBanner from '../super-admin/ImpersonationBanner';
import AnnouncementBell from '../announcements/AnnouncementBell';
import AnnouncementModal from '../announcements/AnnouncementModal';
import announcementService from '../../services/announcementService';
import type { Announcement } from '../announcements/AnnouncementModal';
import { useHelp } from '../../contexts/HelpContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { openHelp } = useHelp();
  const location = useLocation();
  const navigate = useNavigate();

  // Load announcements on mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const data = await announcementService.getActiveAnnouncements();
    setAnnouncements(data);
  };

  const handleDismissAnnouncement = async (id: string) => {
    try {
      await announcementService.dismissAnnouncement(id);
      // Only remove if dismiss was successful
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      console.log('Announcement dismissed successfully');
    } catch (error) {
      console.error('Failed to dismiss announcement:', error);
      // Don't remove from state if dismiss failed
      alert('Unable to dismiss announcement. Please try again later.');
    }
  };

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
    { path: '/calendar', label: 'Boarding & Daycare', icon: DaycareIcon },
    { path: '/calendar/grooming', label: 'Grooming', icon: GroomingIcon },
    { path: '/calendar/training', label: 'Training', icon: TrainingIcon },
    { path: '/customers', label: 'Customers', icon: PeopleIcon },
    { path: '/pets', label: 'Pets', icon: PetsIcon },
    { path: '/products', label: 'Products & POS', icon: ShoppingCartIcon },
    { 
      path: '/suites', 
      label: 'Kennels', 
      icon: SuitesIcon,
      children: [
        { path: '/suites', label: 'Kennel Board', icon: SuitesIcon },
        { path: '/kennels/print-cards', label: 'Print Kennel Cards', icon: PrintIcon },
      ] 
    },
    // Hidden while building calendar-integrated ordering functionality
    // { path: '/reservations', label: 'Reservations', icon: EventNoteIcon },
    // { path: '/orders/new', label: 'New Order', icon: OrdersIcon },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: AnalyticsIcon,
      children: [
        { path: '/reports', label: 'All Reports', icon: ReportIcon },
        { path: '/analytics', label: 'Sales Dashboard', icon: ReportIcon },
        { path: '/analytics/customers', label: 'Customer Value', icon: PaymentIcon },
      ] 
    },
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
        {navItems.map((item) => 
          item.children ? (
            <React.Fragment key={item.path}>
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
            </React.Fragment>
          ) : (
            <ListItem key={item.path} disablePadding>
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
          )
        )}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/settings">
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Admin" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Announcement Modal */}
      <AnnouncementModal
        open={showAnnouncementModal}
        announcements={announcements}
        onClose={() => setShowAnnouncementModal(false)}
        onDismiss={handleDismissAnnouncement}
      />
      
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ textAlign: 'right', lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.8 }}>
                {user?.role || 'Staff'}
              </Typography>
            </Box>
            <AnnouncementBell
              announcements={announcements}
              onAnnouncementClick={() => setShowAnnouncementModal(true)}
              onCreateClick={() => navigate('/admin/announcements')}
            />
            <IconButton
              color="inherit"
              onClick={() => openHelp()}
              aria-label="help"
              sx={{ ml: 1 }}
            >
              <HelpOutlineIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
            >
              <Avatar 
                src={(user as any)?.profilePhoto || undefined}
                sx={{ 
                  bgcolor: 'secondary.main',
                  border: '2px solid white',
                }}
              >
                {!(user as any)?.profilePhoto && (user?.firstName?.[0] || 'U')}
              </Avatar>
            </IconButton>
          </Box>
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
        {/* Show impersonation banner if active */}
        {localStorage.getItem('impersonationSession') && (
          <ImpersonationBanner onExit={() => {}} />
        )}
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout;
