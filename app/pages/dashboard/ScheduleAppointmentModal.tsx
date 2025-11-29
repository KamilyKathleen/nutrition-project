'use client';

import { useState } from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';
import { Patient } from './types';

interface ScheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export default function ScheduleAppointmentModal({ isOpen, onClose, patient }: ScheduleAppointmentModalProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [type, setType] = useState('initial');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!patient) {
            alert('Nenhum paciente selecionado');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch('http://localhost:8000/api/consultations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    patientId: patient.id,
                    scheduledDate: `${date}T${time}:00`,
                    duration: Number.parseInt(duration),
                    type,
                    notes
                })
            });

            if (response.ok) {
                alert('Consulta agendada com sucesso!');
                setDate('');
                setTime('');
                setDuration('60');
                setType('initial');
                setNotes('');
                onClose();
            } else {
                const error = await response.json();
                alert(`Erro ao agendar consulta: ${error.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao agendar consulta:', error);
            alert('Erro ao agendar consulta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !patient) return null;

    // Data mínima (hoje)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Agendar Consulta</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Paciente: <span className="font-semibold text-blue-600">{patient.name}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Data e Hora */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="mr-2 h-4 w-4 text-blue-600" />
                                Data da Consulta *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={today}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Clock className="mr-2 h-4 w-4 text-blue-600" />
                                Horário *
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Tipo e Duração */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Consulta *
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="initial">Primeira Consulta</option>
                                <option value="follow_up">Retorno</option>
                                <option value="in_person">Consulta Presencial</option>
                                <option value="online">Consulta Online</option>
                                <option value="emergency">Emergência</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Duração (minutos) *
                            </label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="30">30 minutos</option>
                                <option value="45">45 minutos</option>
                                <option value="60">60 minutos</option>
                                <option value="90">90 minutos</option>
                            </select>
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <FileText className="mr-2 h-4 w-4 text-blue-600" />
                            Observações
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                            placeholder="Adicione observações sobre a consulta (opcional)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {loading ? 'Agendando...' : 'Agendar Consulta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
