'use client'

import Image from 'next/image';
import Logo from '@/public/logo.png';
import { FaLightbulb, FaEye, FaEyeSlash, FaUserMd, FaUser } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'patient' | 'nutritionist'>('patient');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        crn: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const registerData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: selectedRole,
                ...(selectedRole === 'nutritionist' && { crn: formData.crn })
            };

            console.log('Dados sendo enviados para registro:', registerData);
            await register(registerData);
            
            // Sucesso - navegar para dashboard
            router.push('/pages/dashboard');
        } catch (error) {
            console.error('Erro no registro:', error);
            alert('Erro no registro: ' + (error as Error).message);
        }
    };



    return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] bg-gradient-to-r from-mintGreen to-petroleumGreen p-4 py-8">
                <div className="w-[90%] max-w-[600px] mx-auto bg-white px-6 py-6 rounded-lg shadow-xl shadow-gray-700 border border-gray-200 my-8">
                    <Image
                        src={Logo}
                        alt='Logo'
                        className='w-48 mx-auto my-8'
                    />
                    <h2 className="text-2xl text-petroleumGreen font-bold text-center my-4 uppercase">Cadastro</h2>

                    <form onSubmit={handleRegister}>
                        {/* Role Selection */}
                    <div className="flex flex-col my-4">
                        <label className="mb-2 text-gray-700 font-medium">Tipo de Usuário</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setSelectedRole('patient')}
                                className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                                    selectedRole === 'patient'
                                        ? 'border-petroleumGreen bg-petroleumGreen text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-petroleumGreen'
                                }`}
                            >
                                <FaUser />
                                Paciente
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedRole('nutritionist')}
                                className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                                    selectedRole === 'nutritionist'
                                        ? 'border-petroleumGreen bg-petroleumGreen text-white'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-petroleumGreen'
                                }`}
                            >
                                <FaUserMd />
                                Nutricionista
                            </button>
                        </div>
                    </div>

                    {/* Name Field */}
                    <div className="flex flex-col my-4">
                        <label className="mb-1 text-gray-700 font-medium">Nome Completo</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen"
                            placeholder="Digite seu nome completo"
                            required
                        />
                    </div>

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



                    {/* CRN Field - Only for Nutritionists */}
                    {selectedRole === 'nutritionist' && (
                        <div className="flex flex-col my-4">
                            <label className="mb-1 text-gray-700 font-medium">CRN (Conselho Regional de Nutricionistas)</label>
                            <input
                                type="text"
                                name="crn"
                                value={formData.crn}
                                onChange={handleInputChange}
                                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen"
                                placeholder="CRN-3/1234"
                                required
                            />
                            <small className="text-gray-500 mt-1">Formato: CRN-[região]/[número] (ex: CRN-3/1234)</small>
                        </div>
                    )}

                    {/* Password Field */}
                    <div className="flex flex-col my-4 relative">
                        <label className="mb-1 text-gray-700 font-medium">Senha</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen pr-12"
                            placeholder="Digite sua senha (mín. 8 caracteres)"
                            minLength={8}
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
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start my-4">
                        <input
                            type="checkbox"
                            id="terms"
                            className="mt-1 mr-2 accent-petroleumGreen"
                            required
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700">
                            Concordo com os <a href="#" className="text-petroleumGreen hover:underline">Termos de Uso</a> e <a href="#" className="text-petroleumGreen hover:underline">Política de Privacidade</a>
                        </label>
                    </div>

                        <div className='text-center'>
                            <button
                                type="submit"
                                className="mt-6 px-12 py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition inline-block text-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {selectedRole === 'nutritionist' ? 'Cadastrar como Nutricionista' : 'Cadastrar como Paciente'}
                            </button>
                        </div>
                    </form>

                    <div className='text-center mt-6'>
                        <Link
                            href='/pages/login'
                            className="text-gray-400 text-sm hover:underline"
                        >
                            Já possui cadastro? Faça Login!
                        </Link>
                    </div>

                    {/* Role-specific information */}
                    <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                        {selectedRole === 'patient' ? (
                            <div className="text-center">
                                <FaUser className="mx-auto text-2xl text-petroleumGreen mb-2" />
                                <h3 className="font-semibold text-petroleumGreen">Paciente</h3>
                                <p className="text-sm text-gray-600">
                                    Acompanhe sua evolução nutricional, acesse seus planos alimentares e mantenha contato com seu nutricionista.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <FaUserMd className="mx-auto text-2xl text-petroleumGreen mb-2" />
                                <h3 className="font-semibold text-petroleumGreen">Nutricionista</h3>
                                <p className="text-sm text-gray-600">
                                    Gerencie seus pacientes, crie planos alimentares personalizados e acompanhe a evolução nutricional.
                                </p>
                            </div>
                        )}
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
