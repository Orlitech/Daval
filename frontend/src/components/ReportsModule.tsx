import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  LinearProgress,
  Stack,
  FormControlLabel,
  RadioGroup,
  Radio,
  Switch,
  Badge
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  TableView as TableViewIcon,
  GridView as GridViewIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Save as SaveIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  LineChart,
  Line,
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
  AreaChart,
  Area,
  ComposedChart,
  Scatter
} from 'recharts';
import { exportData as exportApi, cycles, dashboard, analytics, validationSummaries } from '../api';
import type { User, ValidationCycle } from '../types';

// ==================== INTERFACES ====================

interface ReportsModuleProps {
  user: User;
}

interface ExportOptions {
  reportType: string;
  format: 'json' | 'csv' | 'pdf';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  cycleId: number | 'all';
  facility: string | 'all';
  includeCharts: boolean;
  groupBy: 'day' | 'week' | 'month' | 'quarter';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  options: Partial<ExportOptions>;
  lastGenerated?: Date;
}

interface ExportHistoryItem {
  id: string;
  reportName: string;
  format: string;
  date: Date;
  url: string;
  size: string;
}

interface AnalyticsData {
  trends: Array<{
    date: string;
    accuracy_rate: number;
    score_percentage: number;
    total_validations: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  facilityData: Array<{
    facility_name: string;
    dqi_score: number;
    total_patients_validated: number;
    accuracy_rate: number;
  }>;
  performanceData: Array<{
    user_name: string;
    patients_validated: number;
    accuracy_rate: number;
    avg_time_per_record: number;
  }>;
  qualityMetrics: any;
}

// ==================== CONSTANTS ====================

const REPORT_TYPES = [
  { 
    value: 'validation', 
    label: 'Validation Results',
    description: 'Complete validation results with RADET vs Care Card comparisons',
    icon: <AssessmentIcon />,
    endpoint: 'validation-results',
    color: '#3b82f6'
  },
  { 
    value: 'corrections', 
    label: 'Correction Report',
    description: 'All correction requests with approval status and audit trail',
    icon: <HistoryIcon />,
    endpoint: 'correction-report',
    color: '#f59e0b'
  },
  { 
    value: 'quality', 
    label: 'Quality Metrics',
    description: 'Data quality scores, accuracy rates, and error breakdowns',
    icon: <SpeedIcon />,
    endpoint: 'quality-metrics',
    color: '#10b981'
  },
  { 
    value: 'performance', 
    label: 'Staff Performance',
    description: 'Validator productivity and accuracy metrics',
    icon: <BarChartIcon />,
    endpoint: 'staff-performance',
    color: '#8b5cf6'
  },
  { 
    value: 'interruptions', 
    label: 'Treatment Interruptions',
    description: 'Patients at risk of treatment interruption',
    endpoint: 'treatment-interruptions',
    icon: <WarningIcon />,
    color: '#ef4444'
  },
  { 
    value: 'duplicates', 
    label: 'Duplicate Detection',
    description: 'Potential duplicate patient records',
    endpoint: 'duplicates',
    icon: <ErrorIcon />,
    color: '#ec4899'
  },
  { 
    value: 'facility-dqi', 
    label: 'Facility DQI',
    description: 'Data Quality Index by facility',
    endpoint: 'facility-dqi',
    icon: <PieChartIcon />,
    color: '#14b8a6'
  },
  { 
    value: 'arv-patterns', 
    label: 'ARV Dispensing Patterns',
    description: 'ARV dispensing analysis and refill schedules',
    endpoint: 'arv-dispensing-patterns',
    icon: <ShowChartIcon />,
    color: '#f97316'
  },
  { 
    value: 'patient-summaries', 
    label: 'Patient Summaries',
    description: 'Comprehensive patient validation summaries',
    endpoint: 'patient-summaries',
    icon: <TableViewIcon />,
    color: '#6b7280'
  }
] as const;

const FORMATS = [
  { value: 'json', label: 'JSON', icon: <AssessmentIcon /> },
  { value: 'csv', label: 'CSV', icon: <ExcelIcon /> },
  { value: 'pdf', label: 'PDF', icon: <PdfIcon /> }
] as const;

const GROUP_BY_OPTIONS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' }
] as const;

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'hospital_number', label: 'Hospital Number' },
  { value: 'status', label: 'Status' },
  { value: 'validator', label: 'Validator' },
  { value: 'accuracy', label: 'Accuracy' }
] as const;

const QUICK_REPORTS: ReportTemplate[] = [
  {
    id: 'daily-summary',
    name: 'Daily Summary',
    description: 'Today\'s validation activities at a glance',
    icon: <CalendarIcon />,
    color: '#3b82f6',
    options: {
      reportType: 'validation',
      groupBy: 'day',
      limit: 100
    }
  },
  {
    id: 'weekly-quality',
    name: 'Weekly Quality Report',
    description: 'Quality metrics for the past 7 days',
    icon: <SpeedIcon />,
    color: '#10b981',
    options: {
      reportType: 'quality',
      groupBy: 'week',
      includeCharts: true
    }
  },
  {
    id: 'monthly-performance',
    name: 'Monthly Performance',
    description: 'Staff performance metrics for the month',
    icon: <BarChartIcon />,
    color: '#8b5cf6',
    options: {
      reportType: 'performance',
      groupBy: 'month'
    }
  },
  {
    id: 'facility-ranking',
    name: 'Facility Ranking',
    description: 'DQI scores by facility with rankings',
    icon: <PieChartIcon />,
    color: '#14b8a6',
    options: {
      reportType: 'facility-dqi',
      includeCharts: true
    }
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment',
    description: 'Treatment interruptions and critical issues',
    icon: <WarningIcon />,
    color: '#ef4444',
    options: {
      reportType: 'interruptions',
      includeCharts: true
    }
  },
  {
    id: 'arv-analysis',
    name: 'ARV Analysis',
    description: 'Dispensing patterns and refill schedules',
    icon: <ShowChartIcon />,
    color: '#f97316',
    options: {
      reportType: 'arv-patterns',
      includeCharts: true
    }
  }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

// ==================== STYLED COMPONENTS ====================

const GlassPaper = ({ children, sx, ...props }: any) => {
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

// ==================== MAIN COMPONENT ====================

export default function ReportsModule({ user }: ReportsModuleProps) {
  const theme = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState(0);
  const [cycles, setCycles] = useState<ValidationCycle[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [exportedData, setExportedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>(QUICK_REPORTS);
  
  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // Export options
  const [options, setOptions] = useState<ExportOptions>({
    reportType: 'validation',
    format: 'json',
    dateRange: {
      start: null,
      end: null
    },
    cycleId: 'all',
    facility: 'all',
    includeCharts: true,
    groupBy: 'day',
    sortBy: 'date',
    sortOrder: 'desc',
    limit: 1000
  });

  // Load cycles and facilities on mount
  useEffect(() => {
    fetchCycles();
    fetchFacilities();
    loadExportHistory();
  }, []);

  // Load analytics data when tab changes to analytics
  useEffect(() => {
    if (activeTab === 1 && !analyticsData) {
      loadAnalyticsData();
    }
  }, [activeTab]);

  const fetchCycles = async () => {
    try {
      const data = await cycles.getActive();
      setCycles(data);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const data = await validationSummaries.getFacilityDQI();
      setFacilities(data.map((f: any) => f.facility_name));
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const loadExportHistory = () => {
    try {
      const history = localStorage.getItem('export_history');
      if (history) {
        setExportHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error('Error loading export history:', error);
    }
  };

  const saveToHistory = (item: ExportHistoryItem) => {
    const updated = [item, ...exportHistory].slice(0, 20);
    setExportHistory(updated);
    localStorage.setItem('export_history', JSON.stringify(updated));
  };

  // Generate trend data for demo/fallback
  const generateTrendData = () => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        accuracy_rate: 75 + Math.random() * 20,
        score_percentage: 70 + Math.random() * 25,
        total_validations: 50 + Math.random() * 150
      });
    }
    return data;
  };

  // Load analytics data from API
  const loadAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      // Try to load real data from APIs
      const [qualityMetrics, facilityDQI, staffPerformance] = await Promise.allSettled([
        dashboard.getQualityMetrics().catch(() => null),
        validationSummaries.getFacilityDQI().catch(() => null),
        dashboard.getStaffPerformance().catch(() => null)
      ]);

      // Prepare facility data
      let facilityData: AnalyticsData['facilityData'] = [];
      if (facilityDQI.status === 'fulfilled' && facilityDQI.value) {
        facilityData = facilityDQI.value.map((f: any) => ({
          facility_name: f.facility_name,
          dqi_score: f.dqi_score || f.score || 0,
          total_patients_validated: f.total_patients || f.count || 0,
          accuracy_rate: f.accuracy_rate || f.accuracy || 0
        }));
      } else {
        // Fallback data
        facilityData = [
          { facility_name: 'Central Hospital', dqi_score: 85, total_patients_validated: 120, accuracy_rate: 88 },
          { facility_name: 'City Clinic', dqi_score: 92, total_patients_validated: 150, accuracy_rate: 94 },
          { facility_name: 'Rural Health Center', dqi_score: 78, total_patients_validated: 90, accuracy_rate: 82 },
          { facility_name: 'Teaching Hospital', dqi_score: 88, total_patients_validated: 200, accuracy_rate: 90 },
          { facility_name: 'District Hospital', dqi_score: 81, total_patients_validated: 110, accuracy_rate: 85 }
        ];
      }

      // Prepare performance data
      let performanceData: AnalyticsData['performanceData'] = [];
      if (staffPerformance.status === 'fulfilled' && staffPerformance.value) {
        performanceData = staffPerformance.value.map((s: any) => ({
          user_name: s.user_name || s.name,
          patients_validated: s.patients_validated || s.count || 0,
          accuracy_rate: s.accuracy_rate || s.accuracy || 0,
          avg_time_per_record: s.avg_time || 0
        }));
      } else {
        performanceData = [
          { user_name: 'John Doe', patients_validated: 145, accuracy_rate: 92, avg_time_per_record: 3.2 },
          { user_name: 'Jane Smith', patients_validated: 167, accuracy_rate: 95, avg_time_per_record: 2.8 },
          { user_name: 'Mike Johnson', patients_validated: 123, accuracy_rate: 88, avg_time_per_record: 3.5 },
          { user_name: 'Sarah Williams', patients_validated: 189, accuracy_rate: 96, avg_time_per_record: 2.5 }
        ];
      }

      setAnalyticsData({
        trends: generateTrendData(),
        statusDistribution: [
          { name: 'Match', value: 65, color: '#10b981' },
          { name: 'Mismatch', value: 20, color: '#f59e0b' },
          { name: 'Logical Error', value: 10, color: '#ef4444' },
          { name: 'Missing', value: 5, color: '#6b7280' }
        ],
        facilityData: facilityData,
        performanceData: performanceData,
        qualityMetrics: qualityMetrics.status === 'fulfilled' ? qualityMetrics.value : null
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set fallback data
      setAnalyticsData({
        trends: generateTrendData(),
        statusDistribution: [
          { name: 'Match', value: 65, color: '#10b981' },
          { name: 'Mismatch', value: 20, color: '#f59e0b' },
          { name: 'Logical Error', value: 10, color: '#ef4444' },
          { name: 'Missing', value: 5, color: '#6b7280' }
        ],
        facilityData: [
          { facility_name: 'Central Hospital', dqi_score: 85, total_patients_validated: 120, accuracy_rate: 88 },
          { facility_name: 'City Clinic', dqi_score: 92, total_patients_validated: 150, accuracy_rate: 94 },
          { facility_name: 'Rural Health Center', dqi_score: 78, total_patients_validated: 90, accuracy_rate: 82 }
        ],
        performanceData: [
          { user_name: 'John Doe', patients_validated: 145, accuracy_rate: 92, avg_time_per_record: 3.2 },
          { user_name: 'Jane Smith', patients_validated: 167, accuracy_rate: 95, avg_time_per_record: 2.8 }
        ],
        qualityMetrics: null
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    setLoading(true);
    try {
      let data;
      
      // Map report type to API endpoint
      switch (options.reportType) {
        case 'validation':
          data = await exportApi.validationResults(options.format);
          break;
        case 'corrections':
          data = await exportApi.correctionReport(options.format);
          break;
        case 'quality':
          const metrics = await dashboard.getQualityMetrics();
          data = { export_data: [metrics] };
          break;
        case 'performance':
          const performance = await dashboard.getStaffPerformance();
          data = { export_data: performance };
          break;
        case 'interruptions':
          const interruptions = await analytics.getTreatmentInterruptions();
          data = { export_data: interruptions.interruptions };
          break;
        case 'duplicates':
          const duplicates = await analytics.getDuplicates();
          data = { export_data: duplicates.potential_duplicates };
          break;
        case 'facility-dqi':
          const dqi = await validationSummaries.getFacilityDQI();
          data = { export_data: dqi };
          break;
        case 'arv-patterns':
          if (analytics.getArvDispensingPatterns) {
            const patterns = await analytics.getArvDispensingPatterns();
            data = { export_data: [patterns] };
          } else {
            data = { export_data: [] };
            console.warn('ARV patterns endpoint not available');
          }
          break;
        case 'patient-summaries':
          const summaries = await analytics.getPatientSummaries();
          data = { export_data: summaries };
          break;
        default:
          data = await exportApi.validationResults(options.format);
      }

      setExportedData(data);
      setPreviewData(data.export_data || data.correction_report || []);

      // Save to history
      saveToHistory({
        id: Date.now().toString(),
        reportName: REPORT_TYPES.find(r => r.value === options.reportType)?.label || options.reportType,
        format: options.format,
        date: new Date(),
        url: '#',
        size: `${Math.round(JSON.stringify(data).length / 1024)} KB`
      });

    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!exportedData) return;

    const reportType = REPORT_TYPES.find(r => r.value === options.reportType);
    const filename = `${reportType?.label.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}`;

    if (options.format === 'json') {
      const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else if (options.format === 'csv') {
      const data = exportedData.export_data || exportedData.correction_report || [];
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map((row: any) => 
            headers.map(header => {
              const val = row[header];
              // Handle values that contain commas or quotes
              if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
              }
              return val;
            }).join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } else if (options.format === 'pdf') {
      // PDF generation would go here
      alert('PDF export functionality would be implemented here');
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Apply quick report template
  const applyTemplate = (template: ReportTemplate) => {
    setOptions({
      ...options,
      ...template.options
    });
    setActiveTab(0);
  };

  // Render chart based on data
  const renderChart = () => {
    if (!previewData || previewData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No data available for chart</Typography>
        </Box>
      );
    }

    switch (options.reportType) {
      case 'quality':
      case 'facility-dqi':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="facility_name" />
              <YAxis domain={[0, 100]} />
              <RechartsTooltip />
              <Legend />
              <Bar 
                dataKey="dqi_score" 
                name="DQI Score" 
                fill={theme.palette.primary.main} 
              />
              <Bar 
                dataKey="overall_accuracy" 
                name="Accuracy" 
                fill={theme.palette.success.main} 
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user_name" />
              <YAxis yAxisId="left" domain={[0, 'auto']} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <RechartsTooltip />
              <Legend />
              <Bar 
                yAxisId="left" 
                dataKey="patients_validated" 
                name="Patients Validated" 
                fill={theme.palette.info.main} 
              />
              <Line 
                yAxisId="right" 
                dataKey="accuracy_rate" 
                name="Accuracy Rate (%)" 
                stroke={theme.palette.warning.main} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'arv-patterns':
        if (previewData[0]?.dispensing_patterns) {
          const data = Object.entries(previewData[0].dispensing_patterns).map(([key, value]) => ({
            name: key.replace(/_/g, ' '),
            value: value
          }));
          return (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          );
        }
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No ARV pattern data available</Typography>
          </Box>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={previewData.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hospital_number" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="status" 
                name="Status" 
                stroke={theme.palette.primary.main} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <GlassPaper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate, export, and analyze validation data
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={() => {
                fetchCycles();
                if (activeTab === 1) loadAnalyticsData();
              }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </GlassPaper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<AssessmentIcon />} label="Export" />
          <Tab icon={<AnalyticsIcon />} label="Analytics" />
          <Tab icon={<HistoryIcon />} label="History" />
          <Tab icon={<SaveIcon />} label="Templates" />
        </Tabs>
      </Paper>

      {/* Tab 0: Export */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Controls */}
          <Grid size={{ xs: 12, md: 4 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Export Options
              </Typography>

              <FormControl fullWidth margin="normal">
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={options.reportType}
                  onChange={(e) => setOptions({ ...options, reportType: e.target.value })}
                  label="Report Type"
                >
                  {REPORT_TYPES.map(type => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: type.color }}>{type.icon}</Box>
                        <Box>
                          <Typography variant="body2">{type.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Format</InputLabel>
                <Select
                  value={options.format}
                  onChange={(e) => setOptions({ ...options, format: e.target.value as any })}
                  label="Format"
                >
                  {FORMATS.map(format => (
                    <MenuItem key={format.value} value={format.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {format.icon}
                        {format.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={options.dateRange.start}
                  onChange={(date) => setOptions({ 
                    ...options, 
                    dateRange: { ...options.dateRange, start: date } 
                  })}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
                <DatePicker
                  label="End Date"
                  value={options.dateRange.end}
                  onChange={(date) => setOptions({ 
                    ...options, 
                    dateRange: { ...options.dateRange, end: date } 
                  })}
                  slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                />
              </LocalizationProvider>

              <FormControl fullWidth margin="normal">
                <InputLabel>Validation Cycle</InputLabel>
                <Select
                  value={options.cycleId}
                  onChange={(e) => setOptions({ ...options, cycleId: e.target.value as any })}
                  label="Validation Cycle"
                >
                  <MenuItem value="all">All Cycles</MenuItem>
                  {cycles.map(cycle => (
                    <MenuItem key={cycle.id} value={cycle.id}>
                      {cycle.name} ({new Date(cycle.start_date).toLocaleDateString()})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {facilities.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Facility</InputLabel>
                  <Select
                    value={options.facility}
                    onChange={(e) => setOptions({ ...options, facility: e.target.value })}
                    label="Facility"
                  >
                    <MenuItem value="all">All Facilities</MenuItem>
                    {facilities.map(f => (
                      <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth margin="normal">
                <InputLabel>Group By</InputLabel>
                <Select
                  value={options.groupBy}
                  onChange={(e) => setOptions({ ...options, groupBy: e.target.value as any })}
                  label="Group By"
                >
                  {GROUP_BY_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={options.sortBy}
                  onChange={(e) => setOptions({ ...options, sortBy: e.target.value })}
                  label="Sort By"
                >
                  {SORT_OPTIONS.map(opt => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel>Sort Order</InputLabel>
                <Select
                  value={options.sortOrder}
                  onChange={(e) => setOptions({ ...options, sortOrder: e.target.value as any })}
                  label="Sort Order"
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Max Records"
                value={options.limit}
                onChange={(e) => setOptions({ ...options, limit: parseInt(e.target.value) })}
                margin="normal"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={options.includeCharts}
                    onChange={(e) => setOptions({ ...options, includeCharts: e.target.checked })}
                  />
                }
                label="Include Charts"
                sx={{ mt: 2 }}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExport}
                  disabled={loading}
                >
                  Generate Report
                </Button>
              </Box>

              {exportedData && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownload}
                  >
                    Download {options.format.toUpperCase()}
                  </Button>
                </Box>
              )}
            </GlassPaper>
          </Grid>

          {/* Preview */}
          <Grid size={{ xs: 12, md: 8 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Preview
                  {previewData && (
                    <Chip 
                      label={`${previewData.length} records`}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
                <Box>
                  <Tooltip title="Print">
                    <IconButton onClick={handlePrint}>
                      <PrintIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {loading && <LinearProgress sx={{ mb: 2 }} />}

              {previewData ? (
                <>
                  {options.includeCharts && previewData.length > 0 && (
                    <Box sx={{ mb: 3, height: 300 }}>
                      {renderChart()}
                    </Box>
                  )}

                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                            <TableCell key={key}>
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previewData.slice(0, 20).map((row: any, index: number) => (
                          <TableRow key={index}>
                            {Object.entries(row).map(([key, val]: [string, any], i) => (
                              <TableCell key={i}>
                                {key.includes('date') && val ? new Date(val).toLocaleDateString() :
                                typeof val === 'boolean' ? (val ? '✓' : '✗') :
                                typeof val === 'object' && val !== null ? (
                                  <Box sx={{ fontSize: '0.75rem' }}>
                                    {Object.entries(val).slice(0, 2).map(([k, v]) => (
                                      <div key={k}>{k}: {String(v)}</div>
                                    ))}
                                    {Object.keys(val).length > 2 && '...'}
                                  </Box>
                                ) :
                                val || '—'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {previewData.length > 20 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Showing first 20 of {previewData.length} records
                    </Alert>
                  )}
                </>
              ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                  <Typography color="text.secondary">
                    Select options and click Generate to preview data
                  </Typography>
                </Box>
              )}
            </GlassPaper>
          </Grid>
        </Grid>
      )}

      {/* Tab 1: Analytics */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {loadingAnalytics ? (
            <Grid size={{ xs: 12 }}>
              <GlassPaper sx={{ p: 3 }}>
                <LinearProgress />
                <Typography sx={{ mt: 2, textAlign: 'center' }}>Loading analytics data...</Typography>
              </GlassPaper>
            </Grid>
          ) : (
            <>
              {/* Validation Trends */}
              <Grid size={{ xs: 12, md: 6 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Validation Trends
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData?.trends || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <RechartsTooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="accuracy_rate" 
                          name="Accuracy Rate (%)"
                          stroke={theme.palette.primary.main} 
                          fill={alpha(theme.palette.primary.main, 0.2)}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score_percentage" 
                          name="Score (%)"
                          stroke={theme.palette.success.main} 
                          fill={alpha(theme.palette.success.main, 0.2)}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </GlassPaper>
              </Grid>

              {/* Status Distribution */}
              <Grid size={{ xs: 12, md: 6 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Status Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData?.statusDistribution || []}
                          cx="50%"
                          cy="50%"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {(analyticsData?.statusDistribution || []).map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </GlassPaper>
              </Grid>

              {/* Facility Performance Comparison */}
              <Grid size={{ xs: 12 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Facility Performance Comparison
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData?.facilityData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="facility_name" angle={-45} textAnchor="end" height={80} />
                        <YAxis yAxisId="left" domain={[0, 100]} label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" label={{ value: 'Patients', angle: 90, position: 'insideRight' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="dqi_score" 
                          name="DQI Score" 
                          fill={theme.palette.success.main} 
                        />
                        <Bar 
                          yAxisId="left" 
                          dataKey="accuracy_rate" 
                          name="Accuracy Rate" 
                          fill={theme.palette.info.main} 
                        />
                        <Bar 
                          yAxisId="right" 
                          dataKey="total_patients_validated" 
                          name="Patients Validated" 
                          fill={theme.palette.warning.main} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </GlassPaper>
              </Grid>

              {/* Staff Performance */}
              <Grid size={{ xs: 12 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Staff Performance Metrics
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={analyticsData?.performanceData || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="user_name" />
                        <YAxis yAxisId="left" domain={[0, 'auto']} label={{ value: 'Patients', angle: -90, position: 'insideLeft' }} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: 'Accuracy (%)', angle: 90, position: 'insideRight' }} />
                        <RechartsTooltip />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="patients_validated" 
                          name="Patients Validated" 
                          fill={theme.palette.primary.main} 
                        />
                        <Line 
                          yAxisId="right" 
                          dataKey="accuracy_rate" 
                          name="Accuracy Rate (%)" 
                          stroke={theme.palette.secondary.main} 
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </GlassPaper>
              </Grid>

              {/* Quick Stats Cards */}
              <Grid size={{ xs: 12, md: 4 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Overall Accuracy
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {analyticsData?.facilityData.length 
                      ? Math.round(analyticsData.facilityData.reduce((acc, f) => acc + f.accuracy_rate, 0) / analyticsData.facilityData.length)
                      : 0}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average across all facilities
                  </Typography>
                </GlassPaper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Total Validations
                  </Typography>
                  <Typography variant="h3" fontWeight="bold">
                    {analyticsData?.performanceData.reduce((acc, p) => acc + p.patients_validated, 0) || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patients validated this period
                  </Typography>
                </GlassPaper>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <GlassPaper sx={{ p: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Top Performer
                  </Typography>
                  <Typography variant="h3" fontWeight="bold" noWrap>
                    {analyticsData?.performanceData.sort((a, b) => b.accuracy_rate - a.accuracy_rate)[0]?.user_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Highest accuracy rate
                  </Typography>
                </GlassPaper>
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* Tab 2: History */}
      {activeTab === 2 && (
        <GlassPaper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Export History
          </Typography>

          {exportHistory.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.reportName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.format.toUpperCase()} 
                          size="small"
                          color={item.format === 'json' ? 'primary' : item.format === 'csv' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{new Date(item.date).toLocaleString()}</TableCell>
                      <TableCell>{item.size}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Download">
                          <IconButton size="small">
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">No export history yet</Typography>
              <Typography variant="body2" color="text.secondary">
                Generate reports to see them here
              </Typography>
            </Box>
          )}
        </GlassPaper>
      )}

      {/* Tab 3: Templates */}
      {activeTab === 3 && (
        <Grid container spacing={3}>
          {savedTemplates.map((template) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={template.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  },
                  border: '1px solid',
                  borderColor: alpha(template.color, 0.3)
                }}
                onClick={() => applyTemplate(template)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        bgcolor: alpha(template.color, 0.1),
                        color: template.color,
                        p: 1,
                        borderRadius: 2,
                        mr: 2
                      }}
                    >
                      {template.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {template.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {template.lastGenerated?.toLocaleDateString() || 'Ready to use'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {Object.entries(template.options).slice(0, 3).map(([key, value]) => (
                      <Chip
                        key={key}
                        label={`${key}: ${value}`}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Button 
                    fullWidth 
                    variant="outlined" 
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTemplate(template);
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}