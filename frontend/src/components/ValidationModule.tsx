import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Avatar,
  Fade,
  Zoom,
  Grow,
  Slide,
  alpha,
  useTheme,
  Stack,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Backdrop,
  CircularProgress,
  Snackbar,
  Skeleton,
  LinearProgress,
  Badge
} from "@mui/material";
import type { PaperProps } from "@mui/material/Paper";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import {
  Search as SearchIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
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
  Assignment as AssignmentIcon,
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
  Update as UpdateIcon
} from '@mui/icons-material';
import { validation, events, supervisor } from '../api';
import type { 
  User, 
  ValidationResult, 
  CareCardData, 
  ClinicalEvent,
  ExistingValidationResponse 
} from '../types';

// ==================== CONSTANTS & CONFIG ====================

const SEARCH_HISTORY_KEY = 'searchHistory';
const MAX_HISTORY_ITEMS = 5;
const REQUIRED_FIELDS = ['date_of_birth', 'sex'] as const;

// Backend sync: These match the ValidationStatus enum in main.py
const VALIDATION_STATUS = {
  MATCH: 'MATCH',
  MISMATCH: 'MISMATCH',
  MISSING_IN_RADET: 'MISSING_IN_RADET',
  MISSING_IN_CARD: 'MISSING_IN_CARD',
  LOGICAL_ERROR: 'LOGICAL_ERROR',
  UPDATED_RECORD: 'UPDATED_RECORD'
} as const;

// Backend sync: These match the EventType enum in main.py
const EVENT_TYPES = {
  drug_pickup: { 
    label: 'Drug Pickup', 
    icon: <VaccinesIcon />, 
    color: 'success',
    description: 'Patient collected ARV medication'
  },
  vl_sample: { 
    label: 'VL Sample', 
    icon: <ScienceIcon />, 
    color: 'info',
    description: 'Viral load sample collected'
  },
  vl_result: { 
    label: 'VL Result', 
    icon: <BloodtypeIcon />, 
    color: 'warning',
    description: 'Viral load result received'
  },
  clinic_visit: { 
    label: 'Clinic Visit', 
    icon: <MedicalIcon />, 
    color: 'primary',
    description: 'Regular clinic appointment'
  }
} as const;

// Backend sync: These fields match the RADETRecord model in main.py
const FORM_FIELDS = {
  demographics: [
    { name: 'date_of_birth', label: 'Date of Birth', type: 'date', icon: <CalendarIcon />, required: true },
    { name: 'sex', label: 'Sex', type: 'select', icon: <PersonIcon />, required: true, options: ['M', 'F'] }
  ],
  art: [
    { name: 'art_start_date', label: 'ART Start Date', type: 'date', icon: <MedicalIcon /> },
    { name: 'current_regimen', label: 'Current Regimen', type: 'text', icon: <MedicationIcon />, placeholder: 'e.g., TLD, TLE' }
  ],
  events: [
    { name: 'last_drug_pickup', label: 'Last Drug Pickup', type: 'date', icon: <VaccinesIcon /> },
    { name: 'last_clinic_visit', label: 'Last Clinic Visit', type: 'date', icon: <MedicalIcon /> }
  ],
  arv: [
    { name: 'months_of_arv_dispensed', label: 'Months of ARV Dispensed', type: 'number', icon: <MedicationIcon />, placeholder: 'Enter months' }
  ],
  viral_load: [
    { name: 'last_vl_sample_date', label: 'Last VL Sample Date', type: 'date', icon: <ScienceIcon /> },
    { name: 'last_vl_result', label: 'Last VL Result', type: 'number', icon: <BiotechIcon />, placeholder: 'Enter value' },
    { name: 'last_vl_result_date', label: 'Last VL Result Date', type: 'date', icon: <CalendarIcon /> }
  ]
};

// ==================== UTILITY FUNCTIONS ====================

const formatDate = (value: any): string => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return String(value);
  }
};

const formatDateTime = (value: any): string => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    return isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(value);
  }
};

const formatFieldName = (field: string): string => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const debounce = <F extends (...args: any[]) => any>(func: F, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ==================== STYLED COMPONENTS ====================

const GlassPaper = ({ children, sx, ...props }: PaperProps & { children?: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Paper
      {...props}
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.main, 0.1),
        ...sx
      }}
    >
      {children}
    </Paper>
  );
};

// ==================== STATUS BADGE COMPONENT ====================

interface StatusConfig {
  color: 'success' | 'error' | 'info' | 'warning' | 'secondary' | 'default';
  icon: React.ReactNode;
  label: string;
  description: string;
}

const StatusBadge = memo(({ status }: { status: string }) => {
  const theme = useTheme();
  
  // Backend sync: These configurations match the ValidationStatus enum in main.py
  const getStatusConfig = (status: string): StatusConfig => {
    const configs: Record<string, StatusConfig> = {
      [VALIDATION_STATUS.MATCH]: {
        color: 'success',
        icon: <TaskAltIcon />,
        label: 'Match',
        description: 'Values match perfectly'
      },
      [VALIDATION_STATUS.MISMATCH]: {
        color: 'error',
        icon: <HighlightOffIcon />,
        label: 'Mismatch',
        description: 'Values do not match'
      },
      [VALIDATION_STATUS.LOGICAL_ERROR]: {
        color: 'error',
        icon: <WarningAmberIcon />,
        label: 'Logical Error',
        description: 'Data violates clinical logic'
      },
      [VALIDATION_STATUS.UPDATED_RECORD]: {
        color: 'info',
        icon: <PublishedWithChangesIcon />,
        label: 'Updated',
        description: 'Care card has newer data'
      },
      [VALIDATION_STATUS.MISSING_IN_RADET]: {
        color: 'warning',
        icon: <ErrorOutlineIcon />,
        label: 'Missing in RADET',
        description: 'Data present in care card but not in RADET'
      },
      [VALIDATION_STATUS.MISSING_IN_CARD]: {
        color: 'warning',
        icon: <ErrorOutlineIcon />,
        label: 'Missing in Card',
        description: 'Data present in RADET but not in care card'
      }
    };
    
    return configs[status] || {
      color: 'default',
      icon: <InfoIcon />,
      label: status,
      description: 'Unknown status'
    };
  };

  const config = getStatusConfig(status);

  return (
    <Tooltip title={config.description} arrow>
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: alpha(theme.palette[config.color === 'default' ? 'grey' : config.color].main, 0.1),
          color: `${config.color}.main`,
          borderColor: alpha(theme.palette[config.color === 'default' ? 'grey' : config.color].main, 0.3),
          fontWeight: 600,
          '& .MuiChip-icon': {
            color: `${config.color}.main`
          },
          transition: 'all 0.3s',
          '&:hover': {
            transform: 'scale(1.05)',
            bgcolor: alpha(theme.palette[config.color === 'default' ? 'grey' : config.color].main, 0.15)
          }
        }}
        variant="outlined"
      />
    </Tooltip>
  );
});

StatusBadge.displayName = 'StatusBadge';

// ==================== FIELD COMPARISON CARD ====================

interface FieldComparisonCardProps {
  result: ValidationResult;
  onRequestCorrection: (field: string, currentValue: string) => void;
  userRole: string;
}

const FieldComparisonCard = memo(({ result, onRequestCorrection, userRole }: FieldComparisonCardProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const getFieldIcon = (fieldName: string): React.ReactNode => {
    if (fieldName.includes('date')) return <CalendarIcon />;
    if (fieldName.includes('sex')) return <PersonIcon />;
    if (fieldName.includes('regimen')) return <MedicalIcon />;
    if (fieldName.includes('vl')) return <ScienceIcon />;
    if (fieldName.includes('drug')) return <VaccinesIcon />;
    if (fieldName.includes('clinic')) return <MedicalIcon />;
    if (fieldName.includes('arv')) return <MedicationIcon />;
    return <AssignmentIcon />;
  };

  const isError = result.status !== VALIDATION_STATUS.MATCH && 
                  result.status !== VALIDATION_STATUS.UPDATED_RECORD;

  const getStatusColor = () => {
    switch (result.status) {
      case VALIDATION_STATUS.MATCH: return theme.palette.success.main;
      case VALIDATION_STATUS.UPDATED_RECORD: return theme.palette.info.main;
      case VALIDATION_STATUS.LOGICAL_ERROR: return theme.palette.error.main;
      case VALIDATION_STATUS.MISMATCH: return theme.palette.error.main;
      default: return theme.palette.warning.main;
    }
  };

  return (
    <Grow in timeout={300}>
      <Card 
        sx={{ 
          mb: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: alpha(getStatusColor(), 0.3),
          bgcolor: alpha(getStatusColor(), 0.02),
          transition: 'all 0.3s',
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: `0 8px 16px ${alpha(getStatusColor(), 0.2)}`
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            bgcolor: getStatusColor(),
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: alpha(getStatusColor(), 0.1),
                color: getStatusColor(),
                mr: 2,
                width: 40,
                height: 40
              }}
            >
              {getFieldIcon(result.field_name)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {formatFieldName(result.field_name)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <StatusBadge status={result.status} />
                {result.logical_error && (
                  <Tooltip title={result.logical_error}>
                    <WarningAmberIcon fontSize="small" color="warning" />
                  </Tooltip>
                )}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title={expanded ? 'Show less' : 'Show details'}>
                <IconButton 
                  size="small" 
                  onClick={() => setExpanded(!expanded)}
                  sx={{
                    bgcolor: expanded ? alpha(getStatusColor(), 0.1) : 'transparent',
                    '&:hover': { bgcolor: alpha(getStatusColor(), 0.1) }
                  }}
                >
                  {expanded ? <CloseIcon /> : <InfoIcon />}
                </IconButton>
              </Tooltip>
              {isError && userRole === 'staff' && (
                <Tooltip title="Request correction">
                  <IconButton 
                    size="small" 
                    color="warning"
                    onClick={() => onRequestCorrection(result.field_name, result.care_card_value || '')}
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) }
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    RADET Value
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      borderColor: alpha(theme.palette.info.main, 0.3),
                      borderRadius: 1.5
                    }}
                  >
                    <Typography variant="body2" fontFamily="monospace">
                      {formatDate(result.radet_value)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Care Card Value
                  </Typography>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 1.5,
                      bgcolor: result.status === VALIDATION_STATUS.UPDATED_RECORD
                        ? alpha(theme.palette.success.main, 0.05)
                        : alpha(theme.palette.warning.main, 0.05),
                      borderColor: result.status === VALIDATION_STATUS.UPDATED_RECORD
                        ? alpha(theme.palette.success.main, 0.3)
                        : alpha(theme.palette.warning.main, 0.3),
                      borderRadius: 1.5
                    }}
                  >
                    <Typography variant="body2" fontFamily="monospace">
                      {formatDate(result.care_card_value)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {result.logical_error && (
                <Alert 
                  severity="warning" 
                  sx={{ mt: 2, borderRadius: 1.5 }}
                  icon={<WarningAmberIcon />}
                >
                  {result.logical_error}
                </Alert>
              )}

              {result.validation_date && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Typography variant="caption" color="text.secondary">
                    Validated: {formatDateTime(result.validation_date)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Grow>
  );
});

FieldComparisonCard.displayName = 'FieldComparisonCard';

// ==================== PATIENT TIMELINE COMPONENT ====================

interface PatientTimelineProps {
  events: ClinicalEvent[];
}

const PatientTimeline = memo(({ events }: PatientTimelineProps) => {
  const theme = useTheme();

  const getEventConfig = (type: string) => {
    return EVENT_TYPES[type as keyof typeof EVENT_TYPES] || {
      label: type,
      icon: <EventIcon />,
      color: 'grey',
      description: 'Clinical event'
    };
  };

  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <EventIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Events Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          No clinical events recorded for this patient
        </Typography>
      </Box>
    );
  }

  return (
    <Timeline position="right" sx={{ 
      '& .MuiTimelineItem-root:before': { 
        flex: 0,
        padding: 0
      }
    }}>
      {events.map((event, index) => {
        const config = getEventConfig(event.event_type);
        return (
          <TimelineItem key={event.id}>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
              <Typography variant="body2" fontWeight="medium">
                {new Date(event.event_date).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(event.event_date).toLocaleTimeString('en-GB', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={config.color as any} sx={{ boxShadow: `0 0 0 4px ${alpha(theme.palette[config.color].main, 0.2)}` }}>
                {config.icon}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <GlassPaper 
                elevation={0}
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha(theme.palette[config.color].main, 0.2),
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: theme.palette[config.color].main
                  }
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {config.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  {config.description}
                </Typography>
                {event.value && (
                  <Chip
                    size="small"
                    label={`Value: ${event.value}`}
                    sx={{ mt: 1, bgcolor: alpha(theme.palette[config.color].main, 0.1) }}
                  />
                )}
                {event.notes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {event.notes}
                  </Typography>
                )}
              </GlassPaper>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
});

PatientTimeline.displayName = 'PatientTimeline';

// ==================== FORM SECTION COMPONENT ====================

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color?: string;
}

const FormSection = memo(({ title, icon, children, color = 'primary' }: FormSectionProps) => {
  const theme = useTheme();
  
  return (
    <GlassPaper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar 
          sx={{ 
            bgcolor: alpha(theme.palette[color].main, 0.1),
            color: theme.palette[color].main,
            mr: 2,
            width: 40,
            height: 40
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      {children}
    </GlassPaper>
  );
});

FormSection.displayName = 'FormSection';

// ==================== STATS CARD COMPONENT ====================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  total?: number;
}

const StatsCard = memo(({ icon, label, value, color, total }: StatsCardProps) => {
  const theme = useTheme();
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <Card sx={{ 
      bgcolor: alpha(theme.palette[color].main, 0.05),
      border: '1px solid',
      borderColor: alpha(theme.palette[color].main, 0.2),
      borderRadius: 2
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
        {total && (
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette[color].main, 0.1),
              '& .MuiLinearProgress-bar': {
                bgcolor: `${color}.main`,
                borderRadius: 3
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
});

StatsCard.displayName = 'StatsCard';

// ==================== MAIN COMPONENT ====================

interface ValidationModuleProps {
  user: User;
  activeCycle: any;
}

export default function ValidationModule({ user, activeCycle }: ValidationModuleProps) {
  const theme = useTheme();
  
  // State
  const [step, setStep] = useState(0);
  const [hospitalNumber, setHospitalNumber] = useState('');
  const [clientExists, setClientExists] = useState<boolean | null>(null);
  const [clientDetails, setClientDetails] = useState<any>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isAlreadyValidated, setIsAlreadyValidated] = useState(false);
  const [existingValidationInfo, setExistingValidationInfo] = useState<ExistingValidationResponse | null>(null);
  const [formData, setFormData] = useState<CareCardData>({
    hospital_number: '',
    date_of_birth: '',
    sex: '',
    art_start_date: '',
    current_regimen: '',
    last_drug_pickup: '',
    months_of_arv_dispensed: null,
    last_vl_sample_date: '',
    last_vl_result: null,
    last_vl_result_date: '',
    last_clinic_visit: ''
  });
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [patientEvents, setPatientEvents] = useState<ClinicalEvent[]>([]);
  const [eventsDialogOpen, setEventsDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [selectedFieldValue, setSelectedFieldValue] = useState<string>('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctionValue, setCorrectionValue] = useState('');
  const [newEventType, setNewEventType] = useState<keyof typeof EVENT_TYPES>('drug_pickup');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventValue, setNewEventValue] = useState('');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'warning' | 'info' 
  });

  // Load search history
  useEffect(() => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  }, []);

  // Save to history
  const saveToHistory = useCallback((hospitalNumber: string) => {
    setSearchHistory(prev => {
      const updated = [hospitalNumber, ...prev.filter(h => h !== hospitalNumber)]
        .slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving search history:', error);
      }
      return updated;
    });
  }, []);

  // Check if patient was already validated
  const checkIfAlreadyValidated = useCallback(async (hospitalNumber: string) => {
    try {
      const response = await validation.checkValidationStatus(hospitalNumber);
      setIsAlreadyValidated(response.hasValidations);
      
      if (response.hasValidations) {
        // Load existing validation data to pre-fill form
        const existingData = await validation.getExistingValidation(hospitalNumber);
        setExistingValidationInfo(existingData);
        
        if (existingData && existingData.careCardData) {
          // Pre-fill form with existing care card values
          setFormData(prev => ({
            ...prev,
            ...existingData.careCardData
          }));
        }
      }
      
      return response.hasValidations;
    } catch (error) {
      console.error('Error checking validation status:', error);
      return false;
    }
  }, []);

  // Handlers
  async function handleCheckClient() {
    if (!hospitalNumber.trim()) {
      showSnackbar('Please enter a hospital number', 'warning');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await validation.checkClient(hospitalNumber);
      setClientExists(response.exists);
      setClientDetails(response);

      if (response.exists) {
        saveToHistory(hospitalNumber);
        setFormData(prev => ({ ...prev, hospital_number: hospitalNumber }));
        
        // Check if already validated
        const validated = await checkIfAlreadyValidated(hospitalNumber);
        
        if (validated) {
          // Show warning but still allow updates
          showSnackbar(
            existingValidationInfo?.validator 
              ? `This patient was previously validated by ${existingValidationInfo.validator}. You can update the existing validation.`
              : 'This patient has already been validated. You can update the existing validation.',
            'info'
          );
        }
        
        setStep(1);
        
        const eventData = await events.getPatientEvents(hospitalNumber);
        setPatientEvents(eventData);
      } else {
        showSnackbar('Client not found in RADET', 'error');
      }
    } catch (error) {
      showSnackbar('Error checking client', 'error');
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSubmitValidation() {
    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      showSnackbar(`Please fill in required fields: ${missingFields.map(formatFieldName).join(', ')}`, 'warning');
      return;
    }

    setLoading(true);
    try {
      const results = await validation.submit(formData);
      setValidationResults(results);
      setStep(2);
      
      // Show appropriate success message
      if (isAlreadyValidated) {
        showSnackbar('Validation updated successfully', 'success');
      } else {
        showSnackbar('Validation submitted successfully', 'success');
      }
    } catch (error) {
      showSnackbar('Error submitting validation', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEvent() {
    if (!newEventDate) {
      showSnackbar('Please select an event date', 'warning');
      return;
    }

    setLoading(true);
    try {
      await events.addEvent(
        hospitalNumber,
        newEventType,
        newEventDate,
        newEventValue ? Number(newEventValue) : undefined,
        newEventNotes || undefined
      );

      const updatedEvents = await events.getPatientEvents(hospitalNumber);
      setPatientEvents(updatedEvents);

      setAddEventDialogOpen(false);
      resetEventForm();
      showSnackbar('Event added successfully', 'success');
    } catch (error) {
      showSnackbar('Error adding event', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestCorrection() {
    if (!correctionReason || !correctionValue) {
      showSnackbar('Please provide reason and new value', 'warning');
      return;
    }

    setLoading(true);
    try {
      await supervisor.requestCorrection(
        hospitalNumber,
        selectedField,
        correctionValue,
        correctionReason
      );

      setCorrectionDialogOpen(false);
      resetCorrectionForm();
      showSnackbar('Correction request submitted for approval', 'success');
    } catch (error) {
      showSnackbar('Error submitting correction request', 'error');
    } finally {
      setLoading(false);
    }
  }

  // Helper functions
  function showSnackbar(message: string, severity: 'success' | 'error' | 'warning' | 'info') {
    setSnackbar({ open: true, message, severity });
  }

  function resetEventForm() {
    setNewEventDate('');
    setNewEventValue('');
    setNewEventNotes('');
  }

  function resetCorrectionForm() {
    setCorrectionReason('');
    setCorrectionValue('');
  }

  function resetForm() {
    setStep(0);
    setHospitalNumber('');
    setClientExists(null);
    setClientDetails(null);
    setIsAlreadyValidated(false);
    setExistingValidationInfo(null);
    setFormData({
      hospital_number: '',
      date_of_birth: '',
      sex: '',
      art_start_date: '',
      current_regimen: '',
      last_drug_pickup: '',
      months_of_arv_dispensed: null,
      last_vl_sample_date: '',
      last_vl_result: null,
      last_vl_result_date: '',
      last_clinic_visit: ''
    });
    setValidationResults([]);
    setPatientEvents([]);
  }

  // Computed values
  const summaryStats = useMemo(() => ({
    matches: validationResults.filter(r => r.status === VALIDATION_STATUS.MATCH).length,
    mismatches: validationResults.filter(r => r.status === VALIDATION_STATUS.MISMATCH).length,
    missing: validationResults.filter(r => 
      r.status === VALIDATION_STATUS.MISSING_IN_RADET || 
      r.status === VALIDATION_STATUS.MISSING_IN_CARD
    ).length,
    logicalErrors: validationResults.filter(r => r.status === VALIDATION_STATUS.LOGICAL_ERROR).length,
    updated: validationResults.filter(r => r.status === VALIDATION_STATUS.UPDATED_RECORD).length
  }), [validationResults]);

  const totalValidations = validationResults.length;
  const accuracyRate = totalValidations > 0 
    ? Math.round((summaryStats.matches / totalValidations) * 100) 
    : 0;

  // Render
  if (!activeCycle?.has_active_cycle) {
    return (
      <Fade in timeout={800}>
        <GlassPaper 
          sx={{ 
            p: 8, 
            textAlign: 'center',
            borderRadius: 4,
            borderColor: alpha(theme.palette.warning.main, 0.3)
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            No Active Validation Cycle
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Please contact your supervisor to start a new validation cycle before you can begin validating patient records.
          </Typography>
          <Button 
            variant="contained" 
            color="warning"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ 
              py: 1.5,
              px: 4,
              borderRadius: 3,
              fontSize: '1.1rem'
            }}
          >
            Refresh
          </Button>
        </GlassPaper>
      </Fade>
    );
  }

  return (
    <Box>
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
                Client Data Validation
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<CalendarIcon />}
                  label={`Active Cycle: ${activeCycle.name}`}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                <Chip
                  icon={<PersonIcon />}
                  label={user.full_name}
                  color="secondary"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
                {step > 0 && (
                  <Chip
                    icon={<AssignmentIcon />}
                    label={`Patient: ${hospitalNumber}`}
                    color="info"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                )}
                {clientDetails?.months_of_arv_dispensed && (
                  <Chip
                    icon={<MedicationIcon />}
                    label={`ARV: ${clientDetails.months_of_arv_dispensed} months`}
                    color="success"
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  />
                )}
                {isAlreadyValidated && (
                  <Chip
                    icon={<UpdateIcon />}
                    label="Previously Validated"
                    color="warning"
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                  />
                )}
              </Box>
            </Box>
            <Tooltip title="Start Over">
              <IconButton 
                onClick={resetForm}
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                  width: 48,
                  height: 48
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Existing Validation Info Alert */}
          {isAlreadyValidated && existingValidationInfo && (
            <Alert 
              severity="info" 
              sx={{ mt: 2, borderRadius: 2 }}
              icon={<UpdateIcon />}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  This patient was previously validated
                </Typography>
                <Typography variant="caption" display="block">
                  {existingValidationInfo.validator && `Validator: ${existingValidationInfo.validator}`}
                  {existingValidationInfo.lastValidation && ` • Last validation: ${new Date(existingValidationInfo.lastValidation).toLocaleString()}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Submitting this form will UPDATE the existing validation record.
                </Typography>
              </Box>
            </Alert>
          )}
        </GlassPaper>
      </Fade>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Main Validation Stepper */}
          <GlassPaper sx={{ p: 3, borderRadius: 3 }}>
            <Stepper activeStep={step} orientation="vertical">
              {/* Step 1: Search Client */}
              <Step>
                <StepLabel
                  StepIconProps={{
                    icon: step > 0 ? <CheckCircleIcon /> : <SearchIcon />
                  }}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Search Patient
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          label="Hospital Number"
                          value={hospitalNumber}
                          onChange={(e) => setHospitalNumber(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCheckClient()}
                          placeholder="Enter patient hospital number"
                          variant="outlined"
                          error={clientExists === false}
                          helperText={clientExists === false ? 'Client not found in RADET database' : ''}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: searchLoading && (
                              <InputAdornment position="end">
                                <CircularProgress size={24} />
                              </InputAdornment>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                      </Grid>

                      {/* Search History */}
                      {searchHistory.length > 0 && (
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            Recent Searches
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {searchHistory.map((hn) => (
                              <Chip
                                key={hn}
                                label={hn}
                                size="small"
                                onClick={() => {
                                  setHospitalNumber(hn);
                                  handleCheckClient();
                                }}
                                icon={<HistoryIcon />}
                                variant="outlined"
                                sx={{ borderRadius: 1.5 }}
                              />
                            ))}
                          </Box>
                        </Grid>
                      )}

                      <Grid size={{ xs: 12 }}>
                        <Button
                          variant="contained"
                          size="large"
                          startIcon={<SearchIcon />}
                          onClick={handleCheckClient}
                          disabled={!hospitalNumber || searchLoading}
                          sx={{ 
                            py: 1.5,
                            px: 4,
                            borderRadius: 2,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            transition: 'all 0.3s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`
                            }
                          }}
                        >
                          {searchLoading ? 'Searching...' : 'Check Client'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 2: Enter Care Card Data */}
              <Step>
                <StepLabel
                  StepIconProps={{
                    icon: step > 1 ? <CheckCircleIcon /> : <AssignmentIcon />
                  }}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Enter Care Card Data
                    {isAlreadyValidated && (
                      <Chip
                        size="small"
                        label="Update Mode"
                        color="warning"
                        icon={<UpdateIcon />}
                        sx={{ ml: 2 }}
                      />
                    )}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                      {/* Demographics Section */}
                      <Grid size={{ xs: 12 }}>
                        <FormSection title="Demographics" icon={<PersonIcon />} color="primary">
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                required
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <FormControl fullWidth required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
                                <InputLabel>Sex</InputLabel>
                                <Select
                                  value={formData.sex}
                                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                  label="Sex"
                                >
                                  <MenuItem value="M">Male</MenuItem>
                                  <MenuItem value="F">Female</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>
                        </FormSection>
                      </Grid>

                      {/* ART Information */}
                      <Grid size={{ xs: 12 }}>
                        <FormSection title="ART Information" icon={<MedicalIcon />} color="success">
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="ART Start Date"
                                type="date"
                                value={formData.art_start_date}
                                onChange={(e) => setFormData({ ...formData, art_start_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Current Regimen"
                                value={formData.current_regimen}
                                onChange={(e) => setFormData({ ...formData, current_regimen: e.target.value })}
                                placeholder="e.g., TLD, TLE"
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </FormSection>
                      </Grid>

                      {/* Recent Events */}
                      <Grid size={{ xs: 12 }}>
                        <FormSection title="Recent Events" icon={<EventIcon />} color="info">
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Last Drug Pickup"
                                type="date"
                                value={formData.last_drug_pickup}
                                onChange={(e) => setFormData({ ...formData, last_drug_pickup: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Months of ARV Dispensed"
                                type="number"
                                value={formData.months_of_arv_dispensed ?? ''}
                                onChange={(e) => setFormData({ 
                                  ...formData, 
                                  months_of_arv_dispensed: e.target.value ? Number(e.target.value) : null 
                                })}
                                InputLabelProps={{ shrink: true }}
                                placeholder="Enter months"
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 6 }}>
                              <TextField
                                fullWidth
                                label="Last Clinic Visit"
                                type="date"
                                value={formData.last_clinic_visit}
                                onChange={(e) => setFormData({ ...formData, last_clinic_visit: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </FormSection>
                      </Grid>

                      {/* Viral Load */}
                      <Grid size={{ xs: 12 }}>
                        <FormSection title="Viral Load" icon={<ScienceIcon />} color="warning">
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Last VL Sample Date"
                                type="date"
                                value={formData.last_vl_sample_date}
                                onChange={(e) => setFormData({ ...formData, last_vl_sample_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Last VL Result"
                                type="number"
                                value={formData.last_vl_result ?? ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  last_vl_result: e.target.value ? Number(e.target.value) : null
                                })}
                                placeholder="Enter value"
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <TextField
                                fullWidth
                                label="Last VL Result Date"
                                type="date"
                                value={formData.last_vl_result_date}
                                onChange={(e) => setFormData({ ...formData, last_vl_result_date: e.target.value })}
                                InputLabelProps={{ shrink: true }}
                                variant="outlined"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          </Grid>
                        </FormSection>
                      </Grid>

                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={isAlreadyValidated ? <UpdateIcon /> : <SaveIcon />}
                            onClick={handleSubmitValidation}
                            disabled={loading}
                            sx={{ 
                              py: 1.5,
                              px: 4,
                              borderRadius: 2,
                              background: isAlreadyValidated 
                                ? `linear-gradient(45deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                                : `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                              transition: 'all 0.3s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: isAlreadyValidated
                                  ? `0 8px 16px ${alpha(theme.palette.warning.main, 0.3)}`
                                  : `0 8px 16px ${alpha(theme.palette.success.main, 0.3)}`
                              }
                            }}
                          >
                            {loading 
                              ? 'Submitting...' 
                              : isAlreadyValidated 
                                ? 'Update Validation' 
                                : 'Submit Validation'}
                          </Button>
                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() => setStep(0)}
                            sx={{ borderRadius: 2 }}
                          >
                            Back
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </StepContent>
              </Step>

              {/* Step 3: Results */}
              <Step>
                <StepLabel
                  StepIconProps={{
                    icon: <CheckCircleIcon />
                  }}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontWeight: 600
                    }
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Validation Results
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2 }}>
                    {validationResults.length > 0 ? (
                      <>
                        {/* Summary Stats */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <StatsCard
                              icon={<TaskAltIcon />}
                              label="Matches"
                              value={summaryStats.matches}
                              color="success"
                              total={totalValidations}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <StatsCard
                              icon={<HighlightOffIcon />}
                              label="Mismatches"
                              value={summaryStats.mismatches}
                              color="error"
                              total={totalValidations}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <StatsCard
                              icon={<ErrorOutlineIcon />}
                              label="Missing"
                              value={summaryStats.missing}
                              color="warning"
                              total={totalValidations}
                            />
                          </Grid>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <StatsCard
                              icon={<WarningAmberIcon />}
                              label="Logical Errors"
                              value={summaryStats.logicalErrors}
                              color="error"
                              total={totalValidations}
                            />
                          </Grid>
                        </Grid>

                        {/* Accuracy Card */}
                        <Card sx={{ mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 2 }}>
                                  <RuleIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Data Quality Score
                                  </Typography>
                                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                                    {accuracyRate}%
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ width: 200 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={accuracyRate}
                                  sx={{
                                    height: 10,
                                    borderRadius: 5,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: accuracyRate >= 90 ? 'success.main' : 
                                              accuracyRate >= 75 ? 'warning.main' : 'error.main',
                                      borderRadius: 5
                                    }
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>

                        {/* Update notification if this was an update */}
                        {isAlreadyValidated && (
                          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            Validation record has been successfully updated with the new data.
                          </Alert>
                        )}

                        {/* Detailed Results */}
                        {validationResults.map((result, index) => (
                          <FieldComparisonCard 
                            key={`${result.field_name}-${index}`} 
                            result={result}
                            onRequestCorrection={(field, value) => {
                              setSelectedField(field);
                              setSelectedFieldValue(value);
                              setCorrectionValue(value);
                              setCorrectionDialogOpen(true);
                            }}
                            userRole={user.role}
                          />
                        ))}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setStep(1)}
                            sx={{ borderRadius: 2 }}
                          >
                            Validate Another Patient
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={resetForm}
                            sx={{ borderRadius: 2 }}
                          >
                            New Validation
                          </Button>
                          {summaryStats.mismatches + summaryStats.logicalErrors > 0 && (
                            <Button
                              variant="contained"
                              color="warning"
                              startIcon={<ReportProblemIcon />}
                              onClick={() => window.location.href = '/reviews'}
                              sx={{ borderRadius: 2 }}
                            >
                              Review Issues
                            </Button>
                          )}
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Loading results...</Typography>
                      </Box>
                    )}
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          </GlassPaper>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Patient Info Card */}
            {clientExists && (
              <Zoom in timeout={500}>
                <GlassPaper sx={{ p: 3, borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Patient
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {hospitalNumber}
                      </Typography>
                    </Box>
                  </Box>

                  {clientDetails?.months_of_arv_dispensed && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<MedicationIcon />}
                        label={`ARV Dispensed: ${clientDetails.months_of_arv_dispensed} months`}
                        color="success"
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  )}

                  {isAlreadyValidated && existingValidationInfo && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        icon={<UpdateIcon />}
                        label="Previously Validated"
                        color="warning"
                        size="small"
                        sx={{ borderRadius: 2 }}
                      />
                      {existingValidationInfo.lastValidation && (
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                          Last validated: {new Date(existingValidationInfo.lastValidation).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<HistoryIcon />}
                      onClick={() => setEventsDialogOpen(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      History
                    </Button>
                    {user.role !== 'staff' && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setAddEventDialogOpen(true)}
                        color="primary"
                        sx={{ borderRadius: 2 }}
                      >
                        Add Event
                      </Button>
                    )}
                  </Box>

                  {/* Recent Events Preview */}
                  {patientEvents.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Recent Events
                      </Typography>
                      <List dense>
                        {patientEvents.slice(0, 3).map((event) => {
                          const config = EVENT_TYPES[event.event_type as keyof typeof EVENT_TYPES];
                          return (
                            <ListItem key={event.id} disableGutters>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <Badge
                                  color={config?.color as any}
                                  variant="dot"
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      right: -4,
                                      top: 4
                                    }
                                  }}
                                >
                                  <EventIcon fontSize="small" color="action" />
                                </Badge>
                              </ListItemIcon>
                              <ListItemText
                                primary={config?.label || event.event_type}
                                secondary={new Date(event.event_date).toLocaleDateString()}
                                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                      {patientEvents.length > 3 && (
                        <Button
                          size="small"
                          onClick={() => setEventsDialogOpen(true)}
                          endIcon={<ArrowForwardIcon />}
                        >
                          View all ({patientEvents.length})
                        </Button>
                      )}
                    </Box>
                  )}
                </GlassPaper>
              </Zoom>
            )}

            {/* Quick Actions Card */}
            <GlassPaper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HistoryIcon />}
                  onClick={() => setEventsDialogOpen(true)}
                  disabled={!clientExists}
                  sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                >
                  View Patient History
                </Button>
                {user.role !== 'staff' && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => setAddEventDialogOpen(true)}
                    disabled={!clientExists}
                    sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                  >
                    Add Clinical Event
                  </Button>
                )}
                {user.role !== 'staff' && validationResults.length > 0 && (
                  <Button
                    fullWidth
                    variant="outlined"
                    color="warning"
                    startIcon={<HowToRegIcon />}
                    onClick={() => window.location.href = '/reviews'}
                    sx={{ borderRadius: 2, justifyContent: 'flex-start' }}
                  >
                    Review Pending Corrections
                  </Button>
                )}
              </Stack>
            </GlassPaper>

            {/* Help Card */}
            <GlassPaper sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.05) }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: 'info.main', mr: 1.5, width: 32, height: 32 }}>
                  <HelpIcon />
                </Avatar>
                <Typography variant="subtitle2" fontWeight="bold">
                  Validation Tips
                </Typography>
              </Box>
              <List dense>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Enter dates in YYYY-MM-DD format" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="VL results should be numeric values" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Logical errors require supervisor review" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary="Updated records show newer care card data" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <UpdateIcon fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Previously validated patients can be updated" />
                </ListItem>
              </List>
            </GlassPaper>

            {/* Cycle Info */}
            <GlassPaper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Cycle Information
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2">
                  Started: {new Date(activeCycle.start_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <Typography variant="body2" noWrap>
                  {activeCycle.description || 'No description'}
                </Typography>
              </Box>
              {activeCycle.stats && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Total Patients: {activeCycle.stats.total_patients}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Validated: {activeCycle.stats.validated_patients}
                  </Typography>
                </Box>
              )}
            </GlassPaper>
          </Stack>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <Dialog 
        open={eventsDialogOpen} 
        onClose={() => setEventsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <HistoryIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">Patient Clinical History</Typography>
                <Typography variant="caption" color="text.secondary">
                  {hospitalNumber}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => setEventsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, maxHeight: 600, overflow: 'auto' }}>
          <PatientTimeline events={patientEvents} />
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={() => setEventsDialogOpen(false)} 
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
          {user.role !== 'staff' && (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                setEventsDialogOpen(false);
                setAddEventDialogOpen(true);
              }}
              sx={{ borderRadius: 2 }}
            >
              Add Event
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog 
        open={addEventDialogOpen} 
        onClose={() => setAddEventDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Add Clinical Event</Typography>
              <Typography variant="caption" color="text.secondary">
                {hospitalNumber}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as keyof typeof EVENT_TYPES)}
                  label="Event Type"
                  sx={{ borderRadius: 2 }}
                >
                  {Object.entries(EVENT_TYPES).map(([value, { label, description }]) => (
                    <MenuItem key={value} value={value}>
                      <Box>
                        <Typography>{label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Event Date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {(newEventType === 'vl_result' || newEventType === 'drug_pickup') && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={newEventType === 'vl_result' ? 'VL Result Value' : 'Months Dispensed'}
                  type="number"
                  value={newEventValue}
                  onChange={(e) => setNewEventValue(e.target.value)}
                  placeholder={newEventType === 'vl_result' ? 'Enter VL result' : 'Enter months dispensed'}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            )}

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={newEventNotes}
                onChange={(e) => setNewEventNotes(e.target.value)}
                multiline
                rows={2}
                placeholder="Any additional notes about this event"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setAddEventDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddEvent} 
            variant="contained"
            disabled={!newEventDate || loading}
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`
              }
            }}
          >
            {loading ? 'Adding...' : 'Add Event'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={correctionDialogOpen} 
        onClose={() => setCorrectionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{ 
          sx: { 
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
              <WarningIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">Request Correction</Typography>
              <Typography variant="caption" color="text.secondary">
                Field: {formatFieldName(selectedField)}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Current Value"
                value={selectedFieldValue}
                disabled
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="New Value"
                value={correctionValue}
                onChange={(e) => setCorrectionValue(e.target.value)}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Reason for Correction"
                value={correctionReason}
                onChange={(e) => setCorrectionReason(e.target.value)}
                multiline
                rows={3}
                required
                placeholder="Please explain why this correction is needed..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setCorrectionDialogOpen(false)} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRequestCorrection} 
            variant="contained"
            color="warning"
            disabled={!correctionReason || !correctionValue || loading}
            sx={{ borderRadius: 2 }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
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
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: 300
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: 'blur(5px)'
        }}
        open={loading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" size={60} />
          <Typography sx={{ mt: 2 }}>Processing...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
}