'use client';

import { useState } from 'react';
import FirebaseClientAuth from '@/lib/firebase-client';

/**
 * 🔐 FIREBASE LOGIN COMPONENT
 * ===========================
 * Componente de login integrado com Firebase Auth
 */

export default function FirebaseLogin() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseClientAuth.loginWithEmail(
        formData.email,
        formData.password
      );

      if (result.success) {
        setSuccess('Login realizado com sucesso!');
        // Aqui você pode redirecionar o usuário
        console.log('Usuário logado:', result.user);
        console.log('Token:', result.token);
      } else {
        setError(result.error || 'Erro no login');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar com email e senha
   */
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validar senhas
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
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
        console.log('Usuário criado:', result.user);
        console.log('Token:', result.token);
      } else {
        setError(result.error || 'Erro no registro');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login com Google
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await FirebaseClientAuth.loginWithGoogle();

      if (result.success) {
        setSuccess('Login com Google realizado com sucesso!');
        console.log('Usuário logado:', result.user);
        console.log('Token:', result.token);
        console.log('É novo usuário:', result.isNewUser);
      } else {
        setError(result.error || 'Erro no login com Google');
      }
    } catch (error: any) {
      setError(error.message || 'Erro inesperado');
    } finally {
      setLoading(false);
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

    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isLogin ? 'Fazer Login' : 'Criar Conta'}
        </h2>
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
        disabled={loading}
        className="w-full mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md font-medium transition-colors"
      >
        {loading ? 'Conectando...' : '🔍 Continuar com Google'}
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
            />
          </div>
        )}

        {/* Botão de submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md font-medium transition-colors"
        >
          {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
        </button>
      </form>

      {/* Link para recuperar senha */}
      {isLogin && (
        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className="w-full mb-4 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Esqueci minha senha
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
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {isLogin ? 'Não tem conta? Criar uma nova' : 'Já tem conta? Fazer login'}
        </button>
      </div>
    </div>
  );
}

/**
 * 🚪 LOGOUT COMPONENT
 * ===================
 */

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const result = await FirebaseClientAuth.logout();
      if (result.success) {
        console.log('Logout realizado com sucesso');
        // Redirecionar para página de login
      }
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}