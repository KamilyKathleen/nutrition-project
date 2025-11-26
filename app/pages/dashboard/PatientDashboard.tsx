'use client';

import { useState } from "react";
import { Calendar, Utensils, BarChart3, BookHeart } from "lucide-react";
import DashboardCard from "./DashboardCard";
import ProgressView from "./ProgressView";
import PlanView from "./PlanView";

type PatientView = 'appointments' | 'plan' | 'progress' | 'diary';

const renderContent = (view: PatientView) => {
    if (view === 'progress') return <ProgressView />;
    if (view === 'plan') return <PlanView />;
    // Adicionar outras visualizações aqui
    return <p className="text-center text-gray-500 py-8">Selecione uma opção acima para ver os detalhes.</p>;
}

export default function PatientDashboard() {
    const [activeView, setActiveView] = useState<PatientView>('plan');
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Meu Painel</h1>
                <p className="text-gray-600">Acompanhe seu progresso e mantenha-se no caminho certo!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title="Próxima Consulta" value={"Nenhuma"} icon={Calendar} onClick={() => setActiveView('appointments')} isActive={activeView === 'appointments'} />
                <DashboardCard title="Plano Alimentar Ativo" value={"Ganho de Massa"} icon={Utensils} onClick={() => setActiveView('plan')} isActive={activeView === 'plan'} />
                <DashboardCard title="Ver Progresso" value="Gráficos" icon={BarChart3} onClick={() => setActiveView('progress')} isActive={activeView === 'progress'} />
                <DashboardCard title="Diário Alimentar" value="Anotações" icon={BookHeart} onClick={() => setActiveView('diary')} isActive={activeView === 'diary'} />
            </div>

            {renderContent(activeView)}
        </div>
    );
}