'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../firebase.config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
  firebaseUid: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  // CPF, phone, avatar não existem para usuários Firebase básicos
}

export default function TestFirebasePage() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [backendUser, setBackendUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          // Fazer login no backend com o token Firebase
          const token = await user.getIdToken();
          const response = await fetch('http://localhost:3001/api/firebase/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: user.displayName || name || 'Usuário Firebase',
              email: user.email
            })
          });

          if (response.ok) {
            const data = await response.json();
            setBackendUser(data.user);
            setSuccess('Login realizado com sucesso!');
            setError('');
          } else {
            const errorData = await response.json();
            setError(`Erro no backend: ${errorData.message}`);
          }
        } catch (err: any) {
          setError(`Erro ao conectar com backend: ${err.message}`);
        }
      } else {
        setBackendUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [name]);

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(`Erro no login Google: ${err.message}`);
      setLoading(false);
    }
  };

  // Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      if (isSignUp) {
        // Criar conta
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // Fazer login
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(`Erro no ${isSignUp ? 'cadastro' : 'login'}: ${err.message}`);
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setSuccess('Logout realizado com sucesso!');
      setError('');
    } catch (err: any) {
      setError(`Erro no logout: ${err.message}`);
    }
  };

  // Get user profile from backend
  const handleGetProfile = async () => {
    if (!firebaseUser) return;
    
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch('http://localhost:3001/api/firebase/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBackendUser(data.user);
        setSuccess('Perfil atualizado!');
      } else {
        const errorData = await response.json();
        setError(`Erro ao buscar perfil: ${errorData.message}`);
      }
    } catch (err: any) {
      setError(`Erro ao buscar perfil: ${err.message}`);
    }
  };

  if (loading && !firebaseUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🔥 Teste Firebase Authentication
        </h1>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Form */}
          {!firebaseUser && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">
                {isSignUp ? 'Criar Conta' : 'Fazer Login'}
              </h2>
              
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full mb-4 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Carregando...' : 'Login com Google'}
              </button>

              <div className="text-center mb-4 text-gray-500">ou</div>

              {/* Email/Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua senha"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Carregando...' : (isSignUp ? 'Criar Conta' : 'Entrar')}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {isSignUp ? 'Já tem conta? Fazer login' : 'Não tem conta? Criar uma'}
                </button>
              </div>
            </div>
          )}

          {/* User Info */}
          {firebaseUser && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                👤 Informações do Usuário
                <button
                  onClick={handleLogout}
                  className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">🔥 Firebase:</h3>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p><strong>UID:</strong> {firebaseUser.uid}</p>
                    <p><strong>Email:</strong> {firebaseUser.email}</p>
                    <p><strong>Nome:</strong> {firebaseUser.displayName || 'N/A'}</p>
                    <p><strong>Verificado:</strong> {firebaseUser.emailVerified ? '✅' : '❌'}</p>
                  </div>
                </div>

                {backendUser && (
                  <div>
                    <h3 className="font-semibold text-gray-700">🗄️ Backend:</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p><strong>ID:</strong> {backendUser.id}</p>
                      <p><strong>Nome:</strong> {backendUser.name}</p>
                      <p><strong>Email:</strong> {backendUser.email}</p>
                      <p><strong>Role:</strong> {backendUser.role}</p>
                      <p><strong>Firebase UID:</strong> {backendUser.firebaseUid}</p>
                      <p><strong>Ativo:</strong> {backendUser.isActive ? '✅' : '❌'}</p>
                      <p><strong>Criado em:</strong> {new Date(backendUser.createdAt).toLocaleString()}</p>
                      <p className="text-green-600"><strong>✅ SEM CPF, telefone, avatar (usuário básico)</strong></p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGetProfile}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Atualizar Perfil do Backend
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">📋 Como testar:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Clique em "Login com Google" ou preencha email/senha</li>
            <li>Observe que o usuário Firebase é criado automaticamente no backend</li>
            <li>Verifique que usuários básicos NÃO têm CPF, telefone ou avatar</li>
            <li>Teste o logout e login novamente</li>
            <li>Verifique no console do navegador se há erros</li>
          </ol>
        </div>
      </div>
    </div>
  );
}