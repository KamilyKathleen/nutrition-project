'use client'

import Image from 'next/image';
import Logo from '@/public/logo.png';
import { FaLightbulb, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
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

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            console.log('Dados sendo enviados para login:', {
                email: formData.email,
                password: formData.password
            });
            
            await login({
                email: formData.email,
                password: formData.password
            });
            
            console.log('🔍 Login: Login realizado com sucesso, redirecionando para dashboard...');
            
            // Sucesso - navegar para dashboard
            router.push('/pages/dashboard');
            console.log('🔍 Login: Router.push executado');
        } catch (error) {
            console.error('Erro no login:', error);
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

                            <Link
                                href=""
                                className='text-gray-400 text-sm text-right hover:underline'
                            >
                                Esqueci a senha
                            </Link>
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
        </div>
    );
}
