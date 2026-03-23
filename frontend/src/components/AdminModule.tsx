import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
  AvatarGroup,
  Stack,
  Tooltip,
  LinearProgress,
  Fade,
  Zoom,
  Grow,
  Slide,
  alpha,
  useTheme,
  Badge,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions,
  CardMedia,
  InputAdornment,
  FormHelperText,
  Switch,
  FormControlLabel,
  Radio,
  RadioGroup,
  Rating,
  Skeleton,
  Backdrop,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon,
  CalendarToday as CalendarIcon,
  FileUpload as FileUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  DataUsage as DataIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Restore as RestoreIcon,
  Backup as BackupIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  VerifiedUser as VerifiedUserIcon,
  SupervisorAccount as SupervisorIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  MenuBook as MenuBookIcon,
  Description as DescriptionIcon,
  FolderOpen as FolderOpenIcon
} from '@mui/icons-material';
import { cycles, radet, auth, analytics, dashboard, admin } from '../api';
import type { 
  User, 
  ValidationCycle, 
  RADETUploadResult,
  UserCreate 
} from '../types';

interface AdminModuleProps {
  user: User;
  onCreateCycle: () => void;
}

// Tab Panel Component
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value, icon, color, trend }: any) => {
  const theme = useTheme();
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: theme => `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].light, 0.05)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: theme => alpha(theme.palette[color].main, 0.2),
        borderRadius: 3,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme => `0 12px 24px -8px ${alpha(theme.palette[color].main, 0.3)}`
        }
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Avatar 
            sx={{ 
              bgcolor: theme => alpha(theme.palette[color].main, 0.2),
              color: theme => theme.palette[color].main,
              width: 56,
              height: 56,
              borderRadius: 2
            }}
          >
            {icon}
          </Avatar>
        </Stack>
        {trend && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            {trend > 0 ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              {Math.abs(trend)}% from last month
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// User Card Component
const UserCard = ({ user, onEdit, onDelete }: any) => {
  const theme = useTheme();
  
  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'error';
      case 'supervisor': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Grow in timeout={500}>
      <Card 
        sx={{ 
          borderRadius: 3,
          position: 'relative',
          overflow: 'visible',
          transition: 'transform 0.3s',
          '&:hover': {
            transform: 'translateY(-4px)',
            '& .user-actions': {
              opacity: 1
            }
          }
        }}
      >
        <Box 
          className="user-actions"
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            opacity: 0,
            transition: 'opacity 0.3s',
            zIndex: 1
          }}
        >
          <Tooltip title="Edit User">
            <IconButton size="small" onClick={() => onEdit(user)} sx={{ bgcolor: 'background.paper', boxShadow: 1, mr: 0.5 }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete User">
            <IconButton size="small" onClick={() => onDelete(user)} sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <DeleteIcon fontSize="small" color="error" />
            </IconButton>
          </Tooltip>
        </Box>

        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Chip 
                  label={user.role} 
                  size="small"
                  color={getRoleColor(user.role)}
                  sx={{ 
                    height: 20,
                    fontSize: '0.625rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                />
              }
            >
              <Avatar 
                sx={{ 
                  width: 80, 
                  height: 80,
                  mx: 'auto',
                  mb: 1,
                  bgcolor: `${getRoleColor(user.role)}.main`,
                  color: 'white',
                  fontSize: '2rem',
                  border: '3px solid',
                  borderColor: theme => alpha(theme.palette[getRoleColor(user.role)].main, 0.3)
                }}
              >
                {user.full_name.charAt(0)}
              </Avatar>
            </Badge>
            
            <Typography variant="h6" fontWeight="bold">
              {user.full_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Facility
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {user.facility}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Validations
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {user.validations || 0}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

// Cycle Timeline Component
const CycleTimeline = ({ cycles }: { cycles: ValidationCycle[] }) => {
  const theme = useTheme();

  if (!cycles || cycles.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">No validation cycles found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: 400, overflow: 'auto', pr: 2 }}>
      {cycles.map((cycle, index) => (
        <Fade in timeout={500 + index * 100} key={cycle.id}>
          <Box sx={{ position: 'relative', mb: 3 }}>
            {/* Timeline Line */}
            {index < cycles.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: 40,
                  bottom: -20,
                  width: 2,
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.2)
                }}
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Timeline Dot */}
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: cycle.is_active ? 'success.main' : alpha(theme.palette.primary.main, 0.1),
                  color: cycle.is_active ? 'white' : 'text.secondary'
                }}
              >
                {cycle.is_active ? <PlayIcon /> : <CalendarIcon />}
              </Avatar>

              {/* Cycle Card */}
              <Card 
                variant="outlined"
                sx={{ 
                  flex: 1,
                  borderRadius: 2,
                  borderColor: cycle.is_active ? 'success.main' : 'divider',
                  bgcolor: cycle.is_active ? alpha(theme.palette.success.main, 0.02) : 'background.paper'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {cycle.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Started {new Date(cycle.start_date).toLocaleDateString()}
                      </Typography>
                      {cycle.end_date && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ended {new Date(cycle.end_date).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    {cycle.is_active && (
                      <Chip 
                        label="Active" 
                        size="small"
                        color="success"
                        icon={<PlayIcon />}
                      />
                    )}
                  </Box>

                  {cycle.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {cycle.description}
                    </Typography>
                  )}

                  {cycle.stats && (
                    <>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Patients
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {cycle.stats.total_patients || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Validated
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {cycle.stats.validated_patients || 0}
                          </Typography>
                        </Box>
                      </Box>

                      {cycle.stats.total_patients > 0 && (
                        <LinearProgress 
                          variant="determinate" 
                          value={(cycle.stats.validated_patients / cycle.stats.total_patients) * 100}
                          sx={{ 
                            mt: 2,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: cycle.is_active ? 'success.main' : 'primary.main'
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Fade>
      ))}
    </Box>
  );
};

export default function AdminModule({ user, onCreateCycle }: AdminModuleProps) {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [allCycles, setAllCycles] = useState<ValidationCycle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<RADETUploadResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeCycles: 0,
    totalValidations: 0,
    systemHealth: 100
  });
  const [systemConfig, setSystemConfig] = useState<any>(null);

  const [newUser, setNewUser] = useState<UserCreate>({
    username: '',
    password: '',
    full_name: '',
    role: 'staff',
    facility: ''
  });

  useEffect(() => {
    fetchCycles();
    fetchUsers();
    fetchStats();
    fetchSystemConfig();
  }, []);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const data = await cycles.getAll();
      setAllCycles(data);
    } catch (error) {
      console.error('Error fetching cycles:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching cycles',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setStatsLoading(true);
    try {
      const usersData = await admin.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({
        open: true,
        message: 'Error fetching users',
        severity: 'error'
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const systemStats = await admin.getSystemStats();
      setStats({
        totalUsers: systemStats.users?.total || 0,
        activeCycles: systemStats.cycles?.active ? 1 : 0,
        totalValidations: systemStats.validations?.total || 0,
        systemHealth: 100
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSystemConfig = async () => {
    try {
      const config = await admin.getSystemConfig();
      setSystemConfig(config);
    } catch (error) {
      console.error('Error fetching system config:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      const result = await radet.upload(selectedFile);
      setUploadResult(result);
      setUploadProgress(100);
      setSnackbar({
        open: true,
        message: `Upload successful! Added: ${result.records_added}, Updated: ${result.records_updated}`,
        severity: 'success'
      });
      
      fetchCycles();
      
      setTimeout(() => {
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setUploadResult(null);
        setUploadProgress(0);
      }, 3000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error uploading file',
        severity: 'error'
      });
      setUploadProgress(0);
    } finally {
      setUploading(false);
      clearInterval(interval);
    }
  };

  const handleCreateUser = async () => {
    try {
      const createdUser = await auth.register(newUser);
      setSnackbar({
        open: true,
        message: 'User created successfully',
        severity: 'success'
      });
      setUserDialogOpen(false);
      setNewUser({
        username: '',
        password: '',
        full_name: '',
        role: 'staff',
        facility: ''
      });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error creating user',
        severity: 'error'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: '',
      full_name: user.full_name,
      role: user.role,
      facility: user.facility
    });
    setUserDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    try {
      await admin.updateUser(editingUser.id, newUser);
      setSnackbar({
        open: true,
        message: 'User updated successfully',
        severity: 'success'
      });
      setUserDialogOpen(false);
      setEditingUser(null);
      setNewUser({
        username: '',
        password: '',
        full_name: '',
        role: 'staff',
        facility: ''
      });
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error updating user',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await admin.deleteUser(userToDelete.id);
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error deleting user',
        severity: 'error'
      });
    }
  };

  const handleCreateBackup = async () => {
    try {
      const result = await admin.createBackup();
      setSnackbar({
        open: true,
        message: `Backup created: ${result.file}`,
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error creating backup',
        severity: 'error'
      });
    }
  };

  const handleExportLogs = async () => {
    try {
      const result = await admin.exportLogs({ format: 'csv' });
      admin.downloadBackup(result, 'system-logs', 'csv');
      setSnackbar({
        open: true,
        message: 'Logs exported successfully',
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error exporting logs',
        severity: 'error'
      });
    }
  };

  const handleSaveSystemConfig = async () => {
    try {
      await admin.updateSystemConfig(systemConfig);
      setSnackbar({
        open: true,
        message: 'Configuration saved successfully',
        severity: 'success'
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'Error saving configuration',
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Administration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage system settings, users, and validation cycles
          </Typography>
        </Box>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Cycles"
            value={stats.activeCycles}
            icon={<AssignmentIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Validations"
            value={stats.totalValidations.toLocaleString()}
            icon={<CheckCircleIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Health"
            value={`${stats.systemHealth}%`}
            icon={<SecurityIcon />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Zoom in timeout={1000}>
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateCycle}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }}
              >
                New Validation Cycle
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<CloudUploadIcon />}
                onClick={() => setUploadDialogOpen(true)}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Upload RADET Data
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({
                    username: '',
                    password: '',
                    full_name: '',
                    role: 'staff',
                    facility: ''
                  });
                  setUserDialogOpen(true);
                }}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Add User
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportLogs}
                sx={{ py: 1.5, borderRadius: 2 }}
              >
                Export System Logs
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Zoom>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)}
          sx={{
            px: 3,
            pt: 2,
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 500
            }
          }}
        >
          <Tab icon={<AssignmentIcon />} label="Validation Cycles" iconPosition="start" />
          <Tab icon={<PeopleIcon />} label="User Management" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="System Settings" iconPosition="start" />
          <Tab icon={<DataIcon />} label="Data Management" iconPosition="start" />
        </Tabs>

        {/* Validation Cycles Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Validation Cycles Timeline
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={onCreateCycle}
                size="small"
              >
                New Cycle
              </Button>
            </Box>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <CycleTimeline cycles={allCycles} />
            )}
          </Box>
        </TabPanel>

        {/* User Management Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                System Users
              </Typography>
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({
                    username: '',
                    password: '',
                    full_name: '',
                    role: 'staff',
                    facility: ''
                  });
                  setUserDialogOpen(true);
                }}
                size="small"
              >
                Add User
              </Button>
            </Box>

            {statsLoading ? (
              <Grid container spacing={3}>
                {[1, 2, 3].map((i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
              </Grid>
            ) : users.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Users Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Get started by adding your first user
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => {
                    setEditingUser(null);
                    setNewUser({
                      username: '',
                      password: '',
                      full_name: '',
                      role: 'staff',
                      facility: ''
                    });
                    setUserDialogOpen(true);
                  }}
                >
                  Add User
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {users.map((user) => (
                  <Grid item xs={12} sm={6} md={4} key={user.id}>
                    <UserCard 
                      user={user} 
                      onEdit={handleEditUser}
                      onDelete={(user: User) => {
                        setUserToDelete(user);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </TabPanel>

        {/* System Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              System Configuration
            </Typography>
            
            <Accordion defaultExpanded sx={{ mb: 2, borderRadius: 2 }}>
              <AccordionSummary expandIcon={<SettingsIcon />}>
                <Typography fontWeight="medium">Validation Rules</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemConfig?.validation_rules?.enable_logical_error_detection ?? true}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          validation_rules: {
                            ...systemConfig?.validation_rules,
                            enable_logical_error_detection: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Enable logical error detection"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemConfig?.validation_rules?.require_supervisor_approval ?? true}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          validation_rules: {
                            ...systemConfig?.validation_rules,
                            require_supervisor_approval: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Require supervisor approval for corrections"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemConfig?.validation_rules?.auto_approve_minor_corrections ?? false}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          validation_rules: {
                            ...systemConfig?.validation_rules,
                            auto_approve_minor_corrections: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Auto-approve minor corrections"
                  />
                  <TextField
                    label="Days until treatment interruption alert"
                    type="number"
                    value={systemConfig?.validation_rules?.treatment_interruption_days ?? 28}
                    onChange={(e) => setSystemConfig({
                      ...systemConfig,
                      validation_rules: {
                        ...systemConfig?.validation_rules,
                        treatment_interruption_days: parseInt(e.target.value)
                      }
                    })}
                    size="small"
                    sx={{ maxWidth: 200 }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mb: 2, borderRadius: 2 }}>
              <AccordionSummary expandIcon={<SecurityIcon />}>
                <Typography fontWeight="medium">Security Settings</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemConfig?.security?.enable_two_factor ?? false}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          security: {
                            ...systemConfig?.security,
                            enable_two_factor: e.target.checked
                          }
                        })}
                      />
                    }
                    label="Enable two-factor authentication"
                  />
                  <FormControlLabel
                    control={
                      <Switch 
                        checked={systemConfig?.security?.password_expiry_days !== null ?? true}
                        onChange={(e) => setSystemConfig({
                          ...systemConfig,
                          security: {
                            ...systemConfig?.security,
                            password_expiry_days: e.target.checked ? 90 : null
                          }
                        })}
                      />
                    }
                    label="Require password change every 90 days"
                  />
                  <TextField
                    label="Session timeout (minutes)"
                    type="number"
                    value={systemConfig?.security?.session_timeout_minutes ?? 30}
                    onChange={(e) => setSystemConfig({
                      ...systemConfig,
                      security: {
                        ...systemConfig?.security,
                        session_timeout_minutes: parseInt(e.target.value)
                      }
                    })}
                    size="small"
                    sx={{ maxWidth: 200 }}
                  />
                  <TextField
                    label="Max login attempts"
                    type="number"
                    value={systemConfig?.security?.max_login_attempts ?? 5}
                    onChange={(e) => setSystemConfig({
                      ...systemConfig,
                      security: {
                        ...systemConfig?.security,
                        max_login_attempts: parseInt(e.target.value)
                      }
                    })}
                    size="small"
                    sx={{ maxWidth: 200 }}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Accordion sx={{ borderRadius: 2 }}>
              <AccordionSummary expandIcon={<DataIcon />}>
                <Typography fontWeight="medium">Data Retention</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <RadioGroup
                    value={systemConfig?.data_retention?.policy ?? "archive_6_months"}
                    onChange={(e) => setSystemConfig({
                      ...systemConfig,
                      data_retention: {
                        ...systemConfig?.data_retention,
                        policy: e.target.value
                      }
                    })}
                  >
                    <FormControlLabel 
                      value="keep_indefinitely" 
                      control={<Radio />} 
                      label="Keep data indefinitely" 
                    />
                    <FormControlLabel 
                      value="auto_delete_1_year" 
                      control={<Radio />} 
                      label="Auto-delete after 1 year" 
                    />
                    <FormControlLabel 
                      value="archive_6_months" 
                      control={<Radio />} 
                      label="Archive after 6 months" 
                    />
                  </RadioGroup>
                  
                  {systemConfig?.data_retention?.policy === "auto_delete_1_year" && (
                    <TextField
                      label="Days until deletion"
                      type="number"
                      value={systemConfig?.data_retention?.auto_delete_days ?? 365}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        data_retention: {
                          ...systemConfig?.data_retention,
                          auto_delete_days: parseInt(e.target.value)
                        }
                      })}
                      size="small"
                      sx={{ maxWidth: 200 }}
                      helperText="Data older than this will be automatically deleted"
                    />
                  )}
                  
                  {systemConfig?.data_retention?.policy === "archive_6_months" && (
                    <TextField
                      label="Days until archive"
                      type="number"
                      value={systemConfig?.data_retention?.archive_days ?? 180}
                      onChange={(e) => setSystemConfig({
                        ...systemConfig,
                        data_retention: {
                          ...systemConfig?.data_retention,
                          archive_days: parseInt(e.target.value)
                        }
                      })}
                      size="small"
                      sx={{ maxWidth: 200 }}
                      helperText="Data older than this will be archived"
                    />
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleSaveSystemConfig}
                startIcon={<SaveIcon />}
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                }}
              >
                Save Configuration
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Data Management Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ px: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Data Management
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2 }}>
                        <BackupIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Backup Database
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Create a full backup of all system data
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      startIcon={<BackupIcon />} 
                      fullWidth
                      onClick={handleCreateBackup}
                    >
                      Create Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main', mr: 2 }}>
                        <RestoreIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Restore Data
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Restore from a previous backup
                        </Typography>
                      </Box>
                    </Box>
                    <Button 
                      variant="outlined" 
                      color="warning" 
                      startIcon={<RestoreIcon />} 
                      fullWidth 
                      disabled
                    >
                      Restore from Backup
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Database Statistics
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <StorageIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">
                            {allCycles.reduce((sum, cycle) => sum + (cycle.stats?.total_patients || 0), 0)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Total Patients</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AssignmentIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">{stats.totalValidations}</Typography>
                          <Typography variant="caption" color="text.secondary">Validations</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <PeopleIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">{stats.totalUsers}</Typography>
                          <Typography variant="caption" color="text.secondary">Users</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <HistoryIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">-</Typography>
                          <Typography variant="caption" color="text.secondary">Corrections</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* RADET Upload Dialog */}
      <Dialog 
        open={uploadDialogOpen} 
        onClose={() => !uploading && setUploadDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUploadIcon sx={{ mr: 2, fontSize: 28 }} />
            <Box>
              <Typography variant="h6">Upload RADET Data</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Import patient records from Excel or CSV
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ mt: 3 }}>
          {uploadResult ? (
            <Fade in>
              <Box>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    '& .MuiAlert-icon': { fontSize: 32 }
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Upload Successful!
                  </Typography>
                  <Typography variant="body2">
                    Records Added: <strong>{uploadResult.records_added}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Records Updated: <strong>{uploadResult.records_updated}</strong>
                  </Typography>
                </Alert>
              </Box>
            </Fade>
          ) : (
            <Box>
              {uploading && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Uploading...</Typography>
                    <Typography variant="body2">{uploadProgress}%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{ 
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      }
                    }}
                  />
                </Box>
              )}

              <Box 
                sx={{ 
                  border: '2px dashed',
                  borderColor: selectedFile ? 'success.main' : alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => document.getElementById('radet-file-upload')?.click()}
              >
                <input
                  accept=".xlsx,.csv"
                  style={{ display: 'none' }}
                  id="radet-file-upload"
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                <Typography variant="h6" gutterBottom>
                  {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supported formats: Excel (.xlsx) or CSV (.csv)
                </Typography>
                
                {selectedFile && (
                  <Chip 
                    label={`${(selectedFile.size / 1024).toFixed(2)} KB`}
                    size="small"
                    sx={{ mt: 2 }}
                  />
                )}
              </Box>

              <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> The file should contain columns for hospital_number, date_of_birth, sex, 
                  art_start_date, current_regimen, last_drug_pickup, last_vl_sample_date, last_vl_result, 
                  last_vl_result_date, and last_clinic_visit.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Button 
            onClick={() => {
              setUploadDialogOpen(false);
              setSelectedFile(null);
              setUploadResult(null);
              setUploadProgress(0);
            }} 
            disabled={uploading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleFileUpload} 
            variant="contained" 
            disabled={!selectedFile || uploading || !!uploadResult}
            startIcon={<UploadIcon />}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit User Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => {
          setUserDialogOpen(false);
          setEditingUser(null);
        }} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              {editingUser ? <EditIcon /> : <PersonAddIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {editingUser ? 'Edit User' : 'Create New User'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editingUser ? 'Update user information' : 'Add a new user to the system'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VerifiedUserIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                variant="outlined"
                required={!editingUser}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {editingUser && (
                <FormHelperText>Leave blank to keep current password</FormHelperText>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facility"
                value={newUser.facility}
                onChange={(e) => setNewUser({ ...newUser, facility: e.target.value })}
                variant="outlined"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  label="Role"
                >
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Button 
            onClick={() => {
              setUserDialogOpen(false);
              setEditingUser(null);
            }}
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={editingUser ? handleUpdateUser : handleCreateUser}
            variant="contained"
            startIcon={editingUser ? <SaveIcon /> : <PersonAddIcon />}
            disabled={!newUser.username || !newUser.full_name || !newUser.facility || (!editingUser && !newUser.password)}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
            }}
          >
            {editingUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Avatar 
            sx={{ 
              mx: 'auto', 
              mb: 2,
              bgcolor: 'error.light',
              width: 60,
              height: 60
            }}
          >
            <DeleteIcon sx={{ fontSize: 30 }} />
          </Avatar>
          <Typography variant="h6">Confirm Deletion</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this user?
          </Typography>
          {userToDelete && (
            <Typography variant="body2" color="text.secondary">
              {userToDelete.full_name} (@{userToDelete.username})
            </Typography>
          )}
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={Slide}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}