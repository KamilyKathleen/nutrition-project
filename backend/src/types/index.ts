export interface User {
  id: string;
  email: string;
  name: string;
  crn?: string; // 🏥 CRN obrigatório apenas para nutricionistas
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  // 🔥 Firebase fields - OPCIONAIS para compatibilidade
  firebaseUid?: string; // Opcional para usuários não-Firebase
  emailVerified: boolean; // Vem do Firebase
}

export enum UserRole {
  STUDENT = 'student',
  PATIENT = 'patient', // 🔥 Novo role para Firebase
  NUTRITIONIST = 'nutritionist',
  ADMIN = 'admin'
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  birthDate: Date;
  gender: Gender;
  address?: Address;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  nutritionalGoals?: string[];
  notes?: string;
  nutritionistId: string; // ID do nutricionista responsável
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Address {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface NutritionalAssessment {
  id: string;
  patientId: string;
  nutritionistId: string; 
  anthropometricData: AnthropometricData;
  foodRecord?: FoodRecord;
  physicalActivity?: PhysicalActivity;
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnthropometricData {
  height: number; // cm
  weight: number; // kg
  bmi?: number;
  waistCircumference?: number; // cm
  hipCircumference?: number; // cm
  bodyFatPercentage?: number;
  muscleMass?: number;
  boneDensity?: number;
  skinfoldMeasurements?: SkinfoldMeasurement[];
}

export interface SkinfoldMeasurement {
  location: string;
  measurement: number; // mm
}

export interface FoodRecord {
  date: Date;
  meals: Meal[];
  totalCalories?: number;
  notes?: string;
}

export interface Meal {
  type: MealType;
  time: string;
  foods: FoodItem[];
  calories?: number;
}

export enum MealType {
  BREAKFAST = 'breakfast',
  MORNING_SNACK = 'morning_snack',
  LUNCH = 'lunch',
  AFTERNOON_SNACK = 'afternoon_snack',
  DINNER = 'dinner',
  EVENING_SNACK = 'evening_snack'
}

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string; // g, ml, unidade, etc. 
  calories?: number;
  proteins?: number;
  carbohydrates?: number;
  fats?: number;
  fiber?: number;
}

export interface PhysicalActivity {
  weeklyFrequency: number;
  activities: Activity[];
  sedentaryTime: number; // horas por dia
}

export interface Activity {
  name: string;
  duration: number; // minutos
  intensity: ActivityIntensity;
  frequency: number; // vezes por semana
}

export enum ActivityIntensity {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high'
}

export interface DietPlan {
  id: string;
  patientId: string;
  nutritionistId: string; 
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  targetCalories: number;
  targetProteins: number;
  targetCarbohydrates: number;
  targetFats: number;
  meals: PlannedMeal[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlannedMeal {
  type: MealType;
  time: string;
  foods: FoodItem[];
  instructions?: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  studentId: string;
  date: Date;
  duration: number; // minutos
  weight?: number;
  bloodPressure?: BloodPressure;
  observations: string;
  recommendations: string;
  nextAppointment?: Date;
  status: ConsultationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BloodPressure {
  systolic: number;
  diastolic: number;
}

export enum ConsultationStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum BlogCategory {
  HEALTH = 'health',
  RECIPES = 'recipes',
  NUTRITION_TIPS = 'nutrition_tips',
  RESEARCH = 'research',
  LIFESTYLE = 'lifestyle'
}

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generatedBy: string;
  parameters: ReportParameters;
  data: any;
  format: ReportFormat;
  createdAt: Date;
}

export enum ReportType {
  PATIENT_PROGRESS = 'patient_progress',
  STUDENT_PERFORMANCE = 'student_performance',
  CLASS_OVERVIEW = 'class_overview',
  NUTRITIONAL_ANALYSIS = 'nutritional_analysis'
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json'
}

export interface ReportParameters {
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  patientIds?: string[];
  studentIds?: string[];
  includeCharts?: boolean;
  includeDetails?: boolean;
}

// Tipos para responses da API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos para requests
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  crn?: string; // 🏥 CRN para nutricionistas
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePatientRequest {
  name: string;
  email?: string;
  birthDate: string;
  gender: Gender;
  occupation?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {}

// Tipos para autenticação
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  body: any;
  params: any;
  query: any;
}