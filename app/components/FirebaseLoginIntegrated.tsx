'use client';

import { useState, useEffect } from 'react';
import FirebaseClientAuth from '@/lib/firebase-client';
import { User } from 'firebase/auth';

/**
 * 🔐 FIREBASE LOGIN INTEGRATED COMPONENT
 * ======================================
 * Componente integrado completo com Firebase Auth e gerenciamento de estado
 */

export default function FirebaseLoginIntegrated() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Monitorar estado de autenticação
  useEffect(() => {
    const unsubscribe = FirebaseClientAuth.onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Manipular mudanças no formulário
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Limpar erros quando usuário digita
    if (error) setError(null);
  };

  /**
   * Login com email e senha
   */
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const result = await FirebaseClientAuth.loginWithEmail(
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess('Login realizado com sucesso!');
        // O usuário será atualizado automaticamente pelo listener
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Registrar com email e senha
   */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    // Validar senhas
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setActionLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setActionLoading(false);
      return;
    }

    try {
      const result = await FirebaseClientAuth.registerWithEmail(
        formData.email,
        formData.password,
        formData.displayName
      );

      if (result.success) {
        setSuccess('Conta criada com sucesso!');
        // O usuário será atualizado automaticamente pelo listener
      } else {
        setError(result.error || 'Erro no registro');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Login com Google
   */
  const handleGoogleLogin = async () => {
    setActionLoading(true);
    setError(null);

    try {
      const result = await FirebaseClientAuth.loginWithGoogle();

      if (result.success) {
        setSuccess('Login com Google realizado com sucesso!');
        // O usuário será atualizado automaticamente pelo listener
      } else {
        setError(result.error || 'Erro no login com Google');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Recuperar senha
   */
  const handlePasswordReset = async () => {
    if (!formData.email) {
      setError('Digite seu email para recuperar a senha');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      const result = await FirebaseClientAuth.resetPassword(formData.email);

      if (result.success) {
        setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      } else {
        setError(result.error || 'Erro ao enviar email de recuperação');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Fazer logout
   */
  const handleLogout = async () => {
    setActionLoading(true);
    try {
      await FirebaseClientAuth.logout();
      setSuccess('Logout realizado com sucesso!');
    } catch (error) {
      setError('Erro ao fazer logout');
    } finally {
      setActionLoading(false);
    }
  };

  // Loading inicial
  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se usuário está logado
  if (user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo!</h2>
          <p className="text-gray-600">{user.displayName || 'Usuário'}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Informações do usuário */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">Informações da conta:</h3>
          <div className="text-sm space-y-1">
            <p><strong>UID:</strong> {user.uid}</p>
            <p><strong>Email verificado:</strong> {user.emailVerified ? '✅ Sim' : '❌ Não'}</p>
            <p><strong>Provedor:</strong> {user.providerData[0]?.providerId || 'email/senha'}</p>
            <p><strong>Criado em:</strong> {user.metadata.creationTime}</p>
            <p><strong>Último login:</strong> {user.metadata.lastSignInTime}</p>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            🏠 Ir para Dashboard
          </button>
          
          <button
            onClick={handleLogout}
            disabled={actionLoading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md font-medium transition-colors"
          >
            {actionLoading ? 'Saindo...' : '🚪 Sair'}
          </button>
        </div>
      </div>
    );
  }

  // Formulário de login/registro
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          🔥 {isLogin ? 'Fazer Login' : 'Criar Conta'}
        </h2>
        <p className="text-gray-600">Sistema Firebase Integrado</p>
      </div>

      {/* Mensagens de erro e sucesso */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Botão de Login com Google */}
      <button
        onClick={handleGoogleLogin}
        disabled={actionLoading}
        className="w-full mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md font-medium transition-colors flex items-center justify-center space-x-2"
      >
        <span>🔍</span>
        <span>{actionLoading ? 'Conectando...' : 'Continuar com Google'}</span>
      </button>

      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {/* Formulário de email/senha */}
      <form onSubmit={isLogin ? handleEmailLogin : handleEmailRegister}>
        {/* Nome (apenas no registro) */}
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isLogin}
              disabled={actionLoading}
            />
          </div>
        )}

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={actionLoading}
          />
        </div>

        {/* Senha */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength={6}
            disabled={actionLoading}
          />
        </div>

        {/* Confirmar senha (apenas no registro) */}
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={!isLogin}
              disabled={actionLoading}
            />
          </div>
        )}

        {/* Botão de submit */}
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
        >
          {actionLoading ? 'Processando...' : (isLogin ? '🔑 Entrar' : '📝 Criar conta')}
        </button>
      </form>

      {/* Link para recuperar senha */}
      {isLogin && (
        <button
          onClick={handlePasswordReset}
          disabled={actionLoading}
          className="w-full mb-4 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          🔒 Esqueci minha senha
        </button>
      )}

      {/* Toggle entre login e registro */}
      <div className="text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(null);
            setFormData({
              email: '',
              password: '',
              confirmPassword: '',
              displayName: ''
            });
          }}
          disabled={actionLoading}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {isLogin ? 'Não tem conta? Criar uma nova' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  );
}