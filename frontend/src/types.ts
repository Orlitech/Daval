// ==================== USER TYPES ====================

export type UserRole = 'staff' | 'supervisor' | 'admin';

export interface User {
  id: number;
  username: string;
  full_name: string;
  role: UserRole;
  facility: string;
  validations?: number; // Optional for staff performance
  password?: string; // Only used for auth, never stored
}

export interface UserCreate {
  username: string;
  password: string;
  full_name: string;
  role: string;
  facility: string;
}

// ==================== VALIDATION CYCLE ====================

export interface ValidationCycle {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  stats?: {
    total_patients: number;
    validated_patients: number;
  };
  total_patients?: number; // For timeline view
  validated_patients?: number; // For timeline view
  mismatches?: number; // For timeline view
  progress?: number; // For timeline view
}

export interface CycleCreate {
  name: string;
  description?: string;
}

// ==================== RADET RECORD ====================

export interface RADETRecord {
  id: number;
  cycle_id: number;
  hospital_number: string;
  date_of_birth: string | null;
  sex: string | null;
  art_start_date: string | null;
  current_regimen: string | null;
  last_drug_pickup: string | null;
  months_of_arv_dispensed?: number | null; // Added for ARV duration tracking
  last_vl_sample_date: string | null;
  last_vl_result: number | null;
  last_vl_result_date: string | null;
  last_clinic_visit: string | null;
  is_active: boolean;
  is_on_art: boolean;
  created_at?: string;
  updated_at?: string;
}

// ==================== CARE CARD DATA ====================

export interface CareCardData {
  hospital_number: string;
  date_of_birth: string;
  sex: string;
  art_start_date: string;
  current_regimen: string;
  last_drug_pickup: string;
  months_of_arv_dispensed?: number | null; // Added for ARV duration tracking
  last_vl_sample_date: string;
  last_vl_result: number | null;
  last_vl_result_date: string;
  last_clinic_visit: string;
}

// ==================== VALIDATION RESULT ====================

export interface ValidationResult {
  id?: number; // Optional for API responses
  cycle_id?: number;
  patient_id?: number;
  user_id?: number;
  hospital_number: string;
  field_name: string;
  radet_value: string | null;
  care_card_value: string | null;
  status: 'MATCH' | 'MISMATCH' | 'MISSING_IN_RADET' | 'MISSING_IN_CARD' | 'LOGICAL_ERROR' | 'UPDATED_RECORD';
  logical_error?: string;
  logical_error_type?: string;
  logical_error_description?: string;
  validation_date?: string;
  validator?: string;
}

// ==================== CLINICAL EVENTS ====================

export interface ClinicalEvent {
  id: number;
  patient_id?: number;
  hospital_number?: string;
  event_type: string;
  event_date: string;
  value: number | null;
  notes?: string;
  created_at?: string;
}

// ==================== CORRECTION MANAGEMENT ====================

export interface CorrectionRequest {
  id: number;
  hospital_number: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  requested_by: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reason?: string;
  user_id?: number;
  supervisor_id?: number;
  approved_at?: string;
  requested_by_name?: string;
  approved_by_name?: string;
}

export interface CorrectionReview {
  correction_id: number;
  approved: boolean;
  comments?: string;
}

export interface CorrectionLog {
  id: number;
  patient_id: number;
  user_id: number;
  supervisor_id?: number;
  hospital_number: string;
  field_name: string;
  old_value: string;
  new_value: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  created_at: string;
  requested_by?: string;
  approved_by?: string;
  user?: User;
  supervisor?: User;
  patient?: RADETRecord;
}

// ==================== DASHBOARD METRICS ====================

export interface DashboardStats {
  total_clients: number;
  validated_clients: number;
  remaining: number;
  mismatches: number;
  progress_percentage: number;
}

export interface StaffPerformance {
  user_id: number;
  user_name: string;
  patients_validated: number;
  total_validations: number;
  mismatches_found: number;
  logical_errors_found: number;
  accuracy_rate: number;
}

export interface QualityMetrics {
  overall_accuracy: number;
  total_validations: number;
  status_breakdown: Record<string, number>;
  top_error_fields?: Array<[string, number]>;
  treatment_interruption_risk: number;
  missing_vl_results: number;
  total_patients: number;
  average_months_dispensed?: number;
  dispensing_patterns?: Record<string, number>;
}

export interface TrendData {
  cycle_id: number;
  cycle_name: string;
  date: string;
  accuracy: number;
  total_validations: number;
}

// ==================== ENHANCED VALIDATION SUMMARIES ====================

export interface FailedFieldDetail {
  field_name: string;
  status: string;
  radet_value: string | null;
  care_card_value: string | null;
  logical_error?: string;
}

export interface HospitalNumberValidationSummary {
  hospital_number: string;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  score_percentage: number;
  classification: string;
  color_code: string;
  failed_fields: FailedFieldDetail[];
  validation_status: string;
}

export interface HospitalNumberDetailResponse {
  hospital_number: string;
  validations: ValidationResult[];
  summary: HospitalNumberValidationSummary;
}

// ==================== FACILITY DQI (Data Quality Index) ====================

export interface DataQualityIndexResponse {
  facility_name: string;
  facility_code: string;
  total_patients_validated: number;
  total_expected_checks: number;
  total_passed_checks: number;
  dqi_score: number;
  classification_breakdown: {
    "Perfect Match": number;
    "Low Discrepancy": number;
    "Moderate Discrepancy": number;
    "High Discrepancy": number;
    "Critical Issue": number;
  };
  color_code: string;
}

export interface FacilityRankingResponse {
  facilities: DataQualityIndexResponse[];
  overall_dqi: number;
  total_facilities: number;
}

// ==================== PENDING REVIEW ====================

export interface PendingReview {
  hospital_number: string;
  patient_name: string;
  mismatches: Array<{
    id: number;
    field: string;
    radet_value?: string;
    care_card_value?: string;
    status: string;
    logical_error?: string;
  }>;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  validator?: string;
  validation_date?: string;
}

// ==================== RADET UPLOAD ====================

export interface RADETUploadResult {
  message: string;
  records_added: number;
  records_updated: number;
  total_records: number;
}

// ==================== EXPORT DATA ====================

export interface ExportData {
  export_data?: any[];
  correction_report?: any[];
  [key: string]: any; // Allow additional properties
}

// ==================== API RESPONSE WRAPPERS ====================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ==================== ENUMS ====================

export enum EventType {
  DRUG_PICKUP = 'drug_pickup',
  VL_SAMPLE = 'vl_sample',
  VL_RESULT = 'vl_result',
  CLINIC_VISIT = 'clinic_visit'
}

export enum ValidationStatus {
  MATCH = 'MATCH',
  MISMATCH = 'MISMATCH',
  MISSING_IN_RADET = 'MISSING_IN_RADET',
  MISSING_IN_CARD = 'MISSING_IN_CARD',
  LOGICAL_ERROR = 'LOGICAL_ERROR',
  UPDATED_RECORD = 'UPDATED_RECORD'
}

export enum CorrectionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// ==================== LOGICAL ERROR ====================

export interface LogicalError {
  field: string;
  type: string;
  description: string;
}

// ==================== FACILITY STATS ====================

export interface FacilityStats {
  facility_name: string;
  total_patients: number;
  validated_patients: number;
  accuracy_rate: number;
  interruption_risk: number;
}

// ==================== FILTERS ====================

export interface DateRangeFilter {
  start_date?: string;
  end_date?: string;
}

export type ExportFormat = 'json' | 'csv' | 'excel';

// ==================== SYSTEM HEALTH ====================

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  database: {
    connected: boolean;
    latency?: number;
  };
  version: string;
  uptime: number;
}

// ==================== NOTIFICATIONS ====================

export interface Notification {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  time: string;
  read: boolean;
  action_url?: string;
}

// ==================== AUDIT LOG ====================

export interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  changes: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

// ==================== PERFORMANCE METRICS ====================

export interface PerformanceMetrics {
  average_validation_time: number;
  validation_speed: number; // per hour
  accuracy_trend: number[]; // last 30 days
  staff_productivity: Record<string, number>;
}

// ==================== PATIENT SUMMARY ====================

export interface PatientSummary {
  hospital_number: string;
  total_validations?: number;
  matches?: number;
  mismatches?: number;
  logical_errors?: number;
  accuracy_rate?: number;
  last_validation?: string;
  risk_level?: 'low' | 'medium' | 'high';
  trend?: 'up' | 'down' | 'stable';
  months_of_arv_dispensed?: number | null;
  last_drug_pickup?: string | null;
  next_refill_due?: string | null;
}

// ==================== TREATMENT INTERRUPTION ====================

export interface TreatmentInterruption {
  hospital_number: string;
  last_pickup_date: string | null;
  days_since_pickup: number | null;
  risk_level: string;
  months_of_arv_dispensed: number | null;
}

// ==================== DUPLICATE DETECTION ====================

export interface DuplicateRecord {
  original: string;
  duplicate: string;
  confidence: number;
}

// ==================== ARV DISPENSING PATTERNS ====================

export interface ArvDispensingPatterns {
  dispensing_patterns: {
    "1_month": number;
    "2_months": number;
    "3_months": number;
    "4_months": number;
    "5_months": number;
    "6_months": number;
    ">6_months": number;
  };
  average_months_dispensed: number;
  total_patients_with_data: number;
  recommendations: {
    default_dispensing: string;
    adherence_risk_patients: number;
    next_expected_refill: string;
    supply_planning: string;
  };
}

// ==================== REFILL SCHEDULE ====================

export interface RefillScheduleItem {
  hospital_number: string;
  last_pickup_date: string;
  months_dispensed: number;
  expected_run_out_date: string;
  days_until_refill_needed: number;
  priority: 'HIGH' | 'MEDIUM';
}

export interface RefillScheduleResponse {
  refill_schedule: RefillScheduleItem[];
  total_needing_refill: number;
  time_period_days: number;
}

// ==================== CYCLE STATS ====================

export interface CycleStats {
  cycle_id: number;
  cycle_name: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  total_patients: number;
  validated_patients: number;
  validation_progress: number;
  total_validations: number;
  accuracy_rate: number;
  mismatches: number;
  logical_errors: number;
  missing_in_radet: number;
  missing_in_card: number;
  updated_records: number;
  average_months_dispensed?: number;
}

// ==================== DEBUG TYPES ====================

export interface DebugDatabaseStatus {
  database_url: string;
  users: {
    total: number;
    active: number;
  };
  cycles: {
    total: number;
    active_cycle_id: number | null;
    active_cycle_name: string | null;
    has_active_cycle: boolean;
  };
  patients: {
    total_all_cycles: number;
    active_all_cycles: number;
    in_active_cycle: number;
    active_in_active_cycle: number;
  };
  validations: {
    total_all_cycles: number;
    in_active_cycle: number;
    distinct_patients_validated: number;
  };
  metrics: {
    treatment_interruption_risk: number;
    missing_vl_results: number;
    status_breakdown: Record<string, number>;
  };
  sample_data: {
    patients: any[];
    validations: any[];
  };
}

// interface to your existing types
export interface ExistingValidationResponse {
  hasValidations: boolean;
  careCardData: Record<string, any>;
  lastValidation?: string;
  validator?: string;
}
// ==================== EXPORT ALL TYPES ====================

export type {
  UserCreate,
  CycleCreate,
  CorrectionReview,
  CorrectionLog,
  DashboardStats,
  PendingReview,
  RADETUploadResult,
  ExportData,
  ApiResponse,
  PaginatedResponse,
  LogicalError,
  FacilityStats,
  DateRangeFilter,
  SystemHealth,
  Notification,
  AuditLog,
  PerformanceMetrics,
  PatientSummary,
  TreatmentInterruption,
  DuplicateRecord,
  ArvDispensingPatterns,
  RefillScheduleItem,
  RefillScheduleResponse,
  CycleStats,
  DebugDatabaseStatus,
  ExistingValidationResponse,
  FailedFieldDetail
};