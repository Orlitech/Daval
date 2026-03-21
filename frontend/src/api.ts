import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

import type {
  User,
  CareCardData,
  ValidationResult,
  ClinicalEvent,
  StaffPerformance,
  QualityMetrics,
  TrendData,
  ValidationCycle,
  CorrectionRequest,
  CorrectionReview,
  CycleCreate,
  UserCreate,
  RADETUploadResult,
  PendingReview,
  DashboardStats,
  ExportData,
  HospitalNumberValidationSummary,
  HospitalNumberDetailResponse,
  DataQualityIndexResponse,
  FacilityRankingResponse,
  ExistingValidationResponse,
  ValidationStatusResponse
} from './types';

// Extend AxiosRequestConfig to include retry property
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
} as const;

// Create Axios instance
const API: AxiosInstance = axios.create(API_CONFIG);

// Token management
const TokenManager = {
  setToken: (username: string, password: string) => {
    const token = btoa(`${username}:${password}`);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_username', username);
  },
  
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  
  getUsername: (): string | null => {
    return localStorage.getItem('auth_username');
  },
  
  clearToken: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_username');
    localStorage.removeItem('user');
  },
  
  isValid: (): boolean => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }
};

// Request interceptor for authentication
API.interceptors.request.use(
  (config: ExtendedAxiosRequestConfig): ExtendedAxiosRequestConfig => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Basic ${token}`;
    }
    
    // Log requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || config.params);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      
      // Clear invalid tokens
      TokenManager.clearToken();
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Session expired. Please login again.'));
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please check your connection.'));
    }

    if (!error.response) {
      return Promise.reject(new Error('Network error. Cannot connect to server.'));
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        return Promise.reject(new Error('Bad request. Please check your input.'));
      case 403:
        return Promise.reject(new Error('You do not have permission to perform this action.'));
      case 404:
        return Promise.reject(new Error('Resource not found.'));
      case 422:
        return Promise.reject(new Error('Validation error. Please check your data.'));
      case 500:
        return Promise.reject(new Error('Server error. Please try again later.'));
      case 503:
        return Promise.reject(new Error('Service unavailable. Please try again later.'));
      default:
        return Promise.reject(error);
    }
  }
);

// Utility function to handle API responses
const handleResponse = <T>(promise: Promise<any>): Promise<T> => {
  return promise
    .then(response => response.data as T)
    .catch(error => {
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    });
};

// Utility function to check backend health
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await API.get('/', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

// ==================== AUTHENTICATION API ====================

export const auth = {
  /**
   * Login user with username and password
   */
  login: async (username: string, password: string): Promise<User> => {
    try {
      const response = await API.post('/api/auth/login', { username, password });
      
      if (response.data?.user) {
        const user = response.data.user;
        // Store user data and token
        localStorage.setItem('user', JSON.stringify(user));
        TokenManager.setToken(username, password);
        return user;
      }
      
      throw new Error('Invalid response from server');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw error;
    }
  },

  /**
   * Register a new user (admin only)
   */
  register: async (userData: UserCreate): Promise<User> => {
    return handleResponse<User>(API.post('/api/auth/register', userData));
  },

  /**
   * Logout current user
   */
  logout: (): void => {
    TokenManager.clearToken();
  },

  /**
   * Get currently logged in user
   */
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr) as User;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return TokenManager.isValid() && !!localStorage.getItem('user');
  },

  /**
   * Check backend server health
   */
  checkBackend: checkBackendHealth,

  /**
   * Get current auth token
   */
  getToken: TokenManager.getToken,

  /**
   * Get current username
   */
  getUsername: TokenManager.getUsername
};

// ==================== CYCLE MANAGEMENT API ====================

export const cycles = {
  /**
   * Get active validation cycle
   */
  getActive: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/cycles/active'));
  },

  /**
   * Get all validation cycles
   */
  getAll: async (): Promise<ValidationCycle[]> => {
    return handleResponse<ValidationCycle[]>(API.get('/api/cycles/all'));
  },

  /**
   * Create a new validation cycle (admin only)
   */
  create: async (name: string, description: string = ''): Promise<any> => {
    return handleResponse<any>(API.post('/api/cycles/create', { name, description }));
  },

  /**
   * End current validation cycle
   */
  end: async (cycleId: number): Promise<any> => {
    return handleResponse<any>(API.post(`/api/cycles/${cycleId}/end`));
  },

  /**
   * Get cycle statistics
   */
  getStats: async (cycleId: number): Promise<any> => {
    return handleResponse<any>(API.get(`/api/cycles/${cycleId}/stats`));
  }
};

// ==================== RADET DATA API ====================

export const radet = {
  /**
   * Upload RADET data file (Excel or CSV)
   */
  upload: async (file: File): Promise<RADETUploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return handleResponse<RADETUploadResult>(
      API.post('/api/radet/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      })
    );
  },

  /**
   * Get RADET record by hospital number
   */
  getPatient: async (hospitalNumber: string): Promise<any> => {
    return handleResponse<any>(API.get(`/api/radet/patient/${hospitalNumber}`));
  },

  /**
   * Update RADET record
   */
  updatePatient: async (hospitalNumber: string, data: any): Promise<any> => {
    return handleResponse<any>(API.put(`/api/radet/patient/${hospitalNumber}`, data));
  }
};

// ==================== VALIDATION API ====================

export const validation = {
  /**
   * Check if client exists in current cycle
   */
  checkClient: async (hospitalNumber: string): Promise<{ exists: boolean; patient_id?: number; months_of_arv_dispensed?: number }> => {
    return handleResponse<{ exists: boolean; patient_id?: number; months_of_arv_dispensed?: number }>(
      API.get(`/api/client/check/${encodeURIComponent(hospitalNumber)}`)
    );
  },

  /**
   * Submit validation data
   */
  submit: async (data: CareCardData): Promise<ValidationResult[]> => {
    return handleResponse<ValidationResult[]>(API.post('/api/validate/submit', data));
  },

  /**
   * Check if a patient has already been validated in the current cycle
   */
  checkValidationStatus: async (hospitalNumber: string): Promise<ValidationStatusResponse> => {
    return handleResponse<ValidationStatusResponse>(
      API.get(`/api/validation/status/${encodeURIComponent(hospitalNumber)}`)
    );
  },
  
  /**
   * Get existing validation data for a patient
   */
  getExistingValidation: async (hospitalNumber: string): Promise<ExistingValidationResponse> => {
    return handleResponse<ExistingValidationResponse>(
      API.get(`/api/validation/existing/${encodeURIComponent(hospitalNumber)}`)
    );
  },

  /**
   * Get validation history for a patient
   */
  getHistory: async (hospitalNumber: string): Promise<ValidationResult[]> => {
    return handleResponse<ValidationResult[]>(
      API.get(`/api/validate/history/${encodeURIComponent(hospitalNumber)}`)
    );
  },

  /**
   * Get validation summary for current cycle
   */
  getSummary: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/validate/summary'));
  }
};

// ==================== EVENTS API ====================

export const events = {
  /**
   * Get patient clinical events
   */
  getPatientEvents: async (hospitalNumber: string): Promise<ClinicalEvent[]> => {
    return handleResponse<ClinicalEvent[]>(
      API.get(`/api/patient/${encodeURIComponent(hospitalNumber)}/events`)
    );
  },

  /**
   * Add clinical event (supervisor only)
   */
  addEvent: async (
    hospitalNumber: string, 
    eventType: string, 
    eventDate: string, 
    value?: number,
    notes?: string
  ): Promise<any> => {
    return handleResponse<any>(
      API.post(`/api/patient/${encodeURIComponent(hospitalNumber)}/events/add`, null, {
        params: { 
          event_type: eventType, 
          event_date: eventDate, 
          value,
          notes
        }
      })
    );
  },

  /**
   * Get events by type
   */
  getByType: async (eventType: string, startDate?: string, endDate?: string): Promise<ClinicalEvent[]> => {
    return handleResponse<ClinicalEvent[]>(
      API.get('/api/events', {
        params: { event_type: eventType, start_date: startDate, end_date: endDate }
      })
    );
  }
};

// ==================== SUPERVISOR API ====================

export const supervisor = {
  /**
   * Get pending reviews for supervisor
   */
  getPendingReviews: async (): Promise<{ pending_reviews: PendingReview[] }> => {
    return handleResponse<{ pending_reviews: PendingReview[] }>(
      API.get('/api/supervisor/pending-reviews')
    );
  },

  /**
   * Request correction (staff)
   */
  requestCorrection: async (
    hospitalNumber: string, 
    fieldName: string, 
    newValue: string, 
    reason: string
  ): Promise<any> => {
    return handleResponse<any>(
      API.post('/api/supervisor/request-correction', {
        hospital_number: hospitalNumber,
        field_name: fieldName,
        new_value: newValue,
        reason
      })
    );
  },

  /**
   * Review correction request (supervisor)
   */
  reviewCorrection: async (
    correctionId: number, 
    approved: boolean, 
    comments?: string
  ): Promise<any> => {
    return handleResponse<any>(
      API.post('/api/supervisor/review-correction', {
        correction_id: correctionId,
        approved,
        comments
      })
    );
  },

  /**
   * Get all correction requests
   */
  getCorrections: async (status?: 'pending' | 'approved' | 'rejected'): Promise<any[]> => {
    return handleResponse<any[]>(
      API.get('/api/supervisor/corrections', {
        params: { status }
      })
    );
  },

  /**
   * Assign validation to staff
   */
  assignValidation: async (staffId: number, patientIds: number[]): Promise<any> => {
    return handleResponse<any>(
      API.post('/api/supervisor/assign', {
        staff_id: staffId,
        patient_ids: patientIds
      })
    );
  }
};

// ==================== DASHBOARD API ====================

export const dashboard = {
  /**
   * Get main dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    return handleResponse<DashboardStats>(API.get('/api/dashboard/stats'));
  },

  /**
   * Get staff performance metrics
   */
  getStaffPerformance: async (): Promise<StaffPerformance[]> => {
    return handleResponse<StaffPerformance[]>(API.get('/api/dashboard/staff-performance'));
  },

  /**
   * Get quality metrics
   */
  getQualityMetrics: async (): Promise<QualityMetrics> => {
    return handleResponse<QualityMetrics>(API.get('/api/dashboard/quality-metrics'));
  },

  /**
   * Get accuracy trends
   */
  getTrends: async (): Promise<TrendData[]> => {
    return handleResponse<TrendData[]>(API.get('/api/dashboard/trends'));
  },

  /**
   * Get cycle progress
   */
  getProgress: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/dashboard/progress'));
  }
};

// ==================== ANALYTICS API ====================

export const analytics = {
  /**
   * Detect potential duplicate patients
   */
  getDuplicates: async (): Promise<{ potential_duplicates: any[] }> => {
    return handleResponse<{ potential_duplicates: any[] }>(
      API.get('/api/analytics/duplicates')
    );
  },

  /**
   * Get treatment interruptions
   */
  getTreatmentInterruptions: async (daysThreshold: number = 28): Promise<any> => {
    return handleResponse<any>(
      API.get('/api/analytics/treatment-interruptions', {
        params: { days_threshold: daysThreshold }
      })
    );
  },

  /**
   * Get patient summaries with validation scores
   */
  getPatientSummaries: async (): Promise<any[]> => {
    return handleResponse<any[]>(API.get('/api/analytics/patient-summaries'));
  },

  /**
   * Get validation statistics
   */
  getValidationStats: async (startDate?: string, endDate?: string): Promise<any> => {
    return handleResponse<any>(
      API.get('/api/analytics/validation-stats', {
        params: { start_date: startDate, end_date: endDate }
      })
    );
  },

  /**
   * Get user activity report
   */
  getUserActivity: async (userId?: number, days: number = 30): Promise<any> => {
    return handleResponse<any>(
      API.get('/api/analytics/user-activity', {
        params: { user_id: userId, days }
      })
    );
  },

  /**
   * Get data quality score
   */
  getQualityScore: async (): Promise<number> => {
    const response = await handleResponse<{ quality_score: number }>(
      API.get('/api/analytics/quality-score')
    );
    return response.quality_score;
  }
};

// ==================== ARV DISPENSING ANALYTICS API ====================

export const arvAnalytics = {
  /**
   * Analyze ARV dispensing patterns
   */
  getDispensingPatterns: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/analytics/arv-dispensing-patterns'));
  },

  /**
   * Get patient refill schedule
   */
  getRefillSchedule: async (daysAhead: number = 30): Promise<any> => {
    return handleResponse<any>(
      API.get('/api/analytics/patient-refill-schedule', {
        params: { days_ahead: daysAhead }
      })
    );
  }
};

// ==================== ENHANCED VALIDATION SUMMARIES API ====================

export const validationSummaries = {
  /**
   * Get detailed validation summary for a specific hospital number
   */
  getHospitalNumberSummary: async (hospitalNumber: string): Promise<HospitalNumberDetailResponse> => {
    return handleResponse<HospitalNumberDetailResponse>(
      API.get(`/api/validation/hospital-number-summary/${encodeURIComponent(hospitalNumber)}`)
    );
  },
  
  /**
   * Get validation summaries for all hospital numbers (deduplicated)
   */
  getAllSummaries: async (): Promise<HospitalNumberValidationSummary[]> => {
    return handleResponse<HospitalNumberValidationSummary[]>(
      API.get('/api/dashboard/validation-summaries')
    );
  },
  
  /**
   * Get Data Quality Index (DQI) for each facility
   */
  getFacilityDQI: async (): Promise<DataQualityIndexResponse[]> => {
    return handleResponse<DataQualityIndexResponse[]>(
      API.get('/api/dashboard/facility-dqi')
    );
  },
  
  /**
   * Get facility ranking based on DQI
   */
  getFacilityRanking: async (): Promise<FacilityRankingResponse> => {
    return handleResponse<FacilityRankingResponse>(
      API.get('/api/dashboard/facility-ranking')
    );
  },
};

// ==================== EXPORT API ====================

export const exportData = {
  /**
   * Export validation results
   */
  validationResults: async (format: 'json' | 'csv' = 'json'): Promise<ExportData> => {
    return handleResponse<ExportData>(
      API.get('/api/export/validation-results', {
        params: { format }
      })
    );
  },

  /**
   * Export correction report
   */
  correctionReport: async (format: 'json' | 'csv' = 'json'): Promise<ExportData> => {
    return handleResponse<ExportData>(
      API.get('/api/export/correction-report', {
        params: { format }
      })
    );
  },

  /**
   * Export cycle summary
   */
  cycleSummary: async (cycleId: number, format: 'json' | 'csv' = 'json'): Promise<ExportData> => {
    return handleResponse<ExportData>(
      API.get(`/api/export/cycle/${cycleId}/summary`, {
        params: { format }
      })
    );
  },

  /**
   * Export patient data
   */
  patientData: async (hospitalNumber: string, format: 'json' | 'csv' = 'json'): Promise<ExportData> => {
    return handleResponse<ExportData>(
      API.get(`/api/export/patient/${encodeURIComponent(hospitalNumber)}`, {
        params: { format }
      })
    );
  },

  /**
   * Download file from export data
   */
  downloadFile: (data: ExportData, filename: string, format: 'json' | 'csv'): void => {
    let content: string;
    let type: string;
    
    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      type = 'application/json';
      filename = filename.endsWith('.json') ? filename : `${filename}.json`;
    } else {
      // Convert to CSV
      const rows = data.export_data || data.correction_report || [];
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        const csvContent = [
          headers.join(','),
          ...rows.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        content = csvContent;
      } else {
        content = '';
      }
      type = 'text/csv';
      filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    }

    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

// ==================== HEALTH CHECK API ====================

export const health = {
  /**
   * Check API health
   */
  check: async (): Promise<{ status: string; version: string; database: string }> => {
    return handleResponse<{ status: string; version: string; database: string }>(
      API.get('/')
    );
  },

  /**
   * Check database connection
   */
  checkDatabase: async (): Promise<{ connected: boolean }> => {
    return handleResponse<{ connected: boolean }>(API.get('/health/db'));
  },

  /**
   * Check network info
   */
  getNetworkInfo: async (): Promise<{ local_access: string; network_access: string; port: number; host_ip: string }> => {
    return handleResponse<{ local_access: string; network_access: string; port: number; host_ip: string }>(
      API.get('/api/network/info')
    );
  }
};

// ==================== DEBUG API ====================

export const debug = {
  /**
   * Get database status (debug only)
   */
  getDatabaseStatus: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/debug/database-status'));
  },

  /**
   * Check specific cycle details
   */
  checkCycle: async (cycleId: number): Promise<any> => {
    return handleResponse<any>(API.get(`/api/debug/check-cycle/${cycleId}`));
  },

  /**
   * Test dashboard queries
   */
  testQueries: async (): Promise<any> => {
    return handleResponse<any>(API.get('/api/debug/test-queries'));
  }
};

// ==================== TYPES ====================

export interface ValidationStatusResponse {
  hasValidations: boolean;
}

export interface ExistingValidationResponse {
  hasValidations: boolean;
  careCardData: Record<string, any>;
  lastValidation?: string;
  validator?: string;
}

export interface HospitalNumberValidationSummary {
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

export interface HospitalNumberDetailResponse {
  hospital_number: string;
  validations: any[];
  summary: HospitalNumberValidationSummary;
}

export interface DataQualityIndexResponse {
  facility_name: string;
  facility_code: string;
  total_patients_validated: number;
  total_expected_checks: number;
  total_passed_checks: number;
  dqi_score: number;
  classification_breakdown: Record<string, number>;
  color_code: string;
}

export interface FacilityRankingResponse {
  facilities: DataQualityIndexResponse[];
  overall_dqi: number;
  total_facilities: number;
}

// Re-export all types
export type {
  User,
  CareCardData,
  ValidationResult,
  ClinicalEvent,
  StaffPerformance,
  QualityMetrics,
  TrendData,
  ValidationCycle,
  CorrectionRequest,
  CorrectionReview,
  CycleCreate,
  UserCreate,
  RADETUploadResult,
  PendingReview,
  DashboardStats,
  ExportData
};

// Export API instance for custom requests
export default API;