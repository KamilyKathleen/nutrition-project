'use client';

import { X, Send } from 'lucide-react';

interface InvitePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InvitePatientModal({ isOpen, onClose }: InvitePatientModalProps) {
    if (!isOpen) return null;

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        // Aqui iria a lógica para enviar o convite para a API
        alert('Convite enviado! (simulação)');
        onClose(); // Fecha o modal após o envio
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Convidar Novo Paciente</h2>
                <form onSubmit={handleInvite}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail do Paciente</label>
                        <input type="email" id="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="exemplo@email.com" />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors">
                            <Send size={18} />
                            <span>Enviar Convite</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}