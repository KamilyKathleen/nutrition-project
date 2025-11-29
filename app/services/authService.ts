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
            console.log('� AuthService: Usando sistema híbrido para login');
            
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
            
            console.log('✅ AuthService: Login híbrido concluído:', loginData);
            return loginData;
            
        } catch (error: any) {
            console.error('❌ AuthService: Erro no login híbrido:', error);
            
            // Fallback para sistema antigo se houver erro
            console.log('🔄 AuthService: Tentando sistema antigo como fallback...');
            try {
                const response = await apiClient.post<any>('/auth/login', credentials);
                
                const loginData: LoginResponse = {
                    user: response.data.user,
                    token: response.data.token
                };
                
                localStorage.setItem('authToken', loginData.token);
                localStorage.setItem('nutriplan_user', JSON.stringify(loginData.user));
                
                console.log('✅ AuthService: Login antigo concluído:', loginData);
                return loginData;
                
            } catch (fallbackError) {
                console.error('❌ AuthService: Ambos sistemas falharam');
                throw error; // Lançar erro original
            }
        }
    }

    // Registro de usuário (agora usa Firebase + JWT)
    static async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            console.log('🔥 AuthService: Usando sistema híbrido para registro');
            
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
            
            console.log('✅ AuthService: Registro híbrido concluído:', registerData);
            return registerData;
            
        } catch (error: any) {
            console.error('❌ AuthService: Erro no registro híbrido:', error);
            
            // Fallback para sistema antigo se houver erro
            console.log('🔄 AuthService: Tentando sistema antigo como fallback...');
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
                
                console.log('✅ AuthService: Registro antigo concluído:', registerData);
                return registerData;
                
            } catch (fallbackError) {
                console.error('❌ AuthService: Ambos sistemas falharam');
                throw error; // Lançar erro original
            }
        }
    }

    // Logout do usuário (agora usa Firebase + limpa JWT)
    static async logout(): Promise<void> {
        try {
            console.log('🔥 AuthService: Fazendo logout híbrido...');
            
            // Usar sistema híbrido para logout
            await this.hybridService.logout();
            
            console.log('✅ AuthService: Logout híbrido concluído');
            
        } catch (error) {
            console.error('❌ AuthService: Erro no logout híbrido:', error);
            
            // Fallback: tentar logout antigo
            try {
                await apiClient.post('/auth/logout');
            } catch (fallbackError) {
                console.error('Erro ao fazer logout no servidor:', fallbackError);
            }
        } finally {
            // Sempre remover token e dados do usuário do localStorage
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
            // Limpar dados inválidos
            localStorage.removeItem('authToken');
            localStorage.removeItem('nutriplan_user');
        }

        return null;
    }

    // 🔥 NOVO: Recuperação de senha via Firebase
    static async resetPassword(email: string): Promise<void> {
        try {
            console.log('🔥 AuthService: Enviando email de recuperação...');
            await this.hybridService.resetPassword(email);
            console.log('✅ AuthService: Email de recuperação enviado');
        } catch (error: any) {
            console.error('❌ AuthService: Erro na recuperação de senha:', error);
            throw new Error('Erro ao enviar email de recuperação');
        }
    }

    // Obter token do localStorage
    static getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    // Verificar se usuário está autenticado
    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

export default AuthService;