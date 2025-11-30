'use client';

import { useState, useEffect } from "react";
import { Calendar, Utensils, BarChart3, BookHeart, UserCheck, AlertCircle } from "lucide-react";
import DashboardCard from "../nutritionist/components/DashboardCard";
import ProgressView from "./components/ProgressView";
import PlanView from "./components/PlanView";
import PendingInvites from "../nutritionist/modals/PendingInvites";
import { inviteService, PatientRelationship } from "@/app/services/inviteService";

type PatientView = 'appointments' | 'plan' | 'progress' | 'diary';

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

    if (view === 'progress') return <ProgressView />;
    if (view === 'plan') return <PlanView />;
    // Adicionar outras visualizações aqui
    return <p className="text-center text-gray-500 py-8">Selecione uma opção acima para ver os detalhes.</p>;
}

export default function PatientDashboard() {
    const [activeView, setActiveView] = useState<PatientView>('plan');
    const [patientRelationship, setPatientRelationship] = useState<PatientRelationship | null>(null);
    const [nutritionistInfo, setNutritionistInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ Verificar relacionamento do paciente
    const checkRelationship = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 [Frontend] Verificando relacionamento...');
            
            // Verificar se paciente tem relacionamento
            const relationship = await inviteService.checkPatientRelationship();
            console.log('📋 [Frontend] Relacionamento:', relationship);
            setPatientRelationship(relationship);
            
            // Se tem relacionamento, buscar dados do nutricionista
            if (relationship) {
                console.log('👩‍⚕️ [Frontend] Buscando dados do nutricionista...');
                const nutritionist = await inviteService.getNutritionistInfo();
                console.log('👩‍⚕️ [Frontend] Nutricionista:', nutritionist);
                setNutritionistInfo(nutritionist);
            }
        } catch (err: any) {
            console.error('❌ [Frontend] Erro ao verificar relacionamento:', err);
            setError(`Erro ao carregar informações do paciente: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkRelationship();
    }, []);

    // 🔄 Quando um convite for aceito
    const handleInviteAccepted = () => {
        // Recarregar dados do relacionamento
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
                        <UserCheck className="text-green-600 mr-2" size={20} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard 
                        title="Próxima Consulta" 
                        value={"Nenhuma"} 
                        icon={Calendar} 
                        onClick={() => setActiveView('appointments')} 
                        isActive={activeView === 'appointments'} 
                    />
                    <DashboardCard 
                        title="Plano Alimentar Ativo" 
                        value={"Ganho de Massa"} 
                        icon={Utensils} 
                        onClick={() => setActiveView('plan')} 
                        isActive={activeView === 'plan'} 
                    />
                    <DashboardCard 
                        title="Ver Progresso" 
                        value="Gráficos" 
                        icon={BarChart3} 
                        onClick={() => setActiveView('progress')} 
                        isActive={activeView === 'progress'} 
                    />
                    <DashboardCard 
                        title="Diário Alimentar" 
                        value="Anotações" 
                        icon={BookHeart} 
                        onClick={() => setActiveView('diary')} 
                        isActive={activeView === 'diary'} 
                    />
                </div>
            )}

            {/* Conteúdo Principal */}
            {renderContent(activeView, hasNutritionist)}

            {/* Error State */}
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