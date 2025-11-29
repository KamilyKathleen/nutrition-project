'use client';

import { X, Send } from 'lucide-react';

interface InvitePatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInviteSent?: () => void;
}

export default function InvitePatientModal({ isOpen, onClose, onInviteSent }: InvitePatientModalProps) {
    if (!isOpen) return null;

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;
        
        try {
            // Enviar convite via API
            const response = await fetch('http://localhost:8000/api/patients/invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    patientEmail: email,
                    ...(message && { message: message }) // Só inclui mensagem se não estiver vazia
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                alert(result.message || 'Convite enviado com sucesso!');
                onClose();
                // Atualizar a lista de convites no dashboard
                if (onInviteSent) {
                    onInviteSent();
                }
            } else {
                const error = await response.json();
                alert('Erro ao enviar convite: ' + error.message);
            }
        } catch (error) {
            console.error('Erro ao enviar convite:', error);
            alert('Erro ao enviar convite. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    title="Fechar modal"
                    aria-label="Fechar modal"
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Convidar Novo Paciente</h2>
                <form onSubmit={handleInvite}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail do Paciente</label>
                        <input type="email" id="email" name="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="exemplo@email.com" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Mensagem (opcional)</label>
                        <textarea id="message" name="message" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Olá! Gostaria de convidá-lo(a) para iniciarmos um acompanhamento nutricional..."></textarea>
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