'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react';
import EditConsultationModal from './EditConsultationModal';

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

interface ConsultationsCalendarModalProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
}

type ViewMode = 'month' | 'week' | 'day';

export default function ConsultationsCalendarModal({ isOpen, onClose }: ConsultationsCalendarModalProps) {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchConsultations();
        }
    }, [isOpen]);

    const fetchConsultations = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConsultations(data.data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar consultas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConsultationClick = (consultation: Consultation) => {
        setSelectedConsultation(consultation);
        setEditModalOpen(true);
    };

    const handleUpdateConsultation = () => {
        fetchConsultations();
    };

    const getConsultationsForDate = (date: Date): Consultation[] => {
        return consultations.filter(consultation => {
            const consultDate = new Date(consultation.date);
            return consultDate.toDateString() === date.toDateString();
        });
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];
        
        // Adicionar dias vazios no início
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        
        // Adicionar dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const getWeekDays = (date: Date) => {
        const dayOfWeek = date.getDay();
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);

        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const navigatePrevious = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() - 1);
        } else if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() - 7);
        } else {
            newDate.setDate(currentDate.getDate() - 1);
        }
        setCurrentDate(newDate);
    };

    const navigateNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'month') {
            newDate.setMonth(currentDate.getMonth() + 1);
        } else if (viewMode === 'week') {
            newDate.setDate(currentDate.getDate() + 7);
        } else {
            newDate.setDate(currentDate.getDate() + 1);
        }
        setCurrentDate(newDate);
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'initial': 'Inicial',
            'follow_up': 'Retorno',
            'emergency': 'Emergência',
            'in_person': 'Presencial',
            'online': 'Online'
        };
        return types[type] || type;
    };

    const renderMonthView = () => {
        const days = getDaysInMonth(currentDate);
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        return (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Headers dos dias - nome completo em telas maiores, abreviado em mobile */}
                {weekDays.map((day, index) => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-1 sm:py-2">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden text-xs">{weekDaysShort[index]}</span>
                    </div>
                ))}
                {days.map((day, index) => {
                    if (!day) {
                        return <div key={`empty-${index}`} className="min-h-[60px] sm:min-h-[100px] bg-gray-50 rounded" />;
                    }

                    const dayConsultations = getConsultationsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div 
                            key={index}
                            className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border rounded-lg ${
                                isToday ? 'bg-blue-50 border-blue-500' : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            <div className={`text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 ${
                                isToday ? 'text-blue-600' : 'text-gray-700'
                            }`}>
                                {day.getDate()}
                            </div>
                            <div className="space-y-0.5 sm:space-y-1">
                                {/* Em mobile mostra só indicador de quantidade, em telas maiores mostra horários */}
                                <div className="sm:hidden">
                                    {dayConsultations.length > 0 && (
                                        <div className={`text-[10px] px-1 py-0.5 rounded text-center ${
                                            dayConsultations.some(c => c.status !== 'completed')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {dayConsultations.length}
                                        </div>
                                    )}
                                </div>
                                <div className="hidden sm:block">
                                    {dayConsultations.slice(0, 2).map(consultation => (
                                        <button
                                            key={consultation.id}
                                            onClick={() => handleConsultationClick(consultation)}
                                            className={`w-full text-left text-xs px-1 py-0.5 rounded truncate hover:opacity-80 transition ${
                                                consultation.status === 'completed' 
                                                    ? 'bg-gray-200 text-gray-700 line-through' 
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                            title={`${formatTime(consultation.date)} - ${consultation.patientName || 'Paciente'} - ${consultation.status === 'completed' ? 'Realizada' : 'Agendada'} - Clique para editar`}
                                        >
                                            {formatTime(consultation.date)}
                                        </button>
                                    ))}
                                    {dayConsultations.length > 2 && (
                                        <div className="text-xs text-gray-500">
                                            +{dayConsultations.length - 2} mais
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderWeekView = () => {
        const days = getWeekDays(currentDate);
        const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const weekDaysShort = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

        return (
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days.map((day, index) => {
                    const dayConsultations = getConsultationsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div key={index} className="space-y-1 sm:space-y-2">
                            <div className={`text-center p-1 sm:p-2 rounded ${
                                isToday ? 'bg-blue-500 text-white' : 'bg-gray-100'
                            }`}>
                                <div className="text-[10px] sm:text-xs">
                                    <span className="hidden sm:inline">{weekDays[day.getDay()]}</span>
                                    <span className="sm:hidden">{weekDaysShort[day.getDay()]}</span>
                                </div>
                                <div className="text-sm sm:text-lg font-bold">{day.getDate()}</div>
                            </div>
                            <div className="space-y-1 sm:space-y-2 min-h-[200px] sm:min-h-[400px] overflow-y-auto">
                                {dayConsultations.map(consultation => (
                                    <button
                                        key={consultation.id}
                                        onClick={() => handleConsultationClick(consultation)}
                                        className={`w-full text-left p-1 sm:p-2 border rounded text-[10px] sm:text-xs hover:opacity-80 transition ${
                                            consultation.status === 'completed'
                                                ? 'bg-gray-50 border-gray-300'
                                                : 'bg-green-50 border-green-200'
                                        }`}
                                        title="Clique para editar"
                                    >
                                        <div className={`font-semibold ${
                                            consultation.status === 'completed' ? 'text-gray-600 line-through' : 'text-green-800'
                                        }`}>
                                            {formatTime(consultation.date)}
                                        </div>
                                        <div className="text-gray-700 truncate">
                                            {consultation.patientName || 'Paciente'}
                                        </div>
                                        <div className="text-gray-500 hidden sm:block">
                                            {consultation.duration}min
                                        </div>
                                        {consultation.status === 'completed' && (
                                            <div className="text-[10px] text-gray-600 mt-0.5 sm:mt-1">Realizada</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderDayView = () => {
        const dayConsultations = getConsultationsForDate(currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="space-y-2 sm:space-y-4">
                <div className="text-center text-base sm:text-xl font-bold text-gray-800">
                    {currentDate.toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div className="space-y-2 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                    {dayConsultations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                            Nenhuma consulta agendada para este dia
                        </div>
                    ) : (
                        dayConsultations.map(consultation => (
                            <button
                                key={consultation.id}
                                onClick={() => handleConsultationClick(consultation)}
                                className={`w-full text-left p-3 sm:p-4 border rounded-lg hover:shadow-md transition ${
                                    consultation.status === 'completed'
                                        ? 'bg-gray-50 border-gray-300 hover:border-gray-400'
                                        : 'bg-white border-gray-200 hover:border-blue-300'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                                            <span className={`font-semibold text-sm sm:text-base ${
                                                consultation.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-800'
                                            }`}>
                                                {formatTime(consultation.date)}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-500">
                                                ({consultation.duration} min)
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
                                            <span className="text-sm sm:text-base text-gray-700 truncate">
                                                {consultation.patientName || 'Paciente não identificado'}
                                            </span>
                                        </div>
                                        <div className="flex gap-1 sm:gap-2 flex-wrap">
                                            <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 px-2 py-0.5 sm:py-1 rounded">
                                                {getTypeLabel(consultation.type)}
                                            </span>
                                            <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded ${
                                                consultation.status === 'completed'
                                                    ? 'bg-gray-200 text-gray-700'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {consultation.status === 'completed' ? 'Realizada' : 'Agendada'}
                                            </span>
                                        </div>
                                        {consultation.notes && (
                                            <div className="mt-2 text-xs sm:text-sm text-gray-600">
                                                <strong>Observações:</strong> {consultation.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-b">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                            <span className="hidden sm:inline">Calendário de Consultas</span>
                            <span className="sm:hidden">Consultas</span>
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition"
                        title="Fechar calendário"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </button>
                </div>

                {/* Controls */}
                <div className="p-2 sm:p-4 border-b bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
                        {/* Navegação de data */}
                        <div className="flex items-center justify-between sm:justify-start gap-2">
                            <button
                                onClick={navigatePrevious}
                                className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0"
                                title="Período anterior"
                            >
                                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                            <div className="text-sm sm:text-lg font-semibold min-w-[140px] sm:min-w-[200px] text-center flex-1 sm:flex-initial">
                                {viewMode === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                {viewMode === 'week' && (
                                    <>
                                        <span className="hidden sm:inline">
                                            Semana de {getWeekDays(currentDate)[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                        <span className="sm:hidden">
                                            {getWeekDays(currentDate)[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </>
                                )}
                                {viewMode === 'day' && currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                            <button
                                onClick={navigateNext}
                                className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0"
                                title="Próximo período"
                            >
                                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </button>
                        </div>

                        {/* Botões de visualização */}
                        <div className="flex gap-1 sm:gap-2 justify-between sm:justify-start">
                            <button
                                onClick={() => setViewMode('day')}
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-base ${
                                    viewMode === 'day' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Dia
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-base ${
                                    viewMode === 'week' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Semana
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-base ${
                                    viewMode === 'month' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                Mês
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition text-xs sm:text-base"
                            >
                                Hoje
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500 text-sm sm:text-base">Carregando consultas...</div>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'month' && renderMonthView()}
                            {viewMode === 'week' && renderWeekView()}
                            {viewMode === 'day' && renderDayView()}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
                        <div>
                            Total: <strong>{consultations.length}</strong>
                            <span className="hidden sm:inline"> consultas</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-xs sm:text-sm"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <EditConsultationModal
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                consultation={selectedConsultation}
                onUpdate={handleUpdateConsultation}
            />
        </div>
    );
}
