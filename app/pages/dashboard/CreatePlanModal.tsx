'use client';

import { X, Utensils } from 'lucide-react';
import { Patient } from './types';

interface CreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export default function CreatePlanModal({ isOpen, onClose, patient }: CreatePlanModalProps) {
    if (!isOpen || !patient) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // A lógica para salvar o plano alimentar em uma API iria aqui
        alert(`Novo plano alimentar para ${patient.name} salvo! (simulação)`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-1 text-gray-800">Criar Plano Alimentar</h2>
                <p className="text-md mb-6 text-gray-600">Paciente: <span className="font-semibold">{patient.name}</span></p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="planName" className="block text-sm font-medium text-gray-700">Nome do Plano</label>
                        <input type="text" id="planName" name="planName" required className="mt-1 w-full input-style" placeholder="Ex: Plano para Hipertrofia" />
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Refeições</h3>
                        <div>
                            <label htmlFor="breakfast" className="block text-sm font-medium text-gray-700">Café da Manhã</label>
                            <textarea id="breakfast" name="breakfast" rows={3} className="mt-1 w-full input-style" placeholder="Detalhes da refeição..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="lunch" className="block text-sm font-medium text-gray-700">Almoço</label>
                            <textarea id="lunch" name="lunch" rows={3} className="mt-1 w-full input-style" placeholder="Detalhes da refeição..."></textarea>
                        </div>
                        <div>
                            <label htmlFor="dinner" className="block text-sm font-medium text-gray-700">Jantar</label>
                            <textarea id="dinner" name="dinner" rows={3} className="mt-1 w-full input-style" placeholder="Detalhes da refeição..."></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                            <Utensils size={18} />
                            <span>Salvar Plano</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}