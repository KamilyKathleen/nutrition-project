import { apiClient } from './api';
import { HybridAuthService } from './hybridAuthService';

// Tipos para autenticação
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: 'patient' | 'nutritionist';
        crn?: string;
    };
    token: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: 'patient' | 'nutritionist';
    crn?: string;
}

export interface RegisterResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: 'patient' | 'nutritionist';
        crn?: string;
    };
    token: string;
}

// Serviços de autenticação
export class AuthService {
    private static hybridService = new HybridAuthService();

    // Login do usuário (agora usa Firebase + JWT)
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            
            // Usar sistema híbrido (Firebase + JWT)
            const response = await this.hybridService.login(credentials);
            
            const loginData: LoginResponse = {
                user: {
                    ...response.data.user,
                    role: response.data.user.role as 'patient' | 'nutritionist'
                },
                token: response.data.token
            };
            
            // Armazenar no localStorage
            localStorage.setItem('authToken', loginData.token);
            localStorage.setItem('nutriplan_user', JSON.stringify(loginData.user));
            
            return loginData;
            
        } catch (error: any) {
            console.error('❌ AuthService: Erro no login híbrido:', error);
            
 
            try {
                const response = await apiClient.post<any>('/auth/login', credentials);
                
                const loginData: LoginResponse = {
                    user: response.data.user,
                    token: response.data.token
                };
                
                localStorage.setItem('authToken', loginData.token);
                localStorage.setItem('nutriplan_user', JSON.stringify(loginData.user));

                return loginData;
                
            } catch (fallbackError) {
                throw error; 
            }
        }
    }

    // Registro de usuário (agora usa Firebase + JWT)
    static async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            
            // Usar sistema híbrido (Firebase + JWT)
            const response = await this.hybridService.register(userData);
            
            const registerData: RegisterResponse = {
                user: {
                    ...response.data.user,
                    role: response.data.user.role as 'patient' | 'nutritionist'
                },
                token: response.data.token
            };
            
            // Armazenar no localStorage
            localStorage.setItem('authToken', registerData.token);
            localStorage.setItem('nutriplan_user', JSON.stringify(registerData.user));
            
            return registerData;
            
        } catch (error: any) {
        
            try {
                const response = await apiClient.post<any>('/auth/register', userData);
                
                const registerData: RegisterResponse = {
                    user: {
                        ...response.data.user,
                        role: response.data.user.role as 'patient' | 'nutritionist'
                    },
                    token: response.data.token
                };
                
                localStorage.setItem('authToken', registerData.token);
                localStorage.setItem('nutriplan_user', JSON.stringify(registerData.user));
                
                return registerData;
                
            } catch (fallbackError) {
                throw error; 
            }
        }
    }

    // Logout do usuário (agora usa Firebase + limpa JWT)
    static async logout(): Promise<void> {
        try {     
            await this.hybridService.logout();          
        } catch (error) {
            console.error('AuthService: Erro no logout híbrido:', error);
            try {
                await apiClient.post('/auth/logout');
            } catch (fallbackError) {
                console.error('Erro ao fazer logout no servidor:', fallbackError);
            }
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('nutriplan_user');
        }
    }

    // Verificar se o token é válido (agora usa Firebase refresh)
    static async verifyToken(): Promise<LoginResponse['user'] | null> {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        // Verificar e renovar token usando Firebase
        try {
            const refreshedToken = await this.hybridService.refreshToken();
            if (refreshedToken) {
                localStorage.setItem('authToken', refreshedToken);
                
                const savedUserData = localStorage.getItem('nutriplan_user');
                if (savedUserData) {
                    return JSON.parse(savedUserData);
                }
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('nutriplan_user');
        }

        return null;
    }

    static async resetPassword(email: string): Promise<void> {
        try {
            await this.hybridService.resetPassword(email);
        } catch (error: any) {
            throw new Error('Erro ao enviar email de recuperação');
        }
    }

    static getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    // Verificar se usuário está autenticado
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default AuthService;