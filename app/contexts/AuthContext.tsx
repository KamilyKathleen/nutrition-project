'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, LoginRequest, RegisterRequest } from '@/app/services';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'nutritionist';
  crn?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há um usuário autenticado ao inicializar
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('🔍 AuthContext: Verificando status de autenticação...');
        const token = AuthService.getToken();
        console.log('🔍 AuthContext: Token encontrado:', !!token);
        
        if (token) {
          // Verificar se há dados do usuário salvos no localStorage
          const savedUserData = localStorage.getItem('nutriplan_user');
          
          if (savedUserData) {
            try {
              const userData = JSON.parse(savedUserData);
              setUser(userData);
              console.log('AuthContext: Usuário restaurado do localStorage:', userData.email);
            } catch (parseError) {
              console.error('Erro ao parsear dados do usuário, fazendo logout');
              AuthService.logout();
            }
          } else {
            // Token existe mas não tem dados do usuário - limpar
            console.log('Token existe mas não tem dados do usuário - fazendo logout');
            AuthService.logout();
          }
        }
      } catch (error) {
        console.error('AuthContext: Erro ao verificar status de autenticação:', error);
      } finally {
        setIsLoading(false);
        console.log('AuthContext: Verificação de auth finalizada');
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      console.log('AuthContext: Iniciando login...', credentials);
      setIsLoading(true);
      const response = await AuthService.login(credentials) as any;
      console.log('AuthContext: Resposta do login:', response);
      console.log('AuthContext: response.user:', response.user);
      console.log('AuthContext: response.token:', response.token);
      
      // FALLBACK: Se response.user for undefined, extrair de response.data
      const userData = response.user || response.data?.user;
      const token = response.token || response.data?.token;
      
      console.log('AuthContext: userData extraído:', userData);
      console.log('AuthContext: token extraído:', token);
      
      // Setar usuário imediatamente
      setUser(userData);
      console.log('AuthContext: Usuário setado no estado:', userData);
      
      // Aguardar um pouco para garantir que o localStorage foi atualizado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verificar se o localStorage foi atualizado corretamente
      const savedToken = AuthService.getToken();
      const savedUser = await AuthService.verifyToken();
      console.log('AuthContext: Verificação pós-login - Token salvo:', !!savedToken, 'User salvo:', !!savedUser);
      
    } catch (error) {
      console.error('AuthContext: Erro no login:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Loading finalizado');
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
    }
  };

  // Debug: Log sempre que o estado do usuário mudar
  useEffect(() => {
    console.log('🔍 AuthContext: Estado do usuário mudou:', { user, isAuthenticated: !!user, isLoading });
  }, [user, isLoading]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};