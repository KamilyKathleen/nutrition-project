'use client';

import { X, ClipboardPlus } from 'lucide-react';
import { Patient } from './types';

interface NewEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export default function NewEvaluationModal({ isOpen, onClose, patient }: NewEvaluationModalProps) {
    if (!isOpen || !patient) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        // Aqui iria a lógica para salvar a avaliação em uma API
        alert(`Nova avaliação para ${patient.name} salva! (simulação)`);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-1 text-gray-800">Nova Avaliação Nutricional</h2>
                <p className="text-md mb-6 text-gray-600">Paciente: <span className="font-semibold">{patient.name}</span></p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="evaluationDate" className="block text-sm font-medium text-gray-700">Data da Avaliação</label>
                            <input type="date" id="evaluationDate" name="evaluationDate" defaultValue={new Date().toISOString().split('T')[0]} required className="mt-1 w-full input-style" />
                        </div>
                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                            <input type="number" step="0.1" id="weight" name="weight" required className="mt-1 w-full input-style" placeholder="Ex: 70.5" />
                        </div>
                        <div>
                            <label htmlFor="bodyFat" className="block text-sm font-medium text-gray-700">Gordura Corporal (%)</label>
                            <input type="number" step="0.1" id="bodyFat" name="bodyFat" className="mt-1 w-full input-style" placeholder="Ex: 18.5" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Observações</label>
                        <textarea id="notes" name="notes" rows={4} className="mt-1 w-full input-style" placeholder="Anote aqui as dobras cutâneas, circunferências, observações clínicas, etc..."></textarea>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                            <ClipboardPlus size={18} />
                            <span>Salvar Avaliação</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}