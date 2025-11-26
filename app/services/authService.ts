import { apiClient } from './api';

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
    // Login do usuário
    static async login(credentials: LoginRequest): Promise<LoginResponse> {
        const response = await apiClient.post<any>('/auth/login', credentials);
        
        console.log('🔍 AuthService: Resposta bruta do backend:', response);
        
        // Extrair dados da estrutura do backend: response.data.{user, token}
        const loginData: LoginResponse = {
            user: response.data.user,
            token: response.data.token
        };
        
        console.log('🔍 AuthService: Dados extraídos:', loginData);
        
        // Salvar token e dados do usuário no localStorage
        if (loginData.token) {
            localStorage.setItem('authToken', loginData.token);
            localStorage.setItem('nutriplan_user', JSON.stringify(loginData.user));
            console.log('🔍 AuthService: Token e usuário salvos no localStorage');
        }
        
        return loginData;
    }

    // Registro de usuário
    static async register(userData: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiClient.post<any>('/auth/register', userData);
        
        console.log('🔍 AuthService: Resposta do registro:', response);
        
        // Extrair dados da estrutura do backend: response.data.{user, token}
        const registerData: RegisterResponse = {
            user: response.data.user,
            token: response.data.token
        };
        
        // Salvar token e dados do usuário no localStorage
        if (registerData.token) {
            localStorage.setItem('authToken', registerData.token);
            localStorage.setItem('nutriplan_user', JSON.stringify(registerData.user));
            console.log('🔍 AuthService: Token e usuário salvos no localStorage após registro');
        }
        
        return registerData;
    }

    // Logout do usuário
    static async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Erro ao fazer logout no servidor:', error);
        } finally {
            // Sempre remover token e dados do usuário do localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('nutriplan_user');
        }
    }

    // Verificar se o token é válido
    static async verifyToken(): Promise<LoginResponse['user'] | null> {
        // TODO: Implementar verificação de token no backend
        // Por enquanto, apenas verifica se o token existe no localStorage
        const token = this.getToken();
        if (!token) {
            return null;
        }

        // Simulação temporária - em produção, verificar com o backend
        const savedUserData = localStorage.getItem('nutriplan_user');
        if (savedUserData) {
            try {
                return JSON.parse(savedUserData);
            } catch (error) {
                console.error('Erro ao recuperar dados do usuário:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('nutriplan_user');
                return null;
            }
        }

        return null;
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