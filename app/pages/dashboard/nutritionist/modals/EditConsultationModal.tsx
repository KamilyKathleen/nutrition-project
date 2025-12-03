'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertCircle, Trash2 } from 'lucide-react';

interface Consultation {
    id: string;
    patientId: string;
    patientName?: string;
    date: string;
    duration: number;
    type: string;
    status: string;
    notes?: string;
}

interface EditConsultationModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly consultation: Consultation | null;
    readonly onUpdate: () => void;
}

export default function EditConsultationModal({ isOpen, onClose, consultation, onUpdate }: EditConsultationModalProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [type, setType] = useState('follow_up');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (consultation) {
            const consultDate = new Date(consultation.date);
            setDate(consultDate.toISOString().split('T')[0]);
            setTime(consultDate.toTimeString().slice(0, 5));
            setDuration(consultation.duration);
            setType(consultation.type);
            setNotes(consultation.notes || '');
        }
    }, [consultation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!consultation) return;
        
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            
            // Combinar data e hora
            const scheduledDateTime = new Date(`${date}T${time}`);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultations/${consultation.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    scheduledDate: scheduledDateTime.toISOString(),
                    duration,
                    type,
                    notes
                })
            });

            if (response.ok) {
                onUpdate();
                onClose();
                resetForm();
            } else {
                const data = await response.json();
                setError(data.message || 'Erro ao atualizar consulta');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!consultation) return;
        
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultations/${consultation.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                onUpdate();
                onClose();
                setShowDeleteConfirm(false);
                resetForm();
            } else {
                const data = await response.json();
                setError(data.message || 'Erro ao excluir consulta');
            }
        } catch (err) {
            setError('Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsCompleted = async () => {
        if (!consultation) return;
        
        setError('');
        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            
            const url = `${process.env.NEXT_PUBLIC_API_URL}/consultations/${consultation.id}/mark-completed`;
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });


            if (response.ok) {
                const data = await response.json();
                onUpdate();
                onClose();
                resetForm();
            } else {
                const data = await response.json();
                setError(data.message || 'Erro ao marcar consulta como realizada');
            }
        } catch (err: any) {
            setError('Erro ao conectar com o servidor: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setDate('');
        setTime('');
        setDuration(60);
        setType('follow_up');
        setNotes('');
        setError('');
        setShowDeleteConfirm(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen || !consultation) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800">Editar Consulta</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        disabled={loading}
                        title="Fechar"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="p-4 bg-red-50 border-b border-red-200">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">Confirmar exclusão</p>
                                <p className="text-sm text-red-700 mt-1">
                                    Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita.
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={handleDelete}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                                    >
                                        {loading ? 'Excluindo...' : 'Sim, excluir'}
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Patient Info */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Paciente:</p>
                        <p className="font-semibold text-gray-800">{consultation.patientName || 'Não identificado'}</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                title="Selecione a data da consulta"
                            />
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Horário <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                title="Selecione o horário da consulta"
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Selecione a duração da consulta"
                        >
                            <option value={30}>30 minutos</option>
                            <option value={45}>45 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1h 30min</option>
                            <option value={120}>2 horas</option>
                        </select>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Consulta <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            title="Selecione o tipo de consulta"
                        >
                            <option value="initial">Inicial</option>
                            <option value="follow_up">Retorno</option>
                            <option value="in_person">Presencial</option>
                            <option value="online">Online</option>
                            <option value="emergency">Emergência</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            placeholder="Adicione observações sobre a consulta..."
                        />
                    </div>

                    {/* Mark as Completed Button - Only show if status is scheduled */}
                    {consultation.status === 'scheduled' && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={handleMarkAsCompleted}
                                disabled={loading}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                            >
                                ✅ Marcar como Realizada
                            </button>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50 border border-red-200"
                        >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                        </button>
                        <div className="flex-1 flex gap-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
