'use client'

import Image from 'next/image';
import Logo from '@/public/logo.png';
import { FaLightbulb, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {

    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <div className="flex flex-col items-center justify-center h-[100vh] bg-gradient-to-r from-mintGreen to-petroleumGreen p-4">
                <div className="w-[90%] max-w-[500px] mx-auto bg-white px-6 py-6 rounded-lg shadow-xl shadow-gray-700 border border-gray-200">
                    <Image
                        src={Logo}
                        alt='Logo'
                        className='w-60 mx-auto my-8'
                    />
                    <h2 className="text-3xl text-petroleumGreen font-bold text-center my-4">Bem-vindo!</h2>

                    {/* Email Field */}
                    <div className="flex flex-col my-4">
                        <label className="mb-1 text-gray-700 font-medium">Email</label>
                        <input
                            type="email"
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen"
                            placeholder="Digite seu email"
                        />
                    </div>


                    {/* Password Field */}
                    <div className="flex flex-col my-4 relative">
                        <label className="mb-1 text-gray-700 font-medium">Senha</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-petroleumGreen pr-12"
                            placeholder="Digite sua senha"
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

                    <div className='text-center'>
                        <Link
                            href='/pages/dashboard'
                            className="mt-6 px-12 py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition inline-block text-center"
                        >
                            Entrar
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
        </>
    );
}
