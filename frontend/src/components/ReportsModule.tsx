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
  const [exportedData, setExportedData] = useState<any>(null); // Renamed from exportData
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<ReportTemplate[]>(QUICK_REPORTS);
  
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
      setFacilities(data.map(f => f.facility_name));
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
          // Check if the method exists
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
    } else if (options.format === 'csv') {
      const data = exportedData.export_data || exportedData.correction_report || [];
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        const csv = [
          headers.join(','),
          ...data.map((row: any) => 
            headers.map(header => {
              const val = row[header];
              // Handle values that contain commas
              return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
            }).join(',')
          )
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        a.click();
      }
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
    if (!previewData || previewData.length === 0) return null;

    switch (options.reportType) {
      case 'quality':
      case 'facility-dqi':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="facility_name || 'Metric'" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="dqi_score || overall_accuracy" fill={theme.palette.primary.main} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={previewData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user_name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <RechartsTooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="patients_validated" fill={theme.palette.info.main} />
              <Line yAxisId="right" dataKey="accuracy_rate" stroke={theme.palette.warning.main} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'arv-patterns':
        if (previewData[0]?.dispensing_patterns) {
          const data = Object.entries(previewData[0].dispensing_patterns).map(([key, value]) => ({
            name: key.replace('_', ' '),
            value
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
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          );
        }
        return null;

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={previewData.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hospital_number || date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="status || value" stroke={theme.palette.primary.main} />
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
              <IconButton onClick={fetchCycles}>
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
                          <Typography>{type.label}</Typography>
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
                    <Box sx={{ mb: 3 }}>
                      {renderChart()}
                    </Box>
                  )}

                  <TableContainer sx={{ maxHeight: 500 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                            <TableCell key={key}>
                              {key.replace(/_/g, ' ')}
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
                              Object.entries(val).map(([k, v]) => (
                                <div key={k}>{k}: {v}</div>
                              ))
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
          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Validation Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={previewData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date || validation_date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="accuracy_rate || score_percentage" fill={theme.palette.primary.main} />
                </AreaChart>
              </ResponsiveContainer>
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Match', value: 65 },
                      { name: 'Mismatch', value: 20 },
                      { name: 'Logical Error', value: 10 },
                      { name: 'Missing', value: 5 }
                    ]}
                    cx="50%"
                    cy="50%"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                  >
                    {CHART_COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </GlassPaper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <GlassPaper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Facility Performance Comparison
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={previewData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="facility_name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="dqi_score" fill={theme.palette.success.main} />
                  <Bar dataKey="total_patients_validated" fill={theme.palette.info.main} />
                </BarChart>
              </ResponsiveContainer>
            </GlassPaper>
          </Grid>
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
                        {template.lastGenerated?.toLocaleDateString() || 'Not generated yet'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(template.options).map(([key, value]) => (
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
                    sx={{ mt: 2 }}
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