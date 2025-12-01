'use client'

import Image from 'next/image';
import Logo from '@/public/logo.png';
import { FaLightbulb, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AuthService from '@/app/services/authService';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetLoading(true);
        setResetMessage('');

        try {
            await AuthService.resetPassword(resetEmail);
            setResetMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            setTimeout(() => {
                setShowResetModal(false);
                setResetEmail('');
                setResetMessage('');
            }, 3000);
        } catch (error) {
            setResetMessage('Erro ao enviar email. Verifique o endereço e tente novamente.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            
            await login({
                email: formData.email,
                password: formData.password
            });
            
            
            // Sucesso - navegar para dashboard
            router.push('/pages/dashboard');
        } catch (error) {
            alert('Erro no login: ' + (error as Error).message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-[100vh] bg-gradient-to-r from-mintGreen to-petroleumGreen p-4">
                <div className="w-[90%] max-w-[500px] mx-auto bg-white px-6 py-6 rounded-lg shadow-xl shadow-gray-700 border border-gray-200">
                    <Image
                        src={Logo}
                        alt='Logo'
                        className='w-48 mx-auto my-8'
                    />
                    <h2 className="text-2xl text-petroleumGreen font-bold text-center my-4 uppercase">Login</h2>

                    <form onSubmit={handleLogin}>
                        {/* Email Field */}
                        <div className="flex flex-col my-4">
                            <label className="mb-1 text-gray-700 font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen"
                                placeholder="Digite seu email"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div className="flex flex-col my-4 relative">
                            <label className="mb-1 text-gray-700 font-medium">Senha</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen pr-12"
                                placeholder="Digite sua senha"
                                required
                            />

                            {/* Eye Icon */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-11 text-gray-500 hover:text-gray-700 transition-opacity"
                            >
                                {showPassword ? (
                                    <FaEye className="opacity-100" />
                                ) : (
                                    <FaEyeSlash className="opacity-60" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowResetModal(true)}
                                className='text-gray-400 text-sm text-right hover:underline'
                            >
                                Esqueci a senha
                            </button>
                        </div>

                        <div className='text-center'>
                            <button
                                type="submit"
                                className="mt-6 px-12 py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition"
                            >
                                Entrar
                            </button>
                        </div>
                    </form>

                    <div className='text-center mt-6'>
                        <Link
                            href='/pages/register'
                            className="text-gray-400 text-sm hover:underline"
                        >
                            Ainda não possui cadastro? Registre-se!
                        </Link>
                    </div>

                    <div className='text-center my-10'>
                        <p className="text-base text-gray-600 italic">
                            <FaLightbulb className="inline mr-2 text-amber-500 animate-pulse" />
                            &quot;Transforme sua alimentação, transforme sua vida.&quot;
                            <FaLightbulb className="inline ml-2 text-amber-500 animate-pulse" />
                        </p>
                    </div>
                </div>

                {showResetModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recuperar Senha</h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Digite seu email para receber o link de recuperação
                            </p>
                            <form onSubmit={handleResetPassword}>
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="seu@email.com"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-mintGreen"
                                />
                                {resetMessage && (
                                    <p className={`text-sm mb-4 ${resetMessage.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
                                        {resetMessage}
                                    </p>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetModal(false);
                                            setResetEmail('');
                                            setResetMessage('');
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className="flex-1 px-4 py-2 bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition disabled:opacity-50"
                                    >
                                        {resetLoading ? 'Enviando...' : 'Enviar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
        </div>
    );
}
