// Re-exporta todos os serviços para facilitar importação
export { apiClient } from './api';
export { AuthService } from './authService';
export { UserService } from './userService';
export { PatientService } from './patientService';

// Re-exporta todos os tipos
export type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from './authService';

export type {
    User,
    UpdateUserRequest,
} from './userService';

export type {
    Patient,
    CreatePatientRequest,
    UpdatePatientRequest,
} from './patientService';