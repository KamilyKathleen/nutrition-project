'use client';

import { useState, useEffect } from 'react';
import { X, Search, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Patient } from './types';

interface EditPatientModalProps {
    patient: Patient;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}


export default function EditPatientModal({ patient, isOpen, onClose, onUpdate }: EditPatientModalProps) {
    const [emailToLink, setEmailToLink] = useState('');
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setEmailToLink('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLinkPatient = async () => {
        if (!emailToLink.trim()) {
            alert('Por favor, digite um e-mail para vincular');
            return;
        }

        try {
            setLinking(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8000/api/patients/${patient.id}/link`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailToLink.trim()
                })
            });

            if (response.ok) {
                alert('Se um usuário com esse email existir, ele recebeu o convite.');
                onUpdate();
                onClose();
            } else {
                const error = await response.json();
                alert('Erro ao tentar vincular: ' + error.message);
            }
        } catch (error) {
            console.error('❌ Erro ao vincular paciente:', error);
            alert('Erro ao vincular paciente. Tente novamente.');
        } finally {
            setLinking(false);
        }
    };

    const isLinked = patient.status === 'linked';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-petroleumGreen to-green-700 text-white p-6 rounded-t-xl flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Editar Paciente</h2>
                        <p className="text-green-100 text-sm mt-1">Vincule este paciente a uma conta de usuário existente</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                    {/* Informações do Paciente */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Informações Atuais</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Nome:</span>
                                <span className="font-semibold text-gray-800">{patient.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">E-mail:</span>
                                <span className="font-semibold text-gray-800">{patient.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    isLinked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {isLinked ? 'Vinculado' : 'Não Vinculado'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status de Vinculação */}
                    {isLinked ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <LinkIcon className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-semibold text-green-900 mb-1">Paciente Vinculado</h4>
                                <p className="text-sm text-green-700">
                                    Este paciente já está vinculado a uma conta de usuário e pode acessar suas informações no sistema.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-semibold text-yellow-900 mb-1">Paciente Não Vinculado</h4>
                                <p className="text-sm text-yellow-700">
                                    Este paciente foi criado pelo nutricionista mas ainda não possui conta no sistema.
                                    Vincule-o a um usuário existente para que possa acessar suas informações.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Vincular Usuário por E-mail */}
                    {!isLinked && (
                        <div className="border-t pt-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Vincular a Usuário Existente</h3>
                            <div className="flex gap-2 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="email"
                                        value={emailToLink}
                                        onChange={(e) => setEmailToLink(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleLinkPatient()}
                                        placeholder="Digite o e-mail do usuário"
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petroleumGreen focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                                </div>
                                <button
                                    onClick={handleLinkPatient}
                                    disabled={linking}
                                    className="px-6 py-2 bg-petroleumGreen text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-2"
                                >
                                    <LinkIcon size={20} />
                                    {linking ? 'Vinculando...' : 'Vincular Paciente'}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Por segurança, o sistema não informa se o e-mail existe. Se um usuário com esse e-mail existir, ele receberá o convite.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
