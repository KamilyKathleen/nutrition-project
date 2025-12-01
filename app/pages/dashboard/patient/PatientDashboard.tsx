'use client';

import { useState, useEffect } from "react";
import { Calendar, Utensils, AlertCircle } from "lucide-react";
import DashboardCard from "../nutritionist/components/DashboardCard";
import PlanView from "./components/PlanView";
import PendingInvites from "../nutritionist/modals/PendingInvites";
import { inviteService, PatientRelationship } from "@/app/services/inviteService";
import { title } from "process";

type PatientView = 'plan';

const formatNextConsultation = (consultation: any) => {
    if (!consultation) return "Nenhuma";
    
    const consultDate = new Date(consultation.scheduledDate || consultation.date);
    const now = new Date();
    const diffTime = consultDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dateStr = consultDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const timeStr = consultDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    if (diffDays === 0) {
        return `Hoje (${dateStr} às ${timeStr})`;
    } else if (diffDays === 1) {
        return `Amanhã (${dateStr} às ${timeStr})`;
    } else if (diffDays > 1) {
        return `Em ${diffDays} dias (${dateStr} às ${timeStr})`;
    } else {
        return `${dateStr} às ${timeStr}`;
    }
};

const renderContent = (view: PatientView, hasNutritionist: boolean) => {
    if (!hasNutritionist) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                    Aguardando Vínculo com Nutricionista
                </h3>
                <p className="text-gray-500">
                    Para acessar suas informações nutricionais, você precisa aceitar um convite de um nutricionista.
                </p>
            </div>
        );
    }

    if (view === 'plan') return <PlanView />;
    return <p className="text-center text-gray-500 py-8">Selecione uma opção acima para ver os detalhes.</p>;
}

export default function PatientDashboard() {
    const [activeView, setActiveView] = useState<PatientView>('plan');
    const [patientRelationship, setPatientRelationship] = useState<PatientRelationship | null>(null);
    const [nutritionistInfo, setNutritionistInfo] = useState<any>(null);
    const [nextConsultation, setNextConsultation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const checkRelationship = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const relationship = await inviteService.checkPatientRelationship();
            setPatientRelationship(relationship);
            
            if (relationship) {
                try {
                    const nutritionist = await inviteService.getNutritionistInfo();
                    setNutritionistInfo(nutritionist);
                } catch (nutritionistError) {
                    // Silently handle error
                }

                try {
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/consultations/my-upcoming`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.data && data.data.length > 0) {
                            setNextConsultation(data.data[0]);
                        }
                    }
                } catch (consultationError) {
                    // Silently handle error
                }
            }
        } catch (err: any) {
            if (err.message?.includes('404') || err.message?.includes('Nenhum relacionamento')) {
                setPatientRelationship(null);
                setNutritionistInfo(null);
                setError(null);
            } else {
                setError(`Erro ao carregar informações: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkRelationship();
    }, []);

    const handleInviteAccepted = () => {
        checkRelationship();
    };

    const hasNutritionist = !!patientRelationship;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Meu Painel</h1>
                <p className="text-gray-600">
                    {hasNutritionist 
                        ? `Acompanhe seu progresso com ${nutritionistInfo?.name || 'seu nutricionista'}!`
                        : 'Aguarde um convite de um nutricionista para começar!'
                    }
                </p>
            </div>

            {/* Status do Relacionamento */}
            {hasNutritionist && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-green-800">
                                Vinculado com {nutritionistInfo?.name}
                            </h3>
                            <p className="text-green-700 text-sm">
                                {nutritionistInfo?.email} • CRN: {nutritionistInfo?.crn}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Convites Pendentes - só mostra se não tem nutricionista */}
            {!hasNutritionist && (
                <PendingInvites onInviteAccepted={handleInviteAccepted} />
            )}

            {/* Cards do Dashboard - só aparecem após vínculo */}
            {hasNutritionist && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <DashboardCard 
                        title="Próxima Consulta" 
                        value={formatNextConsultation(nextConsultation)} 
                        icon={Calendar} 
                    />
                    <DashboardCard 
                        title="Plano Alimentar Ativo" 
                        value={"Ver Plano"} 
                        icon={Utensils} 
                        onClick={() => setActiveView('plan')} 
                        isActive={activeView === 'plan'} 
                    />
                </div>
            )}

            {renderContent(activeView, hasNutritionist)}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertCircle className="text-red-600 mr-2" size={20} />
                        <span className="text-red-800">{error}</span>
                        <button 
                            onClick={checkRelationship}
                            className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}