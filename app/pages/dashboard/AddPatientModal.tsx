'use client';

import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Patient } from './types';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPatient: (newPatient: Patient) => void;
}

export default function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        // Adicione aqui os outros campos que você precisa

        // Simulação de criação de um novo paciente
        const newPatient: Patient = {
            id: new Date().toISOString(), // ID único provisório
            name,
            email,
            lastAppointment: new Date().toLocaleDateString('pt-BR'),
            status: 'Ativo',
            // Adicione os outros dados aqui
        };

        onAddPatient(newPatient);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Novo Paciente</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Informações Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" id="name" name="name" required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
                            <input type="email" id="email" name="email" required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sexo</label>
                            <select id="sex" name="sex" required className="mt-1 w-full input-style">
                                <option value="feminino">Feminino</option>
                                <option value="masculino">Masculino</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700">Idade</label>
                            <input type="number" id="age" name="age" required className="mt-1 w-full input-style" />
                        </div>
                    </div>

                    {/* Dados Antropométricos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                            <input type="number" step="0.1" id="weight" name="weight" required className="mt-1 w-full input-style" placeholder="Ex: 70.5" />
                        </div>
                        <div>
                            <label htmlFor="height" className="block text-sm font-medium text-gray-700">Altura (m)</label>
                            <input type="number" step="0.01" id="height" name="height" required className="mt-1 w-full input-style" placeholder="Ex: 1.75" />
                        </div>
                    </div>

                    {/* Meta */}
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Meta Principal</label>
                        <textarea id="goal" name="goal" rows={3} className="mt-1 w-full input-style" placeholder="Ex: Perder 5kg em 2 meses, melhorar a disposição..."></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                            <UserPlus size={18} />
                            <span>Adicionar Paciente</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Adicione um estilo base para os inputs no seu arquivo CSS global (ex: globals.css)
/*
@layer components {
  .input-style {
    @apply px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
*/