import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  AlertTitle,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Badge,
  FormControlLabel,
  Checkbox,
  Pagination,
  Skeleton,
  Menu,
  Breadcrumbs,
  Link,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Rating,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  StepConnector,
  stepConnectorClasses,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ButtonGroup,
  ListItemButton,
  CircularProgress,
  styled
} from '@mui/material';

// Icons - Single import block with all needed icons
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MedicalServices as MedicalIcon,
  Science as ScienceIcon,
  Bloodtype as BloodtypeIcon,
  Vaccines as VaccinesIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HighlightOff as HighlightOffIcon,
  Info as InfoIcon,
  Timeline as TimelineIcon,
  FolderOpen as FolderOpenIcon,
  Description as DescriptionIcon,
  Help as HelpIcon,
  Verified as VerifiedIcon,
  WarningAmber as WarningAmberIcon,
  ErrorOutline as ErrorOutlineIcon,
  TaskAlt as TaskAltIcon,
  Pending as PendingIcon,
  Schedule as ScheduleIcon,
  AccessTime as AccessTimeIcon,
  Biotech as BiotechIcon,
  Medication as MedicationIcon,
  MonitorHeart as MonitorHeartIcon,
  Checklist as ChecklistIcon,
  CompareArrows as CompareArrowsIcon,
  DoneAll as DoneAllIcon,
  ReportProblem as ReportProblemIcon,
  PublishedWithChanges as PublishedWithChangesIcon,
  Rule as RuleIcon,
  HowToReg as HowToRegIcon,
  Update as UpdateIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TableChart as TableChartIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  ViewStream as ViewStreamIcon,
  Sort as SortIcon,
  Merge as MergeIcon,
  CallSplit as CallSplitIcon,
  OpenInNew as OpenInNewIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUpAlt as ThumbUpAltIcon,
  ThumbDownAlt as ThumbDownAltIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  IndeterminateCheckBox as IndeterminateCheckBoxIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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
  Scatter
} from 'recharts';
import { supervisor, validation, analytics, dashboard, validationSummaries } from '../api';
import type { 
  User, 
  ValidationResult, 
  CorrectionLog, 
  PendingReview,
  HospitalNumberValidationSummary,
  DataQualityIndexResponse,
  FacilityRankingResponse,
  ExistingValidationResponse,
  ValidationStatusResponse
} from '../types';

// ==================== INTERFACES ====================

interface SupervisorModuleProps {
  user: User;
}

interface CorrectionRequest extends CorrectionLog {
  requested_by_name?: string;
  approved_by_name?: string;
  days_pending?: number;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface PatientSummary {
  hospital_number: string;
  total_validations: number;
  matches: number;
  mismatches: number;
  logical_errors: number;
  accuracy_rate: number;
  classification?: string;
  color_code?: string;
  last_validation: string;
  risk_level: 'low' | 'medium' | 'high';
  trend: 'up' | 'down' | 'stable';
  months_of_arv_dispensed?: number | null;
  last_drug_pickup?: string | null;
  next_refill_due?: string | null;
}

interface DashboardStats {
  pending_reviews: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  logical_errors: number;
  pending_corrections: number;
  total_patients_validated: number;
  overall_accuracy: number;
  avg_response_time?: string;
  facilities_count: number;
  critical_issues: number;
}

interface TreatmentInterruption {
  hospital_number: string;
  last_pickup_date: string | null;
  days_since_pickup: number;
  risk_level: string;
  months_of_arv_dispensed: number | null;
}

interface DuplicateRecord {
  original: string;
  duplicate: string;
  confidence: number;
}

interface ArvDispensingPatterns {
  dispensing_patterns: Record<string, number>;
  average_months_dispensed: number;
  total_patients_with_data: number;
  recommendations: {
    default_dispensing: string;
    adherence_risk_patients: number;
    next_expected_refill: string;
    supply_planning: string;
  };
}

interface RefillScheduleItem {
  hospital_number: string;
  last_pickup_date: string;
  months_dispensed: number;
  expected_run_out_date: string;
  days_until_refill_needed: number;
  priority: string;
}

// ==================== STYLED COMPONENTS ====================

const GlassPaper = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: '1px solid',
  borderColor: alpha(theme.palette.primary.main, 0.1),
}));

const ColorfulConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderRadius: 1,
  },
}));

const ColorfulStepIcon = (props: { active?: boolean; completed?: boolean; icon: React.ReactNode }) => {
  const { active, completed, icon } = props;
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: active 
          ? theme.palette.primary.main 
          : completed 
            ? theme.palette.success.main 
            : alpha(theme.palette.grey[500], 0.2),
        color: active || completed ? '#fff' : theme.palette.text.secondary,
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'all 0.3s',
        boxShadow: active ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}` : 'none',
      }}
    >
      {completed ? <CheckCircleIcon fontSize="small" /> : icon}
    </Box>
  );
};

// ==================== CONSTANTS ====================

const PRIORITY_COLORS = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'info'
} as const;

const STATUS_COLORS = {
  MATCH: 'success',
  MISMATCH: 'error',
  LOGICAL_ERROR: 'error',
  MISSING_IN_RADET: 'warning',
  MISSING_IN_CARD: 'warning',
  UPDATED_RECORD: 'info'
} as const;

const RISK_COLORS = {
  high: 'error',
  medium: 'warning',
  low: 'success'
} as const;

const TREND_ICONS = {
  up: <TrendingUpIcon />,
  down: <TrendingDownIcon />,
  stable: <TrendingFlatIcon />
} as const;

const CLASSIFICATION_COLORS = {
  'Perfect Match': '#10b981',
  'Low Discrepancy': '#84cc16',
  'Moderate Discrepancy': '#eab308',
  'High Discrepancy': '#f97316',
  'Critical Issue': '#ef4444'
} as const;

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

// ==================== STATS CARD COMPONENT ====================

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
}

const StatsCard = ({ title, value, subtitle, icon, color = 'primary', trend, trendLabel, onClick }: StatsCardProps) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend > 0) return <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main }} />;
    if (trend < 0) return <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main }} />;
    return <TrendingFlatIcon fontSize="small" sx={{ color: theme.palette.text.secondary }} />;
  };

  return (
    <Zoom in timeout={500}>
      <Card 
        sx={{ 
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.3s, box-shadow 0.3s',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8]
          } : {},
          '&::before': onClick ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].light})`,
          } : {}
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(theme.palette[color].main, 0.1),
                color: theme.palette[color].main,
                width: 48,
                height: 48,
                borderRadius: 2
              }}
            >
              {icon}
            </Avatar>
            {(trend !== undefined || trendLabel) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getTrendIcon()}
                <Typography variant="caption" color="text.secondary">
                  {trendLabel || `${Math.abs(trend || 0)}%`}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Zoom>
  );
};

// ==================== FILTER BAR COMPONENT ====================

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string[];
  onStatusFilterChange: (statuses: string[]) => void;
  priorityFilter: string[];
  onPriorityFilterChange: (priorities: string[]) => void;
  classificationFilter: string[];
  onClassificationFilterChange: (classifications: string[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: () => void;
  viewMode: 'table' | 'grid' | 'compact';
  onViewModeChange: (mode: 'table' | 'grid' | 'compact') => void;
  totalCount: number;
  onExport?: () => void;
  onPrint?: () => void;
}

const FilterBar = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  classificationFilter,
  onClassificationFilterChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  viewMode,
  onViewModeChange,
  totalCount,
  onExport,
  onPrint
}: FilterBarProps) => {
  const theme = useTheme();
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [viewAnchorEl, setViewAnchorEl] = useState<null | HTMLElement>(null);

  const statusOptions = ['MATCH', 'MISMATCH', 'LOGICAL_ERROR', 'MISSING_IN_RADET', 'MISSING_IN_CARD', 'UPDATED_RECORD'];
  const priorityOptions = ['HIGH', 'MEDIUM', 'LOW'];
  const classificationOptions = ['Perfect Match', 'Low Discrepancy', 'Moderate Discrepancy', 'High Discrepancy', 'Critical Issue'];
  const sortOptions = [
    { value: 'hospital_number', label: 'Hospital Number' },
    { value: 'priority', label: 'Priority' },
    { value: 'validation_date', label: 'Validation Date' },
    { value: 'accuracy', label: 'Accuracy' },
    { value: 'classification', label: 'Classification' },
    { value: 'risk_level', label: 'Risk Level' }
  ];

  const activeFilterCount = statusFilter.length + priorityFilter.length + classificationFilter.length;

  return (
    <GlassPaper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by hospital number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${totalCount} records`}
              variant="outlined"
              size="small"
              sx={{ borderRadius: 1.5 }}
            />
            {activeFilterCount > 0 && (
              <Chip
                label={`${activeFilterCount} active filters`}
                onDelete={() => {
                  onStatusFilterChange([]);
                  onPriorityFilterChange([]);
                  onClassificationFilterChange([]);
                  onDateRangeChange({ start: null, end: null });
                }}
                size="small"
                color="primary"
                sx={{ borderRadius: 1.5 }}
              />
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="View Options">
              <IconButton 
                onClick={(e) => setViewAnchorEl(e.currentTarget)} 
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                {viewMode === 'table' ? <TableChartIcon /> : 
                 viewMode === 'grid' ? <ViewModuleIcon /> : 
                 <ViewStreamIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Toggle Sort Order">
              <IconButton 
                onClick={onSortOrderChange} 
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                {sortOrder === 'asc' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              </IconButton>
            </Tooltip>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                label="Sort By"
                sx={{ borderRadius: 2 }}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={(e) => setFilterAnchorEl(e.currentTarget)}
              sx={{ borderRadius: 2 }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  color="primary" 
                  badgeContent={activeFilterCount}
                  sx={{ ml: 1 }}
                />
              )}
            </Button>
            
            {onExport && (
              <Tooltip title="Export Data">
                <IconButton 
                  onClick={onExport}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {onPrint && (
              <Tooltip title="Print View">
                <IconButton 
                  onClick={onPrint}
                  size="small"
                  sx={{ 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Refresh">
              <IconButton 
                onClick={() => window.location.reload()}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>

      {/* View Mode Menu */}
      <Menu
        anchorEl={viewAnchorEl}
        open={Boolean(viewAnchorEl)}
        onClose={() => setViewAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, mt: 1 } }}
      >
        <MenuItem 
          onClick={() => { onViewModeChange('table'); setViewAnchorEl(null); }}
          selected={viewMode === 'table'}
        >
          <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Table View</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onViewModeChange('grid'); setViewAnchorEl(null); }}
          selected={viewMode === 'grid'}
        >
          <ListItemIcon><ViewModuleIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Grid View</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => { onViewModeChange('compact'); setViewAnchorEl(null); }}
          selected={viewMode === 'compact'}
        >
          <ListItemIcon><ViewStreamIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Compact View</ListItemText>
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          sx: { width: 360, p: 2, maxHeight: 600, borderRadius: 2 }
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ px: 1 }}>
          Filter by Status
        </Typography>
        <Box sx={{ mb: 2, px: 1 }}>
          <Grid container spacing={1}>
            {statusOptions.map(status => (
              <Grid size={{ xs: 6 }} key={status}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={statusFilter.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onStatusFilterChange([...statusFilter, status]);
                        } else {
                          onStatusFilterChange(statusFilter.filter(s => s !== status));
                        }
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">{status.replace(/_/g, ' ')}</Typography>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ px: 1 }}>
          Filter by Priority
        </Typography>
        <Box sx={{ mb: 2, px: 1 }}>
          <Grid container spacing={1}>
            {priorityOptions.map(priority => (
              <Grid size={{ xs: 4 }} key={priority}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={priorityFilter.includes(priority)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onPriorityFilterChange([...priorityFilter, priority]);
                        } else {
                          onPriorityFilterChange(priorityFilter.filter(p => p !== priority));
                        }
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Chip 
                      label={priority} 
                      size="small"
                      color={PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS]}
                      sx={{ height: 20, fontSize: '0.625rem' }}
                    />
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ px: 1 }}>
          Filter by Classification
        </Typography>
        <Box sx={{ mb: 2, px: 1 }}>
          <Grid container spacing={1}>
            {classificationOptions.map(classification => (
              <Grid size={{ xs: 12 }} key={classification}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={classificationFilter.includes(classification)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onClassificationFilterChange([...classificationFilter, classification]);
                        } else {
                          onClassificationFilterChange(classificationFilter.filter(c => c !== classification));
                        }
                      }}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%',
                          bgcolor: CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS]
                        }} 
                      />
                      <Typography variant="body2">{classification}</Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ px: 1 }}>
          Date Range
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Start Date"
            value={dateRange.start}
            onChange={(date) => onDateRangeChange({ ...dateRange, start: date })}
            slotProps={{ 
              textField: { 
                size: 'small', 
                fullWidth: true, 
                sx: { mb: 1, px: 1 } 
              } 
            }}
          />
          <DatePicker
            label="End Date"
            value={dateRange.end}
            onChange={(date) => onDateRangeChange({ ...dateRange, end: date })}
            slotProps={{ 
              textField: { 
                size: 'small', 
                fullWidth: true, 
                sx: { mt: 1, px: 1 } 
              } 
            }}
          />
        </LocalizationProvider>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, px: 1 }}>
          <Button 
            size="small" 
            variant="outlined"
            onClick={() => {
              onStatusFilterChange([]);
              onPriorityFilterChange([]);
              onClassificationFilterChange([]);
              onDateRangeChange({ start: null, end: null });
            }}
            sx={{ borderRadius: 2 }}
          >
            Clear All
          </Button>
          <Button 
            size="small" 
            variant="contained"
            onClick={() => setFilterAnchorEl(null)}
            sx={{ borderRadius: 2 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Menu>
    </GlassPaper>
  );
};

// ==================== MAIN COMPONENT ====================

export default function SupervisorModule({ user }: SupervisorModuleProps) {
  const theme = useTheme();
  
  // State
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [correctionRequests, setCorrectionRequests] = useState<CorrectionRequest[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [hospitalSummaries, setHospitalSummaries] = useState<HospitalNumberValidationSummary[]>([]);
  const [facilityDQI, setFacilityDQI] = useState<DataQualityIndexResponse[]>([]);
  const [facilityRanking, setFacilityRanking] = useState<FacilityRankingResponse | null>(null);
  const [interruptions, setInterruptions] = useState<TreatmentInterruption[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateRecord[]>([]);
  const [arvPatterns, setArvPatterns] = useState<ArvDispensingPatterns | null>(null);
  const [refillSchedule, setRefillSchedule] = useState<RefillScheduleItem[]>([]);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    pending_reviews: 0,
    high_priority: 0,
    medium_priority: 0,
    low_priority: 0,
    logical_errors: 0,
    pending_corrections: 0,
    total_patients_validated: 0,
    overall_accuracy: 0,
    facilities_count: 0,
    critical_issues: 0
  });
  
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalNumberValidationSummary | null>(null);
  const [selectedCorrection, setSelectedCorrection] = useState<CorrectionRequest | null>(null);
  
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [hospitalDetailDialogOpen, setHospitalDetailDialogOpen] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
  
  const [reviewComments, setReviewComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'compact'>('table');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [classificationFilter, setClassificationFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [sortBy, setSortBy] = useState('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.allSettled([
        fetchPendingReviews(),
        fetchCorrectionRequests(),
        fetchPatientSummaries(),
        fetchHospitalSummaries(),
        fetchFacilityDQI(),
        fetchFacilityRanking(),
        fetchTreatmentInterruptions(),
        fetchDuplicates(),
        fetchArvPatterns(),
        fetchRefillSchedule(),
        fetchDashboardStats()
      ]);
    } catch (error) {
      console.error('Error fetching supervisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingReviews = async () => {
    try {
      const response = await supervisor.getPendingReviews();
      setPendingReviews(response.pending_reviews || []);
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    }
  };

  const fetchCorrectionRequests = async () => {
    try {
      const response = await supervisor.getCorrections('pending');
      setCorrectionRequests(
       Array.isArray(response)
    ? response
    : response?.corrections || response?.data || []
);
    } catch (error) {
      console.error('Error fetching correction requests:', error);
    }
  };

  const fetchPatientSummaries = async () => {
    try {
      const response = await analytics.getPatientSummaries();
      setPatientSummaries(response || []);
    } catch (error) {
      console.error('Error fetching patient summaries:', error);
    }
  };

  const fetchHospitalSummaries = async () => {
    try {
      const response = await validationSummaries.getAllSummaries();
      setHospitalSummaries(response || []);
    } catch (error) {
      console.error('Error fetching hospital summaries:', error);
    }
  };

  const fetchFacilityDQI = async () => {
    try {
      const response = await validationSummaries.getFacilityDQI();
      setFacilityDQI(response || []);
    } catch (error) {
      console.error('Error fetching facility DQI:', error);
    }
  };

  const fetchFacilityRanking = async () => {
    try {
      const response = await validationSummaries.getFacilityRanking();
      setFacilityRanking(response || null);
    } catch (error) {
      console.error('Error fetching facility ranking:', error);
    }
  };

  const fetchTreatmentInterruptions = async () => {
    try {
      const response = await analytics.getTreatmentInterruptions();
      setInterruptions(response.interruptions || []);
    } catch (error) {
      console.error('Error fetching treatment interruptions:', error);
    }
  };

  const fetchDuplicates = async () => {
    try {
      const response = await analytics.getDuplicates();
      setDuplicates(response.potential_duplicates || []);
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    }
  };

  const fetchArvPatterns = async () => {
    try {
      // This would need a dedicated endpoint
      // const response = await analytics.getArvDispensingPatterns();
      // setArvPatterns(response || null);
    } catch (error) {
      console.error('Error fetching ARV patterns:', error);
    }
  };

  const fetchRefillSchedule = async () => {
    try {
      // This would need a dedicated endpoint
      // const response = await analytics.getRefillSchedule();
      // setRefillSchedule(response.refill_schedule || []);
    } catch (error) {
      console.error('Error fetching refill schedule:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [stats, reviews, metrics] = await Promise.all([
        dashboard.getStats(),
        supervisor.getPendingReviews(),
        dashboard.getQualityMetrics()
      ]);
      
      const highPriority = reviews.pending_reviews?.filter((r: PendingReview) => r.priority === 'HIGH').length || 0;
      const mediumPriority = reviews.pending_reviews?.filter((r: PendingReview) => r.priority === 'MEDIUM').length || 0;
      const lowPriority = reviews.pending_reviews?.filter((r: PendingReview) => r.priority === 'LOW').length || 0;
      
      const logicalErrors = reviews.pending_reviews?.reduce(
        (acc: number, review: PendingReview) => 
          acc + review.mismatches.filter(m => m.status === 'LOGICAL_ERROR').length, 
        0
      ) || 0;

      const criticalIssues = hospitalSummaries.filter(
        h => h.classification === 'Critical Issue'
      ).length;

      setDashboardStats({
        pending_reviews: reviews.pending_reviews?.length || 0,
        high_priority: highPriority,
        medium_priority: mediumPriority,
        low_priority: lowPriority,
        logical_errors: logicalErrors,
        pending_corrections: Array.isArray(correctionRequests) ? correctionRequests.length : 0,
        total_patients_validated: stats?.validated_clients || 0,
        overall_accuracy: metrics?.overall_accuracy || 0,
        facilities_count: facilityDQI.length,
        critical_issues: criticalIssues
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Filter and sort logic for pending reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = [...pendingReviews];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.hospital_number.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter(item =>
        item.mismatches.some(m => statusFilter.includes(m.status))
      );
    }

    // Priority filter
    if (priorityFilter.length > 0) {
      filtered = filtered.filter(item =>
        priorityFilter.includes(item.priority)
      );
    }

    // Date filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(item => {
        const date = new Date(item.validation_date || '');
        if (dateRange.start && date < dateRange.start) return false;
        if (dateRange.end && date > dateRange.end) return false;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'hospital_number':
          comparison = a.hospital_number.localeCompare(b.hospital_number);
          break;
        case 'priority':
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          break;
        case 'validation_date':
          comparison = new Date(b.validation_date || '').getTime() - new Date(a.validation_date || '').getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [pendingReviews, searchTerm, statusFilter, priorityFilter, dateRange, sortBy, sortOrder]);

  // Filter and sort logic for hospital summaries
  const filteredAndSortedHospitals = useMemo(() => {
    let filtered = [...hospitalSummaries];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.hospital_number.toLowerCase().includes(term)
      );
    }

    // Classification filter
    if (classificationFilter.length > 0) {
      filtered = filtered.filter(item =>
        classificationFilter.includes(item.classification)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'hospital_number':
          comparison = a.hospital_number.localeCompare(b.hospital_number);
          break;
        case 'accuracy':
          comparison = b.score_percentage - a.score_percentage;
          break;
        case 'classification':
          const classOrder = { 
            'Perfect Match': 5, 
            'Low Discrepancy': 4, 
            'Moderate Discrepancy': 3, 
            'High Discrepancy': 2, 
            'Critical Issue': 1 
          };
          comparison = (classOrder[b.classification as keyof typeof classOrder] || 0) - 
                       (classOrder[a.classification as keyof typeof classOrder] || 0);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return filtered;
  }, [hospitalSummaries, searchTerm, classificationFilter, sortBy, sortOrder]);

  // Pagination
  const paginatedReviews = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredAndSortedReviews.slice(start, start + rowsPerPage);
  }, [filteredAndSortedReviews, page, rowsPerPage]);

  const paginatedHospitals = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredAndSortedHospitals.slice(start, start + rowsPerPage);
  }, [filteredAndSortedHospitals, page, rowsPerPage]);

  // Handlers
  const handleReviewCorrection = async (approved: boolean) => {
    if (!selectedCorrection) return;
    
    setLoading(true);
    try {
      await supervisor.reviewCorrection(selectedCorrection.id, approved, reviewComments);
      setCorrectionDialogOpen(false);
      setSelectedCorrection(null);
      setReviewComments('');
      await fetchCorrectionRequests();
    } catch (error) {
      console.error('Error reviewing correction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptField = async (review: PendingReview, mismatch: any, decision: 'radet' | 'card' | 'flag') => {
    setLoading(true);
    try {
      // This would need a dedicated endpoint
      // await supervisor.resolveMismatch(review.hospital_number, mismatch.id, decision);
      await fetchPendingReviews();
    } catch (error) {
      console.error('Error resolving mismatch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      pending_reviews: filteredAndSortedReviews,
      corrections: correctionRequests,
      hospitals: filteredAndSortedHospitals,
      facilities: facilityDQI,
      interruptions,
      duplicates
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supervisor-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Render
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Fade in timeout={800}>
        <GlassPaper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="h4" 
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
                Supervisor Dashboard
              </Typography>
              <Breadcrumbs>
                <Link color="inherit" href="#" underline="hover">Dashboard</Link>
                <Typography color="text.primary">Quality Assurance</Typography>
              </Breadcrumbs>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Analytics">
                <IconButton 
                  onClick={() => setAnalyticsDialogOpen(true)}
                  sx={{ 
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: 'info.main',
                    '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                  }}
                >
                  <AssessmentIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export All Data">
                <IconButton 
                  onClick={handleExportData}
                  sx={{ 
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: 'success.main',
                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={fetchAllData}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Quick Stats Row */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="info.main">
                    {dashboardStats.total_patients_validated}
                  </Typography>
                  <Typography variant="body2">Patients Validated</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {dashboardStats.overall_accuracy}%
                  </Typography>
                  <Typography variant="body2">Overall Accuracy</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {dashboardStats.critical_issues}
                  </Typography>
                  <Typography variant="body2">Critical Issues</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05), borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="secondary.main">
                    {dashboardStats.facilities_count}
                  </Typography>
                  <Typography variant="body2">Facilities</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </GlassPaper>
      </Fade>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatsCard
            title="Pending Reviews"
            value={dashboardStats.pending_reviews}
            subtitle={`${dashboardStats.high_priority} high priority`}
            icon={<AssignmentIcon />}
            color="primary"
            trend={dashboardStats.pending_reviews > 10 ? 12 : -5}
            onClick={() => setTabValue(0)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatsCard
            title="High Priority"
            value={dashboardStats.high_priority}
            icon={<WarningAmberIcon />}
            color="error"
            trend={dashboardStats.high_priority > 5 ? 25 : -10}
            onClick={() => {
              setPriorityFilter(['HIGH']);
              setTabValue(0);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatsCard
            title="Logical Errors"
            value={dashboardStats.logical_errors}
            icon={<ErrorIcon />}
            color="warning"
            trend={dashboardStats.logical_errors > 0 ? 8 : 0}
            onClick={() => {
              setStatusFilter(['LOGICAL_ERROR']);
              setTabValue(0);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatsCard
            title="Critical Issues"
            value={dashboardStats.critical_issues}
            icon={<WarningIcon />}
            color="error"
            trend={dashboardStats.critical_issues > 5 ? 15 : -20}
            onClick={() => {
              setClassificationFilter(['Critical Issue']);
              setTabValue(2);
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <StatsCard
            title="Pending Corrections"
            value={dashboardStats.pending_corrections}
            icon={<HistoryIcon />}
            color="info"
            trend={0}
            onClick={() => setTabValue(1)}
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => {
            setTabValue(v);
            setPage(1);
          }}
          sx={{ px: 2, pt: 1 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<AssignmentIcon />} label="Pending Reviews" />
          <Tab icon={<HistoryIcon />} label="Correction Requests" />
          <Tab icon={<AssessmentIcon />} label="Quality Scores" />
          <Tab icon={<TimelineIcon />} label="Facility DQI" />
          <Tab icon={<BarChartIcon />} label="Analytics" />
          <Tab icon={<NotificationsIcon />} label="Alerts" />
        </Tabs>
      </Paper>

      {/* Filter Bar - Show for relevant tabs */}
      {(tabValue === 0 || tabValue === 2) && (
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          classificationFilter={classificationFilter}
          onClassificationFilterChange={setClassificationFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalCount={tabValue === 0 ? filteredAndSortedReviews.length : filteredAndSortedHospitals.length}
          onExport={handleExportData}
          onPrint={handlePrint}
        />
      )}

      {/* Loading State */}
      {loading && (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 0: Pending Reviews */}
      {!loading && tabValue === 0 && (
        <Fade in>
          <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Pending Validation Reviews
                <Chip 
                  label={`${filteredAndSortedReviews.length} records`}
                  size="small"
                  sx={{ ml: 2, borderRadius: 1.5 }}
                />
              </Typography>
              <Box>
                <ButtonGroup size="small">
                  <Button 
                    variant={viewMode === 'table' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('table')}
                  >
                    <TableChartIcon />
                  </Button>
                  <Button 
                    variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('grid')}
                  >
                    <ViewModuleIcon />
                  </Button>
                  <Button 
                    variant={viewMode === 'compact' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('compact')}
                  >
                    <ViewStreamIcon />
                  </Button>
                </ButtonGroup>
              </Box>
            </Box>

            {viewMode === 'table' && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital #</TableCell>
                      <TableCell>Issues</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Validator</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedReviews.map((review) => (
                      <TableRow 
                        key={review.hospital_number}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => {
                          setSelectedReview(review);
                          setReviewDialogOpen(true);
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">
                            {review.hospital_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {review.mismatches.slice(0, 3).map((m, i) => (
                              <Tooltip key={i} title={m.logical_error || m.field}>
                                <Chip
                                  label={m.field.split('_').map(w => w[0]).join('').toUpperCase()}
                                  size="small"
                                  color={m.status === 'LOGICAL_ERROR' ? 'error' : 
                                         m.status === 'MISMATCH' ? 'warning' : 'default'}
                                  sx={{ height: 20, fontSize: '0.625rem' }}
                                />
                              </Tooltip>
                            ))}
                            {review.mismatches.length > 3 && (
                              <Chip
                                label={`+${review.mismatches.length - 3}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.625rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={review.priority}
                            size="small"
                            color={PRIORITY_COLORS[review.priority as keyof typeof PRIORITY_COLORS]}
                            sx={{ fontWeight: 'bold', borderRadius: 1.5 }}
                          />
                        </TableCell>
                        <TableCell>{review.validator || '—'}</TableCell>
                        <TableCell>
                          {review.validation_date ? 
                            new Date(review.validation_date).toLocaleDateString() : 
                            '—'
                          }
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedReview(review);
                              setReviewDialogOpen(true);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedReviews.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                          <Typography color="text.secondary">No pending reviews found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {viewMode === 'grid' && (
              <Grid container spacing={2}>
                {paginatedReviews.map((review) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={review.hospital_number}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8]
                        }
                      }}
                      onClick={() => {
                        setSelectedReview(review);
                        setReviewDialogOpen(true);
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{review.hospital_number}</Typography>
                          <Chip 
                            label={review.priority}
                            size="small"
                            color={PRIORITY_COLORS[review.priority as keyof typeof PRIORITY_COLORS]}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Issues ({review.mismatches.length})
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {review.mismatches.slice(0, 5).map((m, i) => (
                              <Tooltip key={i} title={m.field.replace(/_/g, ' ')}>
                                <Chip
                                  label={m.field.split('_').pop()}
                                  size="small"
                                  color={m.status === 'LOGICAL_ERROR' ? 'error' : 
                                         m.status === 'MISMATCH' ? 'warning' : 'default'}
                                  sx={{ height: 24 }}
                                />
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            Validator: {review.validator || '—'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.validation_date ? new Date(review.validation_date).toLocaleDateString() : '—'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {viewMode === 'compact' && (
              <List>
                {paginatedReviews.map((review) => (
                  <ListItem 
                    key={review.hospital_number}
                    divider
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                    }}
                    onClick={() => {
                      setSelectedReview(review);
                      setReviewDialogOpen(true);
                    }}
                  >
                    <ListItemIcon>
                      <Badge
                        color={PRIORITY_COLORS[review.priority as keyof typeof PRIORITY_COLORS]}
                        variant="dot"
                        sx={{
                          '& .MuiBadge-badge': {
                            right: 4,
                            top: 4
                          }
                        }}
                      >
                        <AssignmentIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={review.hospital_number}
                      secondary={
                        <Box component="span">
                          {review.mismatches.length} issues • {review.validator || 'No validator'} • 
                          {review.validation_date ? new Date(review.validation_date).toLocaleDateString() : '—'}
                        </Box>
                      }
                    />
                    <Chip 
                      label={review.priority}
                      size="small"
                      color={PRIORITY_COLORS[review.priority as keyof typeof PRIORITY_COLORS]}
                      sx={{ borderRadius: 1.5 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {/* Pagination */}
            {filteredAndSortedReviews.length > rowsPerPage && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(filteredAndSortedReviews.length / rowsPerPage)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </GlassPaper>
        </Fade>
      )}

      {/* Tab 1: Correction Requests */}
      {!loading && tabValue === 1 && (
        <Fade in>
          <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Correction Requests
              <Chip 
                label={`${correctionRequests.length} pending`}
                size="small"
                sx={{ ml: 2, borderRadius: 1.5 }}
              />
            </Typography>
            
            <Stepper 
              activeStep={-1} 
              orientation="vertical"
              connector={<ColorfulConnector />}
            >
              {correctionRequests.length === 0 ? (
                <Step>
                  <StepContent>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography color="text.secondary">No correction requests found</Typography>
                    </Box>
                  </StepContent>
                </Step>
              ) : (
                Array.isArray(correctionRequests) &&
                correctionRequests.map((request) => (
                  <Step key={request.id} active={true}>
                    <StepLabel
                      StepIconComponent={(props) => (
                        <ColorfulStepIcon 
                          {...props}
                          icon={<EditIcon />}
                          completed={request.status === 'approved'}
                        />
                      )}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography fontWeight="bold">{request.hospital_number}</Typography>
                        <Chip 
                          label={request.field_name.replace(/_/g, ' ')}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={request.status}
                          size="small"
                          color={request.status === 'pending' ? 'warning' : 
                                 request.status === 'approved' ? 'success' : 'error'}
                        />
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Current Value
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                              {request.old_value || '—'}
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <Typography variant="caption" color="text.secondary">
                              Proposed Value
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                              {request.new_value}
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        <Typography variant="caption" color="text.secondary">
                          Reason
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {request.reason}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => {
                              setSelectedCorrection(request);
                              setCorrectionDialogOpen(true);
                            }}
                          >
                            Review
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={() => {
                              // View patient details
                            }}
                          >
                            View Patient
                          </Button>
                        </Box>
                      </Box>
                    </StepContent>
                  </Step>
                ))
              )}
            </Stepper>
          </GlassPaper>
        </Fade>
      )}

      {/* Tab 2: Quality Scores */}
      {/* Tab 2: Quality Scores */}
{!loading && tabValue === 2 && (
  <Fade in>
    <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Hospital Quality Scores
        <Chip 
          label={`${filteredAndSortedHospitals.length} facilities`}
          size="small"
          sx={{ ml: 2, borderRadius: 1.5 }}
        />
      </Typography>

      {/* Summary Stats - FIXED SECTION */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(
          filteredAndSortedHospitals.reduce((acc, h) => {
            const classification = h.classification || 'Unknown';
            acc[classification] = (acc[classification] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).map(([classification, count]) => {
          // Get color with safe fallback
          const color = CLASSIFICATION_COLORS[classification as keyof typeof CLASSIFICATION_COLORS] || '#9ca3af';
          
          return (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={classification}>
              <Card sx={{ 
                bgcolor: alpha(color, 0.1),
                border: '1px solid',
                borderColor: alpha(color, 0.3)
              }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ color: color }}
                  >
                    {count}
                  </Typography>
                  <Typography variant="caption">{classification}</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      

            {viewMode === 'table' ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital #</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Classification</TableCell>
                      <TableCell>Passed/Total</TableCell>
                      <TableCell>Issues</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedHospitals.map((hospital) => (
                      <TableRow 
                        key={hospital.hospital_number}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: alpha(hospital.color_code, 0.05),
                            cursor: 'pointer'
                          }
                        }}
                        onClick={() => {
                          setSelectedHospital(hospital);
                          setHospitalDetailDialogOpen(true);
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">
                            {hospital.hospital_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={hospital.score_percentage}
                              sx={{
                                width: 80,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(hospital.color_code, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: hospital.color_code,
                                  borderRadius: 4
                                }
                              }}
                            />
                            <Typography variant="body2">
                              {hospital.score_percentage}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={hospital.classification}
                            size="small"
                            sx={{
                              bgcolor: alpha(hospital.color_code, 0.1),
                              color: hospital.color_code,
                              borderColor: alpha(hospital.color_code, 0.3),
                              fontWeight: 600
                            }}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {hospital.passed_checks}/{hospital.total_checks}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {hospital.failed_fields.slice(0, 3).map((field, i) => (
                              <Tooltip key={i} title={field.field_name.replace(/_/g, ' ')}>
                                <Chip
                                  label={field.field_name.split('_').pop()}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(STATUS_COLORS[field.status as keyof typeof STATUS_COLORS] || 'default', 0.1),
                                    color: STATUS_COLORS[field.status as keyof typeof STATUS_COLORS] || 'default'
                                  }}
                                />
                              </Tooltip>
                            ))}
                            {hospital.failed_fields.length > 3 && (
                              <Chip
                                label={`+${hospital.failed_fields.length - 3}`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={hospital.validation_status}
                            size="small"
                            color={hospital.validation_status === 'MATCH' ? 'success' : 'warning'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHospital(hospital);
                              setHospitalDetailDialogOpen(true);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Grid container spacing={2}>
                {paginatedHospitals.map((hospital) => (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={hospital.hospital_number}>
                    <Card 
                      sx={{ 
                        border: '1px solid',
                        borderColor: alpha(hospital.color_code, 0.3),
                        bgcolor: alpha(hospital.color_code, 0.02),
                        cursor: 'pointer',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 8px 16px ${alpha(hospital.color_code, 0.2)}`
                        }
                      }}
                      onClick={() => {
                        setSelectedHospital(hospital);
                        setHospitalDetailDialogOpen(true);
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{hospital.hospital_number}</Typography>
                          <Chip
                            label={hospital.classification}
                            size="small"
                            sx={{
                              bgcolor: alpha(hospital.color_code, 0.1),
                              color: hospital.color_code,
                              borderColor: alpha(hospital.color_code, 0.3),
                              fontWeight: 600
                            }}
                            variant="outlined"
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Score:
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={hospital.score_percentage}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  bgcolor: alpha(hospital.color_code, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    bgcolor: hospital.color_code,
                                    borderRadius: 4
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="body2" fontWeight="bold">
                              {hospital.score_percentage}%
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Passed: {hospital.passed_checks}/{hospital.total_checks} checks
                          </Typography>
                        </Box>

                        {hospital.failed_fields.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Issues:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {hospital.failed_fields.slice(0, 5).map((field, i) => (
                                <Tooltip key={i} title={field.field_name.replace(/_/g, ' ')}>
                                  <Chip
                                    label={field.field_name.split('_').pop()}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(STATUS_COLORS[field.status as keyof typeof STATUS_COLORS] || 'default', 0.1),
                                      color: STATUS_COLORS[field.status as keyof typeof STATUS_COLORS] || 'default'
                                    }}
                                  />
                                </Tooltip>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {filteredAndSortedHospitals.length > rowsPerPage && (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={Math.ceil(filteredAndSortedHospitals.length / rowsPerPage)}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </GlassPaper>
        </Fade>
      )}

      {/* Tab 3: Facility DQI */}
      {!loading && tabValue === 3 && (
        <Fade in>
          <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Facility Data Quality Index (DQI)
            </Typography>

            {facilityRanking && (
              <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall DQI Across All Facilities: 
                  <Typography component="span" variant="h6" sx={{ ml: 1, color: 'primary.main' }}>
                    {facilityRanking.overall_dqi}%
                  </Typography>
                </Typography>
              </Box>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Facility</TableCell>
                    <TableCell align="center">Patients</TableCell>
                    <TableCell align="center">Checks Passed</TableCell>
                    <TableCell align="center">DQI Score</TableCell>
                    <TableCell align="center">Perfect Match</TableCell>
                    <TableCell align="center">Low</TableCell>
                    <TableCell align="center">Moderate</TableCell>
                    <TableCell align="center">High</TableCell>
                    <TableCell align="center">Critical</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {facilityDQI.map((facility, index) => (
                    <TableRow key={facility.facility_name}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {index === 0 && <EmojiEventsIcon sx={{ color: '#ffd700' }} />}
                          {index === 1 && <EmojiEventsIcon sx={{ color: '#c0c0c0' }} />}
                          {index === 2 && <EmojiEventsIcon sx={{ color: '#cd7f32' }} />}
                          {index > 2 && `#${index + 1}`}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">{facility.facility_name}</Typography>
                      </TableCell>
                      <TableCell align="center">{facility.total_patients_validated}</TableCell>
                      <TableCell align="center">
                        {facility.total_passed_checks}/{facility.total_expected_checks}
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          fontWeight="bold"
                          sx={{ color: facility.color_code }}
                        >
                          {facility.dqi_score}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={facility.classification_breakdown["Perfect Match"]}
                          sx={{ bgcolor: alpha('#10b981', 0.1), color: '#10b981' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={facility.classification_breakdown["Low Discrepancy"]}
                          sx={{ bgcolor: alpha('#84cc16', 0.1), color: '#84cc16' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={facility.classification_breakdown["Moderate Discrepancy"]}
                          sx={{ bgcolor: alpha('#eab308', 0.1), color: '#eab308' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={facility.classification_breakdown["High Discrepancy"]}
                          sx={{ bgcolor: alpha('#f97316', 0.1), color: '#f97316' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={facility.classification_breakdown["Critical Issue"]}
                          sx={{ bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassPaper>
        </Fade>
      )}

      {/* Tab 4: Analytics */}
      {!loading && tabValue === 4 && (
        <Fade in>
          <Grid container spacing={3}>
            {/* ARV Dispensing Patterns */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ARV Dispensing Patterns
                </Typography>
                {arvPatterns ? (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Card sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                          <Typography variant="h4" color="info.main">
                            {arvPatterns.average_months_dispensed}
                          </Typography>
                          <Typography variant="caption">Avg Months</Typography>
                        </Card>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Card sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                          <Typography variant="h4" color="warning.main">
                            {arvPatterns.recommendations.adherence_risk_patients}
                          </Typography>
                          <Typography variant="caption">At Risk</Typography>
                        </Card>
                      </Grid>
                    </Grid>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={Object.entries(arvPatterns.dispensing_patterns).map(([key, value]) => ({
                        name: key.replace('_', ' '),
                        value
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" fill={theme.palette.info.main} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography color="text.secondary">No ARV data available</Typography>
                  </Box>
                )}
              </GlassPaper>
            </Grid>

            {/* Treatment Interruptions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'error.main' }}>
                  Treatment Interruptions
                </Typography>
                {interruptions.length > 0 ? (
                  <List>
                    {interruptions.slice(0, 5).map((interruption, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemIcon>
                          <WarningIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary={interruption.hospital_number}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Last pickup: {interruption.last_pickup_date || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="error">
                                {interruption.days_since_pickup} days overdue
                              </Typography>
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
                    {interruptions.length > 5 && (
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          +{interruptions.length - 5} more patients at risk
                        </Typography>
                      </Box>
                    )}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <TaskAltIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5 }} />
                    <Typography color="text.secondary">No treatment interruptions</Typography>
                  </Box>
                )}
              </GlassPaper>
            </Grid>

            {/* Duplicate Detection */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'warning.main' }}>
                  Potential Duplicate Patients
                </Typography>
                {duplicates.length > 0 ? (
                  <List>
                    {duplicates.slice(0, 5).map((dup, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemIcon>
                          <WarningAmberIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              <strong>{dup.original}</strong> ←→ <strong>{dup.duplicate}</strong>
                            </Typography>
                          }
                          secondary={`${Math.round(dup.confidence * 100)}% match confidence`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.5 }} />
                    <Typography color="text.secondary">No duplicates detected</Typography>
                  </Box>
                )}
              </GlassPaper>
            </Grid>

            {/* Refill Schedule */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'info.main' }}>
                  Upcoming Refills
                </Typography>
                {refillSchedule.length > 0 ? (
                  <List>
                    {refillSchedule.slice(0, 5).map((refill, index) => (
                      <ListItem key={index} divider={index < 4}>
                        <ListItemIcon>
                          <ScheduleIcon color="info" />
                        </ListItemIcon>
                        <ListItemText
                          primary={refill.hospital_number}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                Runs out: {new Date(refill.expected_run_out_date).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color={refill.priority === 'HIGH' ? 'error' : 'info'}>
                                {refill.days_until_refill_needed} days left
                              </Typography>
                            </Box>
                          }
                        />
                        <Chip
                          label={refill.priority}
                          size="small"
                          color={refill.priority === 'HIGH' ? 'error' : 'info'}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography color="text.secondary">No refill data available</Typography>
                  </Box>
                )}
              </GlassPaper>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Tab 5: Alerts */}
      {!loading && tabValue === 5 && (
        <Fade in>
          <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Active Alerts
            </Typography>
            
            <Stack spacing={2}>
              {/* Critical Issues */}
              {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length > 0 && (
                <Alert 
                  severity="error"
                  icon={<ErrorIcon />}
                  action={
                    <Button color="inherit" size="small" onClick={() => {
                      setClassificationFilter(['Critical Issue']);
                      setTabValue(2);
                    }}>
                      View
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle>Critical Issues Detected</AlertTitle>
                  {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length} patients have critical data quality issues requiring immediate attention.
                </Alert>
              )}

              {/* High Priority Reviews */}
              {dashboardStats.high_priority > 0 && (
                <Alert 
                  severity="error"
                  icon={<WarningAmberIcon />}
                  action={
                    <Button color="inherit" size="small" onClick={() => {
                      setPriorityFilter(['HIGH']);
                      setTabValue(0);
                    }}>
                      Review
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle>High Priority Reviews</AlertTitle>
                  {dashboardStats.high_priority} high-priority reviews pending.
                </Alert>
              )}

              {/* Treatment Interruptions */}
              {interruptions.length > 0 && (
                <Alert 
                  severity="warning"
                  icon={<WarningIcon />}
                  action={
                    <Button color="inherit" size="small" onClick={() => setTabValue(4)}>
                      View
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle>Treatment Interruptions</AlertTitle>
                  {interruptions.length} patients are at risk of treatment interruption.
                </Alert>
              )}

              {/* Duplicates */}
              {duplicates.length > 0 && (
                <Alert 
                  severity="warning"
                  icon={<WarningAmberIcon />}
                  action={
                    <Button color="inherit" size="small" onClick={() => setTabValue(4)}>
                      Review
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle>Potential Duplicates</AlertTitle>
                  {duplicates.length} potential duplicate patient records detected.
                </Alert>
              )}

              {/* Pending Corrections */}
              {correctionRequests.length > 0 && (
                <Alert 
                  severity="info"
                  icon={<HistoryIcon />}
                  action={
                    <Button color="inherit" size="small" onClick={() => setTabValue(1)}>
                      Review
                    </Button>
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <AlertTitle>Pending Correction Requests</AlertTitle>
                  {correctionRequests.length} correction requests awaiting approval.
                </Alert>
              )}

              {/* No Alerts */}
              {hospitalSummaries.filter(h => h.classification === 'Critical Issue').length === 0 &&
               dashboardStats.high_priority === 0 &&
               interruptions.length === 0 &&
               duplicates.length === 0 &&
               correctionRequests.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TaskAltIcon sx={{ fontSize: 64, color: 'success.main', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" color="success.main" gutterBottom>
                    All Clear!
                  </Typography>
                  <Typography color="text.secondary">
                    No active alerts at this time
                  </Typography>
                </Box>
              )}
            </Stack>
          </GlassPaper>
        </Fade>
      )}

      {/* Review Details Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Review Details - {selectedReview?.hospital_number}
            </Typography>
            <IconButton onClick={() => setReviewDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Stepper activeStep={-1} orientation="vertical">
            {selectedReview?.mismatches.map((mismatch, index) => (
              <Step key={index} active={true}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <ColorfulStepIcon 
                      {...props}
                      icon={<ErrorOutlineIcon />}
                    />
                  )}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography fontWeight="bold">
                      {mismatch.field.replace(/_/g, ' ')}
                    </Typography>
                    <Chip 
                      label={mismatch.status.replace(/_/g, ' ')}
                      size="small"
                      color={STATUS_COLORS[mismatch.status as keyof typeof STATUS_COLORS] || 'default'}
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        RADET Value
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          borderRadius: 2
                        }}
                      >
                        {mismatch.radet_value || '—'}
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Care Card Value
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: alpha(theme.palette.warning.main, 0.05),
                          borderRadius: 2
                        }}
                      >
                        {mismatch.care_card_value || '—'}
                      </Paper>
                    </Grid>
                  </Grid>
                  
                  {mismatch.logical_error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                      {mismatch.logical_error}
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="success" 
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleAcceptField(selectedReview, mismatch, 'radet')}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Accept RADET
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      color="warning" 
                      startIcon={<WarningIcon />}
                      onClick={() => handleAcceptField(selectedReview, mismatch, 'card')}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Accept Care Card
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="error" 
                      startIcon={<FlagIcon />}
                      onClick={() => handleAcceptField(selectedReview, mismatch, 'flag')}
                      disabled={loading}
                      sx={{ borderRadius: 2 }}
                    >
                      Flag for Investigation
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => setReviewDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hospital Detail Dialog */}
      <Dialog 
        open={hospitalDetailDialogOpen} 
        onClose={() => setHospitalDetailDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedHospital && (
          <>
            <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: alpha(selectedHospital.color_code, 0.1), color: selectedHospital.color_code }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{selectedHospital.hospital_number}</Typography>
                    <Chip
                      label={selectedHospital.classification}
                      size="small"
                      sx={{
                        bgcolor: alpha(selectedHospital.color_code, 0.1),
                        color: selectedHospital.color_code,
                        borderColor: alpha(selectedHospital.color_code, 0.3),
                        fontWeight: 600,
                        mt: 0.5
                      }}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => setHospitalDetailDialogOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={3}>
                {/* Score Overview */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={selectedHospital.score_percentage}
                        size={120}
                        thickness={4}
                        sx={{
                          color: selectedHospital.color_code,
                          '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                          }
                        }}
                      />
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
                        <Typography variant="h4" fontWeight="bold" sx={{ color: selectedHospital.color_code }}>
                          {Math.round(selectedHospital.score_percentage)}%
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Data Quality Score
                    </Typography>
                  </Box>
                </Grid>

                {/* Stats */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 4 }}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <Typography variant="h4" color="success.main">
                          {selectedHospital.passed_checks}
                        </Typography>
                        <Typography variant="caption">Passed</Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                        <Typography variant="h4" color="error.main">
                          {selectedHospital.failed_checks}
                        </Typography>
                        <Typography variant="caption">Failed</Typography>
                      </Card>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Card sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.info.main, 0.05) }}>
                        <Typography variant="h4" color="info.main">
                          {selectedHospital.total_checks}
                        </Typography>
                        <Typography variant="caption">Total</Typography>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Failed Fields */}
                {selectedHospital.failed_fields.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Failed Validations
                    </Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Field</TableCell>
                            <TableCell>RADET Value</TableCell>
                            <TableCell>Care Card Value</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Error</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedHospital.failed_fields.map((field, index) => (
                            <TableRow key={index}>
                              <TableCell>{field.field_name.replace(/_/g, ' ')}</TableCell>
                              <TableCell>{field.radet_value || '—'}</TableCell>
                              <TableCell>{field.care_card_value || '—'}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={field.status.replace(/_/g, ' ')}
                                  color={STATUS_COLORS[field.status as keyof typeof STATUS_COLORS] || 'default'}
                                />
                              </TableCell>
                              <TableCell>
                                {field.logical_error && (
                                  <Chip
                                    size="small"
                                    label="Logical Error"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
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

            <DialogActions sx={{ p: 3 }}>
              <Button 
                variant="contained" 
                onClick={() => setHospitalDetailDialogOpen(false)}
                sx={{ borderRadius: 2 }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Correction Review Dialog */}
      <Dialog 
        open={correctionDialogOpen} 
        onClose={() => setCorrectionDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
              <WarningIcon />
            </Avatar>
            <Typography variant="h6">Review Correction Request</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCorrection && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Hospital Number</Typography>
              <Typography variant="body1" gutterBottom>{selectedCorrection.hospital_number}</Typography>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Field</Typography>
              <Typography variant="body1" gutterBottom>
                {selectedCorrection.field_name.replace(/_/g, ' ')}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2">Current Value</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.05), borderRadius: 2 }}>
                    {selectedCorrection.old_value || '—'}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2">Proposed Value</Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 2 }}>
                    {selectedCorrection.new_value}
                  </Paper>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>Reason</Typography>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                {selectedCorrection.reason}
              </Paper>
              
              <TextField
                fullWidth
                label="Review Comments"
                multiline
                rows={3}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                margin="normal"
                placeholder="Add any comments about this correction..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCorrectionDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => handleReviewCorrection(false)}
            disabled={loading}
            startIcon={<CancelIcon />}
            sx={{ borderRadius: 2 }}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => handleReviewCorrection(true)}
            disabled={loading}
            startIcon={<CheckCircleIcon />}
            sx={{ borderRadius: 2 }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Advanced Analytics</Typography>
            <IconButton onClick={() => setAnalyticsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Validation Trends */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Validation Trends
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={patientSummaries.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hospital_number" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy_rate" stroke={theme.palette.primary.main} name="Accuracy %" />
                    <Line type="monotone" dataKey="total_validations" stroke={theme.palette.secondary.main} name="Total Validations" />
                  </LineChart>
                </ResponsiveContainer>
              </GlassPaper>
            </Grid>

            {/* Classification Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Classification Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        hospitalSummaries.reduce((acc, h) => {
                          acc[h.classification] = (acc[h.classification] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.keys(CLASSIFICATION_COLORS).map((key, index) => (
                        <Cell key={key} fill={CLASSIFICATION_COLORS[key as keyof typeof CLASSIFICATION_COLORS]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </GlassPaper>
            </Grid>

            {/* Facility Performance */}
            <Grid size={{ xs: 12 }}>
              <GlassPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Facility Performance Comparison
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={facilityDQI}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility_name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="dqi_score" fill={theme.palette.primary.main} name="DQI Score" />
                    <Bar dataKey="total_patients_validated" fill={theme.palette.secondary.main} name="Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </GlassPaper>
            </Grid>

            {/* Risk Distribution */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Risk Level Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        patientSummaries.reduce((acc, p) => {
                          acc[p.risk_level] = (acc[p.risk_level] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      <Cell fill={theme.palette.success.main} />
                      <Cell fill={theme.palette.warning.main} />
                      <Cell fill={theme.palette.error.main} />
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </GlassPaper>
            </Grid>

            {/* Trend Analysis */}
            <Grid size={{ xs: 12, md: 6 }}>
              <GlassPaper sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Trend Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={patientSummaries.slice(0, 15)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hospital_number" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <RechartsTooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="total_validations" fill={theme.palette.info.main} name="Validations" />
                    <Line yAxisId="right" type="monotone" dataKey="accuracy_rate" stroke={theme.palette.warning.main} name="Accuracy %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </GlassPaper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            variant="contained" 
            onClick={() => setAnalyticsDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}