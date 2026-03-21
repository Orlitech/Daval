import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TableChart as TableChartIcon } from '@mui/icons-material';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Stack,
  Divider,
  alpha,
  useTheme,
  Fade,
  Zoom,
  Grow,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  AlertTitle,
  Badge,
  CircularProgress,
  Button,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Rating,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Snackbar,
  useMediaQuery,
  CardActionArea,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link,
  ToggleButtonGroup,
  ToggleButton,
  Fab,
  Drawer,
  ListItemButton,
  AppBar,
  Toolbar
} from '@mui/material';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent
} from '@mui/lab';

import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import TimelineIcon from '@mui/icons-material/Timeline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Clear';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import RuleIcon from '@mui/icons-material/Rule';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
  Treemap
} from 'recharts';
import { dashboard, analytics, validationSummaries } from '../api';

// ==================== TYPES ====================

interface DashboardStats {
  total_clients: number;
  validated_clients: number;
  remaining: number;
  mismatches: number;
  progress_percentage: number;
}

interface QualityMetrics {
  overall_accuracy: number;
  total_validations: number;
  status_breakdown: Record<string, number>;
  top_error_fields: Array<[string, number]>;
  treatment_interruption_risk: number;
  missing_vl_results: number;
  total_patients: number;
  average_months_dispensed?: number;
  dispensing_patterns: Record<string, number>;
}

interface StaffPerformance {
  user_id: number;
  user_name: string;
  patients_validated: number;
  total_validations: number;
  mismatches_found: number;
  logical_errors_found: number;
  accuracy_rate: number;
}

interface TrendData {
  cycle_id: number;
  cycle_name: string;
  date: string;
  accuracy: number;
  total_validations: number;
}

interface HospitalSummary {
  hospital_number: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  score_percentage: number;
  classification: string;
  color_code: string;
  failed_fields: Array<{
    field_name: string;
    status: string;
    radet_value: string | null;
    care_card_value: string | null;
    logical_error?: string;
  }>;
  validation_status: string;
}

interface FacilityDQI {
  facility_name: string;
  facility_code: string;
  total_patients_validated: number;
  total_expected_checks: number;
  total_passed_checks: number;
  dqi_score: number;
  classification_breakdown: Record<string, number>;
  color_code: string;
}

interface Duplicate {
  original: string;
  duplicate: string;
  confidence: number;
}

interface TreatmentInterruption {
  hospital_number: string;
  last_pickup_date: string | null;
  days_since_pickup: number | null;
  risk_level: string;
  months_of_arv_dispensed: number | null;
}

interface Cycle {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface DashboardProps {
  user: User;
  activeCycle: Cycle | null;
}

// ==================== CONSTANTS ====================

const STATUS_COLORS = {
  MATCH: '#10b981',
  MISMATCH: '#ef4444',
  MISSING_IN_RADET: '#f59e0b',
  MISSING_IN_CARD: '#8b5cf6',
  LOGICAL_ERROR: '#ec4899',
  UPDATED_RECORD: '#3b82f6'
};

const CLASSIFICATION_COLORS = {
  'Perfect Match': '#10b981',
  'Low Discrepancy': '#84cc16',
  'Moderate Discrepancy': '#eab308',
  'High Discrepancy': '#f97316',
  'Critical Issue': '#ef4444'
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

const RISK_LEVEL_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444'
};

// ==================== ENHANCED HELPER COMPONENTS ====================

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
  trendLabel?: string;
  info?: string;
  progress?: number;
  onClick?: () => void;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  trendLabel,
  info,
  progress,
  onClick,
  loading = false
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
    if (trend < 0) return <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    return <TrendingFlatIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />;
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent>
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width="60%" sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" height={40} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Grow in timeout={300}>
      <Card 
        sx={{ 
          height: '100%',
          borderRadius: 3,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            transform: 'translateY(-6px)',
            boxShadow: `0 20px 28px -12px ${alpha(theme.palette[color].main, 0.4)}`
          } : {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px -8px ${alpha(theme.palette[color].main, 0.2)}`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${alpha(theme.palette[color].main, 0.5)})`,
          }
        }}
        onClick={onClick}
      >
        <CardContent sx={{ height: '100%', overflow: 'hidden', p: 3 }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Avatar 
                sx={{ 
                  bgcolor: alpha(theme.palette[color].main, 0.12),
                  color: theme.palette[color].main,
                  width: 52,
                  height: 52,
                  borderRadius: 2.5,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}
              >
                {icon}
              </Avatar>
              {info && (
                <Tooltip title={info} arrow placement="top">
                  <HelpOutlineIcon sx={{ fontSize: 18, color: 'text.secondary', opacity: 0.5, cursor: 'help' }} />
                </Tooltip>
              )}
            </Box>
            
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
                {title}
              </Typography>
              <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>

            {progress !== undefined && (
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette[color].main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette[color].main,
                      borderRadius: 3,
                      transition: 'transform 0.5s ease'
                    }
                  }}
                />
              </Box>
            )}

            {(trend !== undefined || trendLabel) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                {getTrendIcon()}
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {trendLabel || `${Math.abs(trend || 0)}% vs last cycle`}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Grow>
  );
};

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
  clickable?: boolean;
  onClick?: () => void;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small', clickable, onClick }) => {
  const theme = useTheme();
  
  const getConfig = () => {
    switch (status) {
      case 'MATCH':
        return { color: 'success', icon: <TaskAltIcon />, label: 'Match', bg: alpha(theme.palette.success.main, 0.08) };
      case 'MISMATCH':
        return { color: 'error', icon: <HighlightOffIcon />, label: 'Mismatch', bg: alpha(theme.palette.error.main, 0.08) };
      case 'LOGICAL_ERROR':
        return { color: 'error', icon: <WarningAmberIcon />, label: 'Logical Error', bg: alpha(theme.palette.error.main, 0.08) };
      case 'UPDATED_RECORD':
        return { color: 'info', icon: <PublishedWithChangesIcon />, label: 'Updated', bg: alpha(theme.palette.info.main, 0.08) };
      case 'MISSING_IN_RADET':
        return { color: 'warning', icon: <ErrorOutlineIcon />, label: 'Missing in RADET', bg: alpha(theme.palette.warning.main, 0.08) };
      case 'MISSING_IN_CARD':
        return { color: 'warning', icon: <ErrorOutlineIcon />, label: 'Missing in Card', bg: alpha(theme.palette.warning.main, 0.08) };
      default:
        return { color: 'default', icon: <InfoIcon />, label: status, bg: alpha(theme.palette.grey[500], 0.08) };
    }
  };

  const config = getConfig();

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size={size}
      onClick={clickable ? onClick : undefined}
      sx={{
        bgcolor: config.bg,
        color: theme.palette[config.color === 'default' ? 'text' : config.color].main,
        border: 'none',
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.8125rem',
        transition: 'all 0.2s',
        '&:hover': clickable ? {
          transform: 'scale(1.02)',
          bgcolor: alpha(theme.palette[config.color === 'default' ? 'grey' : config.color].main, 0.12)
        } : {}
      }}
    />
  );
};

interface ClassificationChipProps {
  classification: string;
  size?: 'small' | 'medium';
}

const ClassificationChip: React.FC<ClassificationChipProps> = ({ classification, size = 'small' }) => {
  const theme = useTheme();

  const color =
    CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS] || '#9ca3af';

  return (
    <Chip
      label={classification}
      size={size}
      sx={{
        bgcolor: alpha(color, 0.1),
        color: color,
        border: '1px solid',
        borderColor: alpha(color, 0.3),
        fontWeight: 600,
        fontSize: size === 'small' ? '0.7rem' : '0.8rem'
      }}
    />
  );
};

interface ScoreGaugeProps {
  score: number;
  size?: number;
  showLabel?: boolean;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 80, showLabel = true }) => {
  const theme = useTheme();
  
  const getColor = () => {
    if (score === 100) return theme.palette.success.main;
    if (score >= 80) return '#84cc16';
    if (score >= 60) return theme.palette.warning.main;
    if (score >= 30) return '#f97316';
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={size}
        thickness={5}
        sx={{
          color: getColor(),
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
            transition: 'stroke-dashoffset 0.5s ease'
          }
        }}
      />
      {showLabel && (
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" fontWeight="bold" component="div">
            {Math.round(score)}%
          </Typography>
        </Box>
      )}
    </Box>
  );
};

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 1000, format = (v) => v.toString() }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const current = startValue + (endValue - startValue) * eased;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);
  
  return <span>{format(displayValue)}</span>;
};

// ==================== MAIN COMPONENT ====================

export default function Dashboard({ user, activeCycle }: DashboardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [hospitalSummaries, setHospitalSummaries] = useState<HospitalSummary[]>([]);
  const [facilityDQI, setFacilityDQI] = useState<FacilityDQI[]>([]);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [interruptions, setInterruptions] = useState<TreatmentInterruption[]>([]);
  
  // UI states
  const [selectedHospital, setSelectedHospital] = useState<HospitalSummary | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'hospital'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [expandedHospital, setExpandedHospital] = useState<string | null>(null);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch all data with loading states
  const fetchData = useCallback(async (showRefreshAnimation = false) => {
    if (showRefreshAnimation) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Simulate minimum loading time for better UX
      const minLoadPromise = new Promise(resolve => setTimeout(resolve, 500));
      
      const [
        statsRes,
        qualityRes,
        staffRes,
        trendsRes,
        summariesRes,
        dqiRes,
        duplicatesRes,
        interruptionsRes
      ] = await Promise.allSettled([
        dashboard.getStats(),
        dashboard.getQualityMetrics(),
        dashboard.getStaffPerformance(),
        dashboard.getTrends(),
        validationSummaries.getAllSummaries(),
        validationSummaries.getFacilityDQI(),
        analytics.getDuplicates(),
        analytics.getTreatmentInterruptions()
      ]);

      await minLoadPromise;

      // Handle each response
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      else console.error('Failed to fetch stats:', statsRes.reason);

      if (qualityRes.status === 'fulfilled') setQualityMetrics(qualityRes.value);
      else console.error('Failed to fetch quality metrics:', qualityRes.reason);

      if (staffRes.status === 'fulfilled') setStaffPerformance(staffRes.value);
      else console.error('Failed to fetch staff performance:', staffRes.reason);

      if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value);
      else console.error('Failed to fetch trends:', trendsRes.reason);

      if (summariesRes.status === 'fulfilled') setHospitalSummaries(summariesRes.value);
      else console.error('Failed to fetch hospital summaries:', summariesRes.reason);

      if (dqiRes.status === 'fulfilled') setFacilityDQI(dqiRes.value);
      else console.error('Failed to fetch facility DQI:', dqiRes.reason);

      if (duplicatesRes.status === 'fulfilled') {
        setDuplicates(duplicatesRes.value.potential_duplicates || []);
      } else console.error('Failed to fetch duplicates:', duplicatesRes.reason);

      if (interruptionsRes.status === 'fulfilled') {
        setInterruptions(interruptionsRes.value.treatment_interruptions || []);
      } else console.error('Failed to fetch interruptions:', interruptionsRes.reason);

      setLastUpdated(new Date());
      setSnackbarMessage('Data refreshed successfully');
      setSnackbarOpen(true);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
      setSnackbarMessage('Failed to refresh data');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort hospital summaries
  const filteredSummaries = useMemo(() => {
    let filtered = [...hospitalSummaries];

    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.hospital_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterClassification !== 'all') {
      filtered = filtered.filter(h => h.classification === filterClassification);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'score') {
        return sortOrder === 'desc' 
          ? b.score_percentage - a.score_percentage
          : a.score_percentage - b.score_percentage;
      } else {
        return sortOrder === 'desc'
          ? b.hospital_number.localeCompare(a.hospital_number)
          : a.hospital_number.localeCompare(b.hospital_number);
      }
    });

    return filtered;
  }, [hospitalSummaries, searchTerm, filterClassification, sortBy, sortOrder]);

  // Pagination
  const paginatedSummaries = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredSummaries.slice(start, start + rowsPerPage);
  }, [filteredSummaries, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredSummaries.length / rowsPerPage);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = hospitalSummaries.length;
    const perfect = hospitalSummaries.filter(h => h.classification === 'Perfect Match').length;
    const low = hospitalSummaries.filter(h => h.classification === 'Low Discrepancy').length;
    const moderate = hospitalSummaries.filter(h => h.classification === 'Moderate Discrepancy').length;
    const high = hospitalSummaries.filter(h => h.classification === 'High Discrepancy').length;
    const critical = hospitalSummaries.filter(h => h.classification === 'Critical Issue').length;
    
    const avgScore = hospitalSummaries.reduce((acc, h) => acc + h.score_percentage, 0) / total || 0;

    return { total, perfect, low, moderate, high, critical, avgScore };
  }, [hospitalSummaries]);

  // Chart data preparation
  const classificationChartData = useMemo(() => [
    { name: 'Perfect Match', value: summaryStats.perfect, color: CLASSIFICATION_COLORS['Perfect Match'] },
    { name: 'Low Discrepancy', value: summaryStats.low, color: CLASSIFICATION_COLORS['Low Discrepancy'] },
    { name: 'Moderate Discrepancy', value: summaryStats.moderate, color: CLASSIFICATION_COLORS['Moderate Discrepancy'] },
    { name: 'High Discrepancy', value: summaryStats.high, color: CLASSIFICATION_COLORS['High Discrepancy'] },
    { name: 'Critical Issue', value: summaryStats.critical, color: CLASSIFICATION_COLORS['Critical Issue'] }
  ], [summaryStats]);

  const statusChartData = useMemo(() => 
    qualityMetrics?.status_breakdown 
      ? Object.entries(qualityMetrics.status_breakdown).map(([key, value]) => ({
          name: key.replace(/_/g, ' '),
          value
        }))
      : []
  , [qualityMetrics]);

  const dispensingChartData = useMemo(() => 
    qualityMetrics?.dispensing_patterns
      ? Object.entries(qualityMetrics.dispensing_patterns).map(([key, value]) => ({
          name: key.replace('_', ' '),
          value
        }))
      : []
  , [qualityMetrics]);

  // Get top 3 staff performers
  const topPerformers = useMemo(() => 
    [...staffPerformance].sort((a, b) => b.accuracy_rate - a.accuracy_rate).slice(0, 3)
  , [staffPerformance]);

  // Export data function
  const handleExportData = useCallback(() => {
    const data = {
      stats,
      qualityMetrics,
      hospitalSummaries,
      facilityDQI,
      staffPerformance,
      trends,
      duplicates,
      interruptions,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSnackbarMessage('Data exported successfully');
    setSnackbarOpen(true);
  }, [stats, qualityMetrics, hospitalSummaries, facilityDQI, staffPerformance, trends, duplicates, interruptions]);

  // Speed dial actions
  const speedDialActions = [
    { icon: <RefreshIcon />, name: 'Refresh', onClick: () => fetchData(true) },
    { icon: <DownloadIcon />, name: 'Export', onClick: handleExportData },
    { icon: <PrintIcon />, name: 'Print', onClick: () => window.print() },
    { icon: <ShareIcon />, name: 'Share', onClick: () => {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMessage('Link copied to clipboard');
      setSnackbarOpen(true);
    } }
  ];

  // Loading state
  if (loading && !stats && !qualityMetrics) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1800, mx: 'auto' }}>
        <Grid container spacing={3} alignItems="stretch">
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} md={6} key={`chart-${i}`}>
              <Skeleton variant="rounded" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => fetchData()}>
              Retry
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1800, mx: 'auto', pb: 8 }}>
      {/* Header with Breadcrumbs */}
      <Fade in timeout={500}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Breadcrumbs sx={{ mb: 1 }}>
                <Link href="#" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
                  <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  Home
                </Link>
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  Dashboard
                </Typography>
              </Breadcrumbs>
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                Data Quality Dashboard
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                <Chip
                  icon={<CalendarIcon />}
                  label={activeCycle?.name || 'No Active Cycle'}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                />
                <Tooltip title="Last data refresh">
                  <Chip
                    icon={<AccessTimeIcon />}
                    label={lastUpdated.toLocaleTimeString()}
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                </Tooltip>
                {activeCycle && (
                  <Chip
                    icon={<SpeedIcon />}
                    label={`Progress: ${stats?.progress_percentage || 0}%`}
                    color="success"
                    variant="outlined"
                    size={isMobile ? 'small' : 'medium'}
                  />
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Refresh Data">
                <IconButton 
                  onClick={() => fetchData(true)}
                  disabled={refreshing}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) },
                    width: 44,
                    height: 44
                  }}
                >
                  {refreshing ? <CircularProgress size={22} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data">
                <IconButton 
                  onClick={handleExportData}
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                    width: 44,
                    height: 44
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              {isMobile && (
                <IconButton onClick={() => setDrawerOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Key Metrics Grid - Enhanced with click handlers */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} width={300}>
          <MetricCard
            title="Total Patients"
            value={stats?.total_clients || 0}
            subtitle="Active in validation cycle"
            icon={<PeopleIcon />}
            color="primary"
            info="Total number of patients in current validation cycle"
            progress={stats?.progress_percentage}
            onClick={() => setActiveTab(1)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} width={300}>
          <MetricCard
            title="Validated"
            value={stats?.validated_clients || 0}
            subtitle={`${stats?.remaining || 0} remaining to validate`}
            icon={<VerifiedIcon />}
            color="success"
            info="Number of patients that have been validated"
            trend={stats?.progress_percentage}
            trendLabel={`${stats?.progress_percentage}% complete`}
            onClick={() => setActiveTab(1)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} width={300}>
          <MetricCard
            title="Data Quality Score"
            value={`${qualityMetrics?.overall_accuracy?.toFixed(1) || 0}%`}
            subtitle={`${qualityMetrics?.total_validations || 0} total validations`}
            icon={<RuleIcon />}
            color={qualityMetrics?.overall_accuracy >= 90 ? 'success' : qualityMetrics?.overall_accuracy >= 70 ? 'warning' : 'error'}
            info="Overall accuracy across all data validations"
            onClick={() => setActiveTab(4)}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} width={300}>
          <MetricCard
            title="Issues Found"
            value={(qualityMetrics?.status_breakdown?.MISMATCH || 0) + 
                   (qualityMetrics?.status_breakdown?.LOGICAL_ERROR || 0)}
            subtitle={`${qualityMetrics?.treatment_interruption_risk || 0} at treatment risk`}
            icon={<ReportProblemIcon />}
            color="error"
            info="Total mismatches and logical errors requiring attention"
            onClick={() => setActiveTab(5)}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Top Performers Banner */}
      {topPerformers.length > 0 && (
        <Paper sx={{ mb: 4, p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEventsIcon sx={{ color: theme.palette.warning.main }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Top Performers This Cycle
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              {topPerformers.map((performer, index) => (
                <Chip
                  key={performer.user_id}
                  avatar={
                    <Avatar sx={{ bgcolor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </Avatar>
                  }
                  label={`${performer.user_name} (${performer.accuracy_rate}%)`}
                  variant="outlined"
                  sx={{ borderColor: 'warning.main' }}
                />
              ))}
            </Stack>
          </Box>
        </Paper>
      )}

      {/* Tabs Navigation - Enhanced with badges */}
      <Paper sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            px: 2,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500
            }
          }}
        >
          <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" />
          <Tab 
            label="Hospital Scores" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
            icon={<Badge badgeContent={summaryStats.critical} color="error" variant="dot"><AssessmentIcon /></Badge>}
          />
          <Tab label="Facility Rankings" icon={<EmojiEventsIcon />} iconPosition="start" />
          <Tab label="Staff Performance" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<TimelineIcon />} iconPosition="start" />
          <Tab 
            label="Alerts" 
            icon={<NotificationsIcon />} 
            iconPosition="start"
            icon={
              <Badge 
                badgeContent={summaryStats.critical + interruptions.length + duplicates.length} 
                color="error"
                variant="dot"
              >
                <NotificationsIcon />
              </Badge>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Panels - Enhanced with better layouts */}
      <Box sx={{ minHeight: 500 }}>
        {/* Overview Tab - Enhanced with more insights */}
        {activeTab === 0 && (
          <Fade in timeout={500}>
            <Grid container spacing={4}>
              {/* Summary Stats Cards */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(CLASSIFICATION_COLORS['Perfect Match'], 0.08) }}>
                      <Typography variant="h4" sx={{ color: CLASSIFICATION_COLORS['Perfect Match'] }}>
                        <AnimatedNumber value={summaryStats.perfect} />
                      </Typography>
                      <Typography variant="caption">Perfect Match</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(CLASSIFICATION_COLORS['Low Discrepancy'], 0.08) }}>
                      <Typography variant="h4" sx={{ color: CLASSIFICATION_COLORS['Low Discrepancy'] }}>
                        <AnimatedNumber value={summaryStats.low} />
                      </Typography>
                      <Typography variant="caption">Low Discrepancy</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(CLASSIFICATION_COLORS['Moderate Discrepancy'], 0.08) }}>
                      <Typography variant="h4" sx={{ color: CLASSIFICATION_COLORS['Moderate Discrepancy'] }}>
                        <AnimatedNumber value={summaryStats.moderate} />
                      </Typography>
                      <Typography variant="caption">Moderate</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(CLASSIFICATION_COLORS['High Discrepancy'], 0.08) }}>
                      <Typography variant="h4" sx={{ color: CLASSIFICATION_COLORS['High Discrepancy'] }}>
                        <AnimatedNumber value={summaryStats.high} />
                      </Typography>
                      <Typography variant="caption">High</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4} md={2.4}>
                    <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(CLASSIFICATION_COLORS['Critical Issue'], 0.08) }}>
                      <Typography variant="h4" sx={{ color: CLASSIFICATION_COLORS['Critical Issue'] }}>
                        <AnimatedNumber value={summaryStats.critical} />
                      </Typography>
                      <Typography variant="caption">Critical</Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              {/* Status Distribution Chart */}
              <Grid item xs={12} md={6} width={800}>
                <Paper sx={{ p: 3, borderRadius: 2, height: 420 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Validation Status Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 50 : 70}
                        outerRadius={isMobile ? 80 : 110}
                        paddingAngle={3}
                        label={!isMobile ? ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%` : undefined}
                        labelLine={!isMobile}
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      {isMobile && <Legend />}
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Accuracy Trend Chart */}
              <Grid item xs={12} md={6} width={650}>
                <Paper sx={{ p: 3, borderRadius: 3, height: 420 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Accuracy Trend Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={340}>
                    <AreaChart data={trends}>
                      <defs>
                        <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} />
                      <XAxis 
                        dataKey="cycle_name" 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval={isMobile ? 1 : 0}
                      />
                      <YAxis domain={[0, 100]} />
                      <RechartsTooltip />
                      <Area 
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={3}
                        fill="url(#accuracyGradient)"
                        name="Accuracy %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Top Error Fields */}
              <Grid item xs={12} md={6} width={650}>
                <Paper sx={{ p: 3, borderRadius: 3, height: 420 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Top Error-Prone Fields
                  </Typography>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart 
                      data={qualityMetrics?.top_error_fields?.map(([field, count]) => ({
                        field: field.replace(/_/g, ' '),
                        errors: count
                      })) || []}
                      layout="vertical"
                      margin={{ left: isMobile ? 80 : 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="field" 
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={isMobile ? 80 : 100}
                      />
                      <RechartsTooltip />
                      <Bar dataKey="errors" fill={theme.palette.error.main} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* ARV Dispensing Patterns */}
              <Grid item xs={12} md={6} width={650}>
                <Paper sx={{ p: 3, borderRadius: 3, height: 420 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ARV Dispensing Patterns
                  </Typography>
                  <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={dispensingChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Recent Activity Timeline */}
              <Grid item xs={12} width={650}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent Validation Activity
                  </Typography>
                  <Timeline position="alternate">
                    <TimelineItem>
                      <TimelineOppositeContent color="text.secondary">
                        {new Date().toLocaleDateString()}
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot color="success">
                          <TaskAltIcon />
                        </TimelineDot>
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="body2" fontWeight="bold">
                          Validation Cycle Updated
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          New validation data synchronized
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                    {trends.slice(-3).reverse().map((trend, index) => (
                      <TimelineItem key={index}>
                        <TimelineOppositeContent color="text.secondary">
                          {new Date(trend.date).toLocaleDateString()}
                        </TimelineOppositeContent>
                        <TimelineSeparator>
                          <TimelineDot color={trend.accuracy >= 90 ? "success" : trend.accuracy >= 70 ? "warning" : "error"}>
                            <AssessmentIcon />
                          </TimelineDot>
                          {index < 2 && <TimelineConnector />}
                        </TimelineSeparator>
                        <TimelineContent>
                          <Typography variant="body2" fontWeight="bold">
                            {trend.cycle_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Accuracy: {trend.accuracy}% • {trend.total_validations} validations
                          </Typography>
                        </TimelineContent>
                      </TimelineItem>
                    ))}
                  </Timeline>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Hospital Scores Tab - Enhanced with view toggle */}
        {activeTab === 1 && (
          <Fade in timeout={500}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              {/* Filters and Search */}
              <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  size="small"
                  placeholder="Search hospital number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTerm('')}>
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{ minWidth: { xs: '100%', sm: 250 } }}
                />

                <FormControl size="small" sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }}>
                  <InputLabel>Classification</InputLabel>
                  <Select
                    value={filterClassification}
                    onChange={(e) => setFilterClassification(e.target.value)}
                    label="Classification"
                  >
                    <MenuItem value="all">All Classifications</MenuItem>
                    <MenuItem value="Perfect Match">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: CLASSIFICATION_COLORS['Perfect Match'] }} />
                        Perfect Match
                      </Box>
                    </MenuItem>
                    <MenuItem value="Low Discrepancy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: CLASSIFICATION_COLORS['Low Discrepancy'] }} />
                        Low Discrepancy
                      </Box>
                    </MenuItem>
                    <MenuItem value="Moderate Discrepancy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: CLASSIFICATION_COLORS['Moderate Discrepancy'] }} />
                        Moderate Discrepancy
                      </Box>
                    </MenuItem>
                    <MenuItem value="High Discrepancy">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: CLASSIFICATION_COLORS['High Discrepancy'] }} />
                        High Discrepancy
                      </Box>
                    </MenuItem>
                    <MenuItem value="Critical Issue">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: CLASSIFICATION_COLORS['Critical Issue'] }} />
                        Critical Issue
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <ToggleButtonGroup
                  size="small"
                  value={sortBy === 'score' ? 'score' : 'hospital'}
                  exclusive
                  onChange={(_, value) => value && setSortBy(value as 'score' | 'hospital')}
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <ToggleButton value="score">Sort by Score</ToggleButton>
                  <ToggleButton value="hospital">Sort by Hospital</ToggleButton>
                </ToggleButtonGroup>

                <ButtonGroup size="small" variant="outlined" sx={{ display: { xs: 'none', sm: 'flex' } }}>
                  <Button
                    onClick={() => setSortOrder('desc')}
                    color={sortOrder === 'desc' ? 'primary' : 'inherit'}
                    startIcon={<ArrowDownwardIcon fontSize="small" />}
                  >
                    Desc
                  </Button>
                  <Button
                    onClick={() => setSortOrder('asc')}
                    color={sortOrder === 'asc' ? 'primary' : 'inherit'}
                    startIcon={<ArrowUpwardIcon fontSize="small" />}
                  >
                    Asc
                  </Button>
                </ButtonGroup>

                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  sx={{ ml: 'auto' }}
                >
                  <ToggleButton value="cards">
                    <DashboardIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="table">
                    <TableChartIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>

                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {filteredSummaries.length} records
                </Typography>
              </Box>

              {/* Summary Stats Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4} sm={2.4}>
                  <Card sx={{ bgcolor: alpha(CLASSIFICATION_COLORS['Perfect Match'], 0.1), textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h5" sx={{ color: CLASSIFICATION_COLORS['Perfect Match'] }}>
                      {summaryStats.perfect}
                    </Typography>
                    <Typography variant="caption">Perfect</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Card sx={{ bgcolor: alpha(CLASSIFICATION_COLORS['Low Discrepancy'], 0.1), textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h5" sx={{ color: CLASSIFICATION_COLORS['Low Discrepancy'] }}>
                      {summaryStats.low}
                    </Typography>
                    <Typography variant="caption">Low</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Card sx={{ bgcolor: alpha(CLASSIFICATION_COLORS['Moderate Discrepancy'], 0.1), textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h5" sx={{ color: CLASSIFICATION_COLORS['Moderate Discrepancy'] }}>
                      {summaryStats.moderate}
                    </Typography>
                    <Typography variant="caption">Moderate</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Card sx={{ bgcolor: alpha(CLASSIFICATION_COLORS['High Discrepancy'], 0.1), textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h5" sx={{ color: CLASSIFICATION_COLORS['High Discrepancy'] }}>
                      {summaryStats.high}
                    </Typography>
                    <Typography variant="caption">High</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4} sm={2.4}>
                  <Card sx={{ bgcolor: alpha(CLASSIFICATION_COLORS['Critical Issue'], 0.1), textAlign: 'center', py: 1.5 }}>
                    <Typography variant="h5" sx={{ color: CLASSIFICATION_COLORS['Critical Issue'] }}>
                      {summaryStats.critical}
                    </Typography>
                    <Typography variant="caption">Critical</Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Hospital Cards/Table View */}
              {viewMode === 'cards' ? (
                <Grid container spacing={2}>
                  {paginatedSummaries.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
                      <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary">No hospitals match your filters</Typography>
                    </Box>
                  ) : (
                    paginatedSummaries.map((summary) => (
                      <Grid item xs={12} key={summary.hospital_number}>
                        <Accordion
                          expanded={expandedHospital === summary.hospital_number}
                          onChange={() => setExpandedHospital(
                            expandedHospital === summary.hospital_number ? null : summary.hospital_number
                          )}
                          sx={{
                            borderRadius: 2,
                            '&:before': { display: 'none' },
                            border: '1px solid',
                            borderColor: alpha(summary.color_code, 0.2),
                            transition: 'all 0.3s',
                            '&:hover': {
                              borderColor: alpha(summary.color_code, 0.5),
                              boxShadow: `0 4px 12px ${alpha(summary.color_code, 0.1)}`
                            }
                          }}
                        >
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container alignItems="center" spacing={2} sx={{ width: '100%' }}>
                              <Grid item xs={12} sm={2} md={1}>
                                <ScoreGauge score={summary.score_percentage} size={50} />
                              </Grid>
                              <Grid item xs={12} sm={3} md={2}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {summary.hospital_number}
                                </Typography>
                                <ClassificationChip classification={summary.classification} size="small" />
                              </Grid>
                              <Grid item xs={6} sm={2} md={1}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Checks
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {summary.passed_checks}/{summary.total_checks}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} sm={2} md={1}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  Status
                                </Typography>
                                <StatusChip status={summary.validation_status} size="small" />
                              </Grid>
                              <Grid item xs={12} sm={3} md={5}>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {summary.failed_fields.slice(0, 3).map((field, i) => (
                                    <Chip
                                      key={i}
                                      label={field.field_name.replace(/_/g, ' ')}
                                      size="small"
                                      sx={{
                                        bgcolor: alpha(STATUS_COLORS[field.status as keyof typeof STATUS_COLORS], 0.1),
                                        color: STATUS_COLORS[field.status as keyof typeof STATUS_COLORS],
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  ))}
                                  {summary.failed_fields.length > 3 && (
                                    <Chip
                                      label={`+${summary.failed_fields.length - 3}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Grid>
                              <Grid item xs={12} sm={2} md={2}>
                                <LinearProgress
                                  variant="determinate"
                                  value={summary.score_percentage}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: alpha(summary.color_code, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: summary.color_code,
                                      borderRadius: 3
                                    }
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                              Failed Validations ({summary.failed_fields.length})
                            </Typography>
                            <Grid container spacing={1}>
                              {summary.failed_fields.map((field, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                  <Card variant="outlined" sx={{ p: 1.5 }}>
                                    <Typography variant="caption" fontWeight="bold" display="block">
                                      {field.field_name.replace(/_/g, ' ')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      RADET: {field.radet_value || '—'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Card: {field.care_card_value || '—'}
                                    </Typography>
                                    <StatusChip status={field.status} size="small" />
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                onClick={() => {
                                  setSelectedHospital(summary);
                                  setDetailsDialogOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    ))
                  )}
                </Grid>
              ) : (
                <TableContainer>
                  <Table size={isMobile ? 'small' : 'medium'}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell>Hospital</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Passed/Total</TableCell>
                        <TableCell align="center">Status</TableCell>
                        <TableCell>Issues</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSummaries.map((summary) => (
                        <TableRow 
                          key={summary.hospital_number}
                          sx={{ 
                            '&:hover': { bgcolor: alpha(summary.color_code, 0.05) },
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setSelectedHospital(summary);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <TableCell>
                            <Typography fontWeight="medium">{summary.hospital_number}</Typography>
                            <ClassificationChip classification={summary.classification} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <ScoreGauge score={summary.score_percentage} size={40} showLabel={false} />
                            <Typography variant="caption" display="block">
                              {summary.score_percentage}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography fontWeight="bold">
                              {summary.passed_checks}/{summary.total_checks}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <StatusChip status={summary.validation_status} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {summary.failed_fields.slice(0, 2).map((field, i) => (
                                <Chip
                                  key={i}
                                  label={field.field_name.replace(/_/g, ' ')}
                                  size="small"
                                  sx={{ fontSize: '0.65rem' }}
                                />
                              ))}
                              {summary.failed_fields.length > 2 && (
                                <Chip label={`+${summary.failed_fields.length - 2}`} size="small" variant="outlined" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHospital(summary);
                              setDetailsDialogOpen(true);
                            }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton={!isMobile}
                    showLastButton={!isMobile}
                  />
                </Box>
              )}
            </Paper>
          </Fade>
        )}

        {/* Facility Rankings Tab - Enhanced with visual indicators */}
        {activeTab === 2 && (
          <Fade in timeout={500}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Facility Data Quality Index (DQI) Rankings
              </Typography>
              
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="body2" color="text.secondary">
                      Overall DQI Across All Facilities
                    </Typography>
                    <Typography variant="h3" sx={{ color: 'primary.main' }}>
                      {facilityDQI.length > 0 
                        ? Math.round(facilityDQI.reduce((acc, f) => acc + f.dqi_score, 0) / facilityDQI.length)
                        : 0}%
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" color="text.secondary">
                      Based on {facilityDQI.reduce((acc, f) => acc + f.total_patients_validated, 0)} patients validated
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell>Rank</TableCell>
                      <TableCell>Facility</TableCell>
                      <TableCell align="center">Patients</TableCell>
                      <TableCell align="center">Pass Rate</TableCell>
                      <TableCell align="center">DQI Score</TableCell>
                      <TableCell align="center">Classification Breakdown</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {facilityDQI.map((facility, index) => {
                      const totalClassifications = Object.values(facility.classification_breakdown).reduce((a, b) => a + b, 0);
                      return (
                        <TableRow key={facility.facility_name}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {index === 0 && <EmojiEventsIcon sx={{ color: '#ffd700', fontSize: 24 }} />}
                              {index === 1 && <EmojiEventsIcon sx={{ color: '#c0c0c0', fontSize: 24 }} />}
                              {index === 2 && <EmojiEventsIcon sx={{ color: '#cd7f32', fontSize: 24 }} />}
                              {index > 2 && (
                                <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                  {index + 1}
                                </Avatar>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">{facility.facility_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Code: {facility.facility_code}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{facility.total_patients_validated}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={`${facility.total_passed_checks}/${facility.total_expected_checks} checks passed`}>
                              <LinearProgress
                                variant="determinate"
                                value={(facility.total_passed_checks / facility.total_expected_checks) * 100}
                                sx={{
                                  width: 100,
                                  height: 6,
                                  borderRadius: 3,
                                  bgcolor: alpha(facility.color_code, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: facility.color_code,
                                    borderRadius: 3
                                  }
                                }}
                              />
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Typography 
                              fontWeight="bold"
                              sx={{ color: facility.color_code, fontSize: '1.25rem' }}
                            >
                              {facility.dqi_score}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {Object.entries(facility.classification_breakdown).map(([key, value]) => (
                                <Tooltip key={key} title={`${key}: ${value} (${((value / totalClassifications) * 100).toFixed(0)}%)`}>
                                  <Box
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      borderRadius: 1,
                                      bgcolor: CLASSIFICATION_COLORS[key as keyof typeof CLASSIFICATION_COLORS],
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      color: 'white'
                                    }}
                                  >
                                    {value}
                                  </Box>
                                </Tooltip>
                              ))}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        )}

        {/* Staff Performance Tab - Enhanced with more metrics */}
        {activeTab === 3 && (
          <Fade in timeout={500}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Staff Performance Leaderboard
              </Typography>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell>Staff Member</TableCell>
                      <TableCell align="center">Patients</TableCell>
                      <TableCell align="center">Validations</TableCell>
                      <TableCell align="center">Mismatches</TableCell>
                      <TableCell align="center">Logical Errors</TableCell>
                      <TableCell align="center">Accuracy</TableCell>
                      <TableCell align="center">Rating</TableCell>
                      <TableCell align="center">Trend</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffPerformance
                      .sort((a, b) => b.accuracy_rate - a.accuracy_rate)
                      .map((staff, index) => {
                        const accuracyTrend = staff.accuracy_rate - (staffPerformance.find(s => s.user_id === staff.user_id)?.accuracy_rate || 0);
                        return (
                          <TableRow key={staff.user_id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar 
                                  sx={{ 
                                    width: 40, 
                                    height: 40,
                                    bgcolor: index === 0 ? 'warning.main' : 
                                            index === 1 ? 'info.main' : 
                                            index === 2 ? 'success.main' : 
                                            alpha(theme.palette.primary.main, 0.1)
                                  }}
                                >
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : staff.user_name.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography fontWeight="medium">{staff.user_name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    ID: {staff.user_id}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography fontWeight="medium">{staff.patients_validated}</Typography>
                            </TableCell>
                            <TableCell align="center">{staff.total_validations}</TableCell>
                            <TableCell align="center">
                              <Chip 
                                size="small"
                                label={staff.mismatches_found}
                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip 
                                size="small"
                                label={staff.logical_errors_found}
                                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.main' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography 
                                fontWeight="bold"
                                color={staff.accuracy_rate >= 95 ? 'success.main' : 
                                       staff.accuracy_rate >= 85 ? 'warning.main' : 'error.main'}
                              >
                                {staff.accuracy_rate}%
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Rating 
                                value={staff.accuracy_rate / 20} 
                                readOnly 
                                size="small"
                                sx={{ color: staff.accuracy_rate >= 90 ? 'success.main' : 'warning.main' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {accuracyTrend !== 0 && (
                                <Chip
                                  size="small"
                                  icon={accuracyTrend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                  label={`${Math.abs(accuracyTrend)}%`}
                                  color={accuracyTrend > 0 ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Fade>
        )}

        {/* Analytics Tab - Enhanced with more visualizations */}
        {activeTab === 4 && (
          <Fade in timeout={500}>
            <Grid container spacing={4}>
              {/* Duplicates Alert */}
              {duplicates.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'warning.main' }}>
                      Potential Duplicate Patients
                    </Typography>
                    <List>
                      {duplicates.slice(0, 5).map((dup, index) => (
                        <ListItem key={index} divider={index < 4}>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <strong>{dup.original}</strong> ←→ <strong>{dup.duplicate}</strong>
                              </Typography>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={dup.confidence * 100}
                                  sx={{ width: 100, height: 4, borderRadius: 2 }}
                                />
                                <Typography variant="caption">
                                  {Math.round(dup.confidence * 100)}% match confidence
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                    {duplicates.length > 5 && (
                      <Button size="small" fullWidth sx={{ mt: 1 }}>
                        View all {duplicates.length} duplicates
                      </Button>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* Treatment Interruptions */}
              {interruptions.length > 0 && (
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'error.main' }}>
                      Treatment Interruptions at Risk
                    </Typography>
                    <List>
                      {interruptions.slice(0, 5).map((interruption, index) => (
                        <ListItem key={index} divider={index < 4}>
                          <ListItemIcon>
                            <PriorityHighIcon color="error" />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="body2">
                                <strong>{interruption.hospital_number}</strong>
                              </Typography>
                            }
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  Last pickup: {interruption.last_pickup_date || 'N/A'}
                                </Typography>
                                {interruption.days_since_pickup && (
                                  <Typography variant="caption" color="error">
                                    {interruption.days_since_pickup} days overdue
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Chip
                            label={interruption.risk_level}
                            size="small"
                            color={interruption.risk_level === 'HIGH' ? 'error' : 'warning'}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {interruptions.length > 5 && (
                      <Button size="small" fullWidth sx={{ mt: 1 }}>
                        View all {interruptions.length} at-risk patients
                      </Button>
                    )}
                  </Paper>
                </Grid>
              )}

              {/* ARV Analysis */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ARV Dispensing Analysis
                  </Typography>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                      <Card sx={{ p: 3, bgcolor: alpha(theme.palette.info.main, 0.05), textAlign: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Average Months Dispensed
                        </Typography>
                        <Typography variant="h2" color="info.main" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>
                          {qualityMetrics?.average_months_dispensed?.toFixed(1) || 'N/A'}
                        </Typography>
                        <Typography variant="caption">months per pickup</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Missing VL Results
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {qualityMetrics?.missing_vl_results || 0}
                        </Typography>
                        <Typography variant="caption">patients</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dispensingChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill={theme.palette.info.main} radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Quality Trends */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quality Metrics Over Time
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="cycle_name" tick={{ fontSize: isMobile ? 10 : 12 }} />
                      <YAxis yAxisId="left" domain={[0, 100]} />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="accuracy" 
                        stroke={theme.palette.primary.main} 
                        strokeWidth={2}
                        name="Accuracy %"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="total_validations" 
                        stroke={theme.palette.success.main} 
                        strokeWidth={2}
                        name="Validations"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Alerts Tab - Enhanced with severity ordering */}
        {activeTab === 5 && (
          <Fade in timeout={500}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Active Alerts & Notifications
              </Typography>
              
              <Stack spacing={2}>
                {/* Critical Issues */}
                {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length > 0 && (
                  <Zoom in timeout={300}>
                    <Alert 
                      severity="error"
                      icon={<ErrorIcon />}
                      action={
                        <Button color="inherit" size="small" onClick={() => setActiveTab(1)}>
                          View Details
                        </Button>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      <AlertTitle>Critical Issues Detected</AlertTitle>
                      {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length} hospitals have critical data quality issues requiring immediate attention.
                    </Alert>
                  </Zoom>
                )}

                {/* Treatment Interruptions */}
                {interruptions.length > 0 && (
                  <Zoom in timeout={400}>
                    <Alert 
                      severity="warning"
                      icon={<WarningIcon />}
                      action={
                        <Button color="inherit" size="small" onClick={() => setActiveTab(4)}>
                          Review Patients
                        </Button>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      <AlertTitle>Treatment Interruption Risk</AlertTitle>
                      {interruptions.length} patients are at risk of treatment interruption. 
                      {interruptions.filter(i => i.risk_level === 'HIGH').length} require immediate follow-up.
                    </Alert>
                  </Zoom>
                )}

                {/* Duplicates */}
                {duplicates.length > 0 && (
                  <Zoom in timeout={500}>
                    <Alert 
                      severity="warning"
                      icon={<WarningAmberIcon />}
                      action={
                        <Button color="inherit" size="small" onClick={() => setActiveTab(4)}>
                          Review Duplicates
                        </Button>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      <AlertTitle>Potential Duplicate Records</AlertTitle>
                      {duplicates.length} potential duplicate patient records detected. 
                      {duplicates.filter(d => d.confidence > 0.9).length} have high confidence matches.
                    </Alert>
                  </Zoom>
                )}

                {/* Missing VL Results */}
                {(qualityMetrics?.missing_vl_results || 0) > 0 && (
                  <Zoom in timeout={600}>
                    <Alert 
                      severity="info" 
                      icon={<InfoIcon />}
                      action={
                        <Button color="inherit" size="small" onClick={() => setActiveTab(4)}>
                          View Details
                        </Button>
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      <AlertTitle>Missing Viral Load Results</AlertTitle>
                      {qualityMetrics?.missing_vl_results} patients are missing recent viral load results. Consider following up for updated lab results.
                    </Alert>
                  </Zoom>
                )}

                {/* Low Data Quality Score */}
                {qualityMetrics?.overall_accuracy && qualityMetrics.overall_accuracy < 70 && (
                  <Zoom in timeout={700}>
                    <Alert 
                      severity="warning" 
                      icon={<AssessmentIcon />}
                      sx={{ borderRadius: 2 }}
                    >
                      <AlertTitle>Low Overall Data Quality</AlertTitle>
                      Overall data quality score is {qualityMetrics.overall_accuracy}%. Review top error fields to identify improvement opportunities.
                    </Alert>
                  </Zoom>
                )}

                {/* No Alerts */}
                {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length === 0 &&
                 interruptions.length === 0 &&
                 duplicates.length === 0 &&
                 (qualityMetrics?.missing_vl_results || 0) === 0 &&
                 qualityMetrics?.overall_accuracy && qualityMetrics.overall_accuracy >= 70 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <TaskAltIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" color="success.main" gutterBottom>
                      All Clear!
                    </Typography>
                    <Typography color="text.secondary">
                      No active alerts at this time. Your data quality metrics are looking good!
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Fade>
        )}
      </Box>

      {/* Hospital Details Dialog - Enhanced with more details */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        fullScreen={isMobile}
      >
        {selectedHospital && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(selectedHospital.color_code, 0.1), color: selectedHospital.color_code, width: 48, height: 48 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedHospital.hospital_number}</Typography>
                    <ClassificationChip classification={selectedHospital.classification} />
                  </Box>
                </Box>
                <IconButton onClick={() => setDetailsDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={4}>
                {/* Score Overview */}
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ScoreGauge score={selectedHospital.score_percentage} size={140} />
                    <Typography variant="h3" sx={{ mt: 2, color: selectedHospital.color_code }}>
                      {selectedHospital.score_percentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Data Quality Score
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Validation Status
                    </Typography>
                    <StatusChip status={selectedHospital.validation_status} size="medium" />
                  </Box>
                </Grid>

                {/* Stats */}
                <Grid item xs={12} md={8}>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <Typography variant="h4" color="success.main">
                          {selectedHospital.passed_checks}
                        </Typography>
                        <Typography variant="caption">Passed Checks</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                        <Typography variant="h4" color="error.main">
                          {selectedHospital.failed_checks}
                        </Typography>
                        <Typography variant="caption">Failed Checks</Typography>
                      </Card>
                    </Grid>
                    <Grid item xs={4}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h4" color="info.main">
                          {selectedHospital.total_checks}
                        </Typography>
                        <Typography variant="caption">Total Checks</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Failed Fields */}
                {selectedHospital.failed_fields.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Failed Validations ({selectedHospital.failed_fields.length})
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>RADET Value</TableCell>
                            <TableCell>Care Card Value</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedHospital.failed_fields.map((field, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Typography fontWeight="medium">
                                  {field.field_name.replace(/_/g, ' ')}
                                </Typography>
                                {field.logical_error && (
                                  <Chip
                                    size="small"
                                    label="Logical Error"
                                    color="error"
                                    variant="outlined"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>
                                {field.radet_value || '—'}
                              </TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>
                                {field.care_card_value || '—'}
                              </TableCell>
                              <TableCell>
                                <StatusChip status={field.status} size="small" />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={() => {
                const data = JSON.stringify(selectedHospital, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `hospital-${selectedHospital.hospital_number}-details.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}>
                Export Report
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
        open={speedDialOpen}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.onClick();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            Navigation
          </Typography>
          <List>
            {['Overview', 'Hospital Scores', 'Facility Rankings', 'Staff Performance', 'Analytics', 'Alerts'].map((text, index) => (
              <ListItemButton
                key={text}
                selected={activeTab === index}
                onClick={() => {
                  setActiveTab(index);
                  setDrawerOpen(false);
                }}
              >
                <ListItemIcon>
                  {index === 0 && <DashboardIcon />}
                  {index === 1 && <AssessmentIcon />}
                  {index === 2 && <EmojiEventsIcon />}
                  {index === 3 && <PeopleIcon />}
                  {index === 4 && <TimelineIcon />}
                  {index === 5 && <NotificationsIcon />}
                </ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}