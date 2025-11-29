'use client';

import { useState } from "react";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner-blog.jpeg";
import PatientBlog from "@/app/pages/blog/PatientBlog";
import NutritionistBlog from "@/app/pages/blog/NutritionistBlog";
import { User, UserRole } from "@/app/pages/blog/types";
import Link from "next/link";

// Simulação de autenticação. Em um app real, isso viria de um Context ou hook de autenticação.
const mockUsers: Record<UserRole, User> = {
    nutritionist: { name: "Nutricionista", role: 'nutritionist' },
    patient: { name: "Paciente", role: 'patient' },
};

export default function Blog() {
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers.nutritionist);

    const handleUserChange = (role: UserRole) => {
        setCurrentUser(mockUsers[role] ?? null);
    };

    return (
        <div>
            <Breadcrumb
                image={Banner}
                title="Artigos e Receitas"
                page="Blog"
            />

            <main className="container mx-auto p-4 md:p-8">
                {/* Seletor para simular a troca de usuário - REMOVER EM PRODUÇÃO */}
                <div className="mb-8 p-4 bg-mintGreen border border-petroleumGreen rounded-lg text-center flex justify-center items-center space-x-4">
                    <p className="font-semibold mb-2">Área de Simulação</p>
                    <div>
                        <button onClick={() => handleUserChange('nutritionist')} className={`px-4 py-2 rounded-l-lg ${currentUser?.role === 'nutritionist' ? 'bg-petroleumGreen text-white' : 'bg-white'}`}>Nutricionista</button>
                        <button onClick={() => handleUserChange('patient')} className={`px-4 py-2 rounded-r-lg ${currentUser?.role === 'patient' ? 'bg-petroleumGreen text-white' : 'bg-white'}`}>Paciente</button>
                    </div>
                </div>

                {currentUser ? (
                    currentUser.role === 'nutritionist' ? <NutritionistBlog /> : <PatientBlog />
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Você não está logado</h2>
                        <p className="text-gray-600 mt-2">
                            Por favor,&nbsp;
                            <Link
                                href='/pages/login'
                                className="font-semibold text-petroleumGreen hover:underline"
                            >
                                faça seu login
                            </Link>
                            &nbsp;para continuar.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}