'use client';

import { X, UserPlus } from 'lucide-react';
import { Patient } from './types';

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddPatient: (newPatient: Patient) => void;
}

export default function AddPatientModal({ isOpen, onClose, onAddPatient }: AddPatientModalProps) {
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const patientData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string || undefined, // E-mail opcional
            phone: formData.get('phone') as string,
            dateOfBirth: formData.get('dateOfBirth') as string,
            sex: formData.get('sex') as string,
            goal: formData.get('goal') as string
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/patients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('✅ Paciente adicionado com sucesso!');
                onAddPatient(result.data);
                onClose();
            } else {
                const error = await response.json();
                alert('Erro ao adicionar paciente: ' + error.message);
            }
        } catch (error) {
            console.error('Erro ao adicionar paciente:', error);
            alert('Erro ao adicionar paciente. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    title="Fechar"
                    aria-label="Fechar modal"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Adicionar Novo Paciente</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Informações Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo *</label>
                            <input type="text" id="name" name="name" required className="mt-1 w-full input-style" placeholder="Nome completo do paciente" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail (opcional)</label>
                            <input type="email" id="email" name="email" className="mt-1 w-full input-style" placeholder="email@exemplo.com" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone *</label>
                            <input type="tel" id="phone" name="phone" required className="mt-1 w-full input-style" placeholder="(00) 00000-0000" />
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Data de Nascimento *</label>
                            <input type="date" id="dateOfBirth" name="dateOfBirth" required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sexo *</label>
                            <select id="sex" name="sex" required className="mt-1 w-full input-style">
                                <option value="">Selecione...</option>
                                <option value="male">Masculino</option>
                                <option value="female">Feminino</option>
                                <option value="other">Outro</option>
                            </select>
                        </div>
                    </div>

                    {/* Meta */}
                    <div>
                        <label htmlFor="goal" className="block text-sm font-medium text-gray-700">Objetivo/Observações</label>
                        <textarea id="goal" name="goal" rows={3} className="mt-1 w-full input-style" placeholder="Ex: Perder peso, ganhar massa muscular, melhorar a alimentação..."></textarea>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                        <p className="font-semibold mb-1">💡 Dica:</p>
                        <p>O e-mail é opcional. Você pode criar o paciente agora e vinculá-lo a uma conta de usuário depois usando o botão "Editar".</p>
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