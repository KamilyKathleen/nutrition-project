'use client';

import { useState } from "react";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "../../img/banner.jpeg";
import NutritionistDashboard from "./NutritionistDashboard";
import PatientDashboard from "./PatientDashboard";
import { User, UserRole } from "./types";

// Simulação de autenticação. Em um app real, isso viria de um Context ou hook de autenticação.
const mockUsers: Record<UserRole, User> = {
    nutritionist: { name: "Nutricionista", role: 'nutritionist' },
    patient: { name: "Paciente", role: 'patient' },
};

export default function Dashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(mockUsers.nutritionist);

    const handleUserChange = (role: UserRole) => {
        setCurrentUser(mockUsers[role] ?? null);
    };

    return (
        <div>
            <Breadcrumb
                image={Banner}
                title={`Bem-vindo(a), ${currentUser?.name ?? ""}!`}
                page="Dashboard"
            />

            <main className="container mx-auto p-4 md:p-8">
                {/* Seletor para simular a troca de usuário - REMOVER EM PRODUÇÃO */}
                <div className="mb-8 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center flex justify-center items-center space-x-4">
                    <p className="font-semibold mb-2">Área de Simulação</p>
                    <div>
                        <button onClick={() => handleUserChange('nutritionist')} className={`px-4 py-2 rounded-l-lg ${currentUser?.role === 'nutritionist' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Nutricionista</button>
                        <button onClick={() => handleUserChange('patient')} className={`px-4 py-2 rounded-r-lg ${currentUser?.role === 'patient' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Paciente</button>
                    </div>
                </div>

                {currentUser ? (
                    currentUser.role === 'nutritionist' ? <NutritionistDashboard /> : <PatientDashboard />
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-gray-800">Você não está logado</h2>
                        <p className="text-gray-600 mt-2">
                            Por favor, <span className="font-semibold text-blue-600">faça seu login</span> para continuar.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}