'use client';

import { UserPlus, ClipboardPlus, Utensils, CalendarPlus, BarChart2 } from 'lucide-react';

const ActionButton = ({ icon: Icon, label, onClick, disabled }: { icon: React.ElementType, label: string, onClick?: () => void, disabled?: boolean }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className="flex-1 bg-white p-4 rounded-lg shadow-md transition-all flex flex-col items-center justify-center space-y-2 border disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 hover:enabled:shadow-lg hover:enabled:bg-gray-50"
    >
        <Icon className="h-7 w-7 text-blue-600" />
        <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
    </button>
);

export default function QuickActions({ onInviteClick, onNewEvaluationClick, onCreatePlanClick, isPatientSelected }: { onInviteClick: () => void, onNewEvaluationClick: () => void, onCreatePlanClick: () => void, isPatientSelected: boolean }) {
    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
            <div className="flex flex-wrap gap-4">
                <ActionButton onClick={onInviteClick} icon={UserPlus} label="Convidar Paciente" />
                <ActionButton onClick={onNewEvaluationClick} icon={ClipboardPlus} label="Nova Avaliação" disabled={!isPatientSelected} />
                <ActionButton onClick={onCreatePlanClick} icon={Utensils} label="Criar Plano" disabled={!isPatientSelected} />
                <ActionButton icon={CalendarPlus} label="Agendar Consulta" disabled={!isPatientSelected} />
                <ActionButton icon={BarChart2} label="Gerar Relatório" disabled={!isPatientSelected} />
            </div>
        </div>
    );
}