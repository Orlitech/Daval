import React, { useState, useEffect } from 'react';
import { ListItemButton } from "@mui/material";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Snackbar,
  IconButton,
  Chip,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Switch,
  alpha,
  useTheme,
  Zoom,
  Fade,
  Slide,
  Grow
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Upload as UploadIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Error as ErrorIcon,
  Assignment as AssignmentIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  EventNote as EventNoteIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon2,
  VerifiedUser as VerifiedUserIcon,
  SupervisorAccount as SupervisorAccountIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MedicalServices as MedicalIcon,
  Vaccines as VaccinesIcon,
  Bloodtype as BloodtypeIcon,
  Science as ScienceIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon2,
  FilterList as FilterListIcon
} from '@mui/icons-material';

import { auth, cycles, radet, validation, events, supervisor, dashboard, analytics, exportData } from './api';
import type { User, ValidationResult, CorrectionRequest, StaffPerformance, QualityMetrics, TrendData } from './types';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ValidationModule from './components/ValidationModule';
import SupervisorModule from './components/SupervisorModule';
import AdminModule from './components/AdminModule';
import ReportsModule from './components/ReportsModule';

// Modern theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: 'none',
          background: '#ffffff',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [newCycleName, setNewCycleName] = useState('');
  const [newCycleDescription, setNewCycleDescription] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchActiveCycle();
      fetchNotifications();
    }
  }, []);

  const fetchActiveCycle = async () => {
    try {
      const data = await cycles.getActive();
      setActiveCycle(data);
    } catch (error) {
      console.error('Error fetching active cycle:', error);
    }
  };

  const fetchNotifications = async () => {
    // Mock notifications - replace with actual API call
    setNotifications([
      { id: 1, message: 'New validation cycle started', type: 'info', time: '5 min ago' },
      { id: 2, message: '5 corrections pending review', type: 'warning', time: '1 hour ago' },
      { id: 3, message: 'Data export completed', type: 'success', time: '2 hours ago' },
    ]);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    fetchActiveCycle();
  };

  const handleLogout = () => {
    auth.logout();
    setUser(null);
    setAnchorEl(null);
  };

  const handleCreateCycle = async () => {
    if (!newCycleName) return;
    
    setLoading(true);
    try {
      await cycles.create(newCycleName, newCycleDescription);
      setSnackbar({
        open: true,
        message: 'Cycle created successfully',
        severity: 'success'
      });
      setCycleDialogOpen(false);
      setNewCycleName('');
      setNewCycleDescription('');
      fetchActiveCycle();
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error creating cycle',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin': return <AdminPanelSettingsIcon />;
      case 'supervisor': return <SupervisorAccountIcon />;
      default: return <PersonIcon />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      default: return 'info';
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, tab: 0, roles: ['staff', 'supervisor', 'admin'] },
    { text: 'Validation', icon: <AssignmentIcon />, tab: 1, roles: ['staff', 'supervisor', 'admin'] },
    { text: 'Supervisor Review', icon: <SupervisorAccountIcon />, tab: 2, roles: ['supervisor', 'admin'] },
    { text: 'Admin', icon: <AdminPanelSettingsIcon />, tab: 3, roles: ['admin'] },
    { text: 'Reports', icon: <AssessmentIcon />, tab: 4, roles: ['supervisor', 'admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(10px)',
            color: 'text.primary'
          }}
        >
          <Toolbar>
            <IconButton 
              color="inherit" 
              edge="start" 
              onClick={() => setDrawerOpen(!drawerOpen)} 
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                DAVAL
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  ml: 1,
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Data Validation System
              </Typography>
            </Box>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {activeCycle?.has_active_cycle && (
              <Chip
                icon={<CalendarIcon />}
                label={activeCycle.name}
                color="primary"
                variant="outlined"
                sx={{ 
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }}
              />
            )}
            
            {/* Notifications */}
            <Tooltip title="Notifications">
              <IconButton 
                color="inherit" 
                onClick={(e) => setNotificationAnchor(e.currentTarget)}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={() => setNotificationAnchor(null)}
              PaperProps={{
                sx: {
                  width: 320,
                  maxHeight: 400,
                  mt: 1.5
                }
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Notifications
                </Typography>
              </Box>
              {notifications.map((notif) => (
                <MenuItem key={notif.id} sx={{ py: 1.5 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Chip 
                        label={notif.type} 
                        size="small"
                        color={notif.type === 'error' ? 'error' : notif.type === 'warning' ? 'warning' : 'info'}
                        sx={{ height: 20, fontSize: '0.625rem', mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {notif.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {notif.message}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
              <Box sx={{ p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Button size="small" fullWidth>
                  View All
                </Button>
              </Box>
            </Menu>
            
            {/* User Menu */}
            <IconButton 
              color="inherit" 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ 
                p: 0.5,
                border: '2px solid',
                borderColor: alpha(theme.palette[getRoleColor()].main, 0.3)
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: `${getRoleColor()}.main`,
                  color: 'white'
                }}
              >
                {user.full_name.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {user.full_name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip 
                    label={user.role} 
                    size="small"
                    color={getRoleColor()}
                    sx={{ height: 20, fontSize: '0.625rem' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {user.facility}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <MenuItem onClick={() => setCurrentTab(0)}>
                <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                Dashboard
              </MenuItem>
              <MenuItem onClick={() => setCurrentTab(1)}>
                <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
                Validation
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            width: 280,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { 
              width: 280, 
              boxSizing: 'border-box', 
              top: 64,
              bgcolor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
              pt: 2
            }
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            {/* User Welcome */}
            <Box sx={{ px: 3, py: 2, mb: 2 }}>
              <Typography variant="overline" color="text.secondary">
                Welcome back
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {user.full_name}
              </Typography>
            </Box>

            {/* Main Menu */}
            <List>
              {visibleMenuItems.map((item, index) => (
                <Grow in timeout={300 + index * 100} key={item.text}>
                  <ListItem
                    button
                    selected={currentTab === item.tab}
                    onClick={() => setCurrentTab(item.tab)}
                    sx={{
                      mx: 2,
                      mb: 1,
                      borderRadius: 2,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                        '& .MuiListItemText-primary': {
                          color: 'primary.main',
                          fontWeight: 600,
                        },
                      },
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        color: currentTab === item.tab ? 'primary.main' : 'text.secondary',
                        minWidth: 40
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: currentTab === item.tab ? 600 : 400
                      }}
                    />
                    {currentTab === item.tab && (
                      <Box 
                        sx={{ 
                          width: 4, 
                          height: 4, 
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          ml: 1
                        }} 
                      />
                    )}
                  </ListItem>
                </Grow>
              ))}
            </List>

            <Divider sx={{ my: 2, mx: 3 }} />

            {/* Quick Actions */}
            <List>
              <ListItem 
                button 
                onClick={() => setCycleDialogOpen(true)}
                sx={{ mx: 2, mb: 1, borderRadius: 2 }}
              >
                <ListItemIcon sx={{ color: 'success.main', minWidth: 40 }}>
                  <AddIcon />
                </ListItemIcon>
                <ListItemText primary="New Cycle" />
              </ListItem>
              
              <ListItem 
                button
                sx={{ mx: 2, mb: 1, borderRadius: 2 }}
              >
                <ListItemIcon sx={{ color: 'info.main', minWidth: 40 }}>
                  <FileDownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Export Data" />
              </ListItem>
              
              <ListItem 
                button
                sx={{ mx: 2, mb: 1, borderRadius: 2 }}
              >
                <ListItemIcon sx={{ color: 'warning.main', minWidth: 40 }}>
                  <HistoryIcon />
                </ListItemIcon>
                <ListItemText primary="Audit Log" />
              </ListItem>
            </List>

            {/* Cycle Info */}
            {activeCycle?.has_active_cycle && (
              <Box sx={{ mt: 2, mx: 2 }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderColor: alpha(theme.palette.primary.main, 0.2)
                  }}
                >
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    Active Cycle
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {activeCycle.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeCycle.stats?.validated_patients || 0} / {activeCycle.stats?.total_patients || 0} validated
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={activeCycle.stats ? (activeCycle.stats.validated_patients / activeCycle.stats.total_patients) * 100 : 0}
                    sx={{ 
                      mt: 1,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main'
                      }
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: drawerOpen ? 0 : -28,
            transition: 'margin 0.3s',
            bgcolor: 'background.default',
            minHeight: '100vh'
          }}
        >
          <Fade in timeout={500}>
            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              {currentTab === 0 && <Dashboard user={user} activeCycle={activeCycle} />}
              {currentTab === 1 && <ValidationModule user={user} activeCycle={activeCycle} />}
              {currentTab === 2 && <SupervisorModule user={user} />}
              {currentTab === 3 && <AdminModule user={user} onCreateCycle={() => setCycleDialogOpen(true)} />}
              {currentTab === 4 && <ReportsModule user={user} />}
            </Container>
          </Fade>
        </Box>

        {/* New Cycle Dialog */}
        <Dialog 
          open={cycleDialogOpen} 
          onClose={() => setCycleDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          TransitionComponent={Zoom}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <AddIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Create New Validation Cycle</Typography>
                <Typography variant="caption" color="text.secondary">
                  Start a new data validation period
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Cycle Name"
              fullWidth
              value={newCycleName}
              onChange={(e) => setNewCycleName(e.target.value)}
              placeholder="e.g., Q1 2026 Validation"
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newCycleDescription}
              onChange={(e) => setNewCycleDescription(e.target.value)}
              placeholder="Enter cycle description..."
              variant="outlined"
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setCycleDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCycle} 
              variant="contained" 
              disabled={!newCycleName || loading}
              startIcon={<AddIcon />}
            >
              Create Cycle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          TransitionComponent={Slide}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <LinearProgress sx={{ width: 200, mb: 2, borderRadius: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading...
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;