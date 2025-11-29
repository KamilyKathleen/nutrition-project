'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Weight, Ruler, Activity, FileText, Utensils, TrendingUp } from 'lucide-react';
import { PatientHistory, DashboardPatient, NutritionalAssessment, DietPlan } from './types';
import { nutritionistService } from '../../services/nutritionistService';

interface PatientHistoryModalProps {
    patient: DashboardPatient | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PatientHistoryModal({ patient, isOpen, onClose }: PatientHistoryModalProps) {
    const [history, setHistory] = useState<PatientHistory | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'assessments' | 'plans' | 'overview'>('overview');

    // Carregar histórico quando o modal abre
    useEffect(() => {
        if (isOpen && patient && patient.status === 'linked') {
            loadPatientHistory();
        }
    }, [isOpen, patient]);

    const loadPatientHistory = async () => {
        if (!patient) return;
        
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 [History Modal] Carregando histórico para:', patient.id);
            const patientHistory = await nutritionistService.getPatientHistory(patient.id);
            setHistory(patientHistory);
            
        } catch (err: any) {
            console.error('❌ [History Modal] Erro:', err);
            setError(err.message || 'Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const calculateBMI = (weight: number, height: number) => {
        const heightInMeters = height / 100; // Assumindo altura em cm
        const bmi = weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1);
    };

    const getBMICategory = (bmi: number) => {
        if (bmi < 18.5) return { label: 'Baixo peso', color: 'text-blue-600' };
        if (bmi < 25) return { label: 'Peso normal', color: 'text-green-600' };
        if (bmi < 30) return { label: 'Sobrepeso', color: 'text-yellow-600' };
        return { label: 'Obesidade', color: 'text-red-600' };
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                
                {/* Cabeçalho */}
                <div className="bg-blue-600 text-white p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">Histórico Completo</h2>
                        <p className="text-blue-100">{patient.name} • {patient.email}</p>
                    </div>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Abas */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
                            { id: 'assessments', label: 'Avaliações', icon: Activity },
                            { id: 'plans', label: 'Planos Alimentares', icon: Utensils }
                        ].map((tab) => {
                            const IconComponent = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <IconComponent size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Conteúdo */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Carregando histórico...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <FileText className="text-red-600 mr-2" size={20} />
                                <span className="text-red-800">{error}</span>
                                <button 
                                    onClick={loadPatientHistory}
                                    className="ml-auto px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                    Tentar Novamente
                                </button>
                            </div>
                        </div>
                    )}

                    {history && !loading && (
                        <>
                            {/* Visão Geral */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    
                                    {/* Cards de Resumo */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-blue-600 text-sm font-medium">Total Avaliações</p>
                                                    <p className="text-2xl font-bold text-blue-800">{history.assessments.length}</p>
                                                </div>
                                                <Activity className="text-blue-600" size={24} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-green-600 text-sm font-medium">Planos Criados</p>
                                                    <p className="text-2xl font-bold text-green-800">{history.dietPlans.length}</p>
                                                </div>
                                                <Utensils className="text-green-600" size={24} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-purple-600 text-sm font-medium">Planos Ativos</p>
                                                    <p className="text-2xl font-bold text-purple-800">{history.dietPlans.filter(p => p.isActive).length}</p>
                                                </div>
                                                <TrendingUp className="text-purple-600" size={24} />
                                            </div>
                                        </div>
                                        
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-orange-600 text-sm font-medium">Cadastrado em</p>
                                                    <p className="text-sm font-bold text-orange-800">{formatDate(patient.createdAt)}</p>
                                                </div>
                                                <Calendar className="text-orange-600" size={24} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Última Avaliação */}
                                    {history.assessments.length > 0 && (
                                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Última Avaliação</h3>
                                            {(() => {
                                                const lastAssessment = history.assessments.sort((a, b) => 
                                                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                                                )[0];
                                                const bmi = parseFloat(calculateBMI(lastAssessment.weight, lastAssessment.height));
                                                const bmiCategory = getBMICategory(bmi);
                                                
                                                return (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                        <div className="text-center">
                                                            <Weight className="mx-auto mb-2 text-blue-600" size={24} />
                                                            <p className="text-sm text-gray-600">Peso</p>
                                                            <p className="text-xl font-bold text-gray-800">{lastAssessment.weight} kg</p>
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <Ruler className="mx-auto mb-2 text-green-600" size={24} />
                                                            <p className="text-sm text-gray-600">Altura</p>
                                                            <p className="text-xl font-bold text-gray-800">{lastAssessment.height} cm</p>
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <Activity className="mx-auto mb-2 text-purple-600" size={24} />
                                                            <p className="text-sm text-gray-600">IMC</p>
                                                            <p className="text-xl font-bold text-gray-800">{bmi}</p>
                                                            <p className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</p>
                                                        </div>
                                                        
                                                        <div className="text-center">
                                                            <Calendar className="mx-auto mb-2 text-orange-600" size={24} />
                                                            <p className="text-sm text-gray-600">Data</p>
                                                            <p className="text-sm font-bold text-gray-800">{formatDate(lastAssessment.createdAt)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Avaliações */}
                            {activeTab === 'assessments' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Histórico de Avaliações ({history.assessments.length})
                                    </h3>
                                    
                                    {history.assessments.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <Activity className="mx-auto mb-4 text-gray-400" size={48} />
                                            <p className="text-gray-600">Nenhuma avaliação registrada ainda.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.assessments
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((assessment) => {
                                                    const bmi = parseFloat(calculateBMI(assessment.weight, assessment.height));
                                                    const bmiCategory = getBMICategory(bmi);
                                                    
                                                    return (
                                                        <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h4 className="text-lg font-medium text-gray-800">
                                                                    Avaliação de {formatDate(assessment.createdAt)}
                                                                </h4>
                                                                <span className="text-sm text-gray-500">
                                                                    {formatDateTime(assessment.createdAt)}
                                                                </span>
                                                            </div>
                                                            
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Peso</p>
                                                                    <p className="text-lg font-semibold text-gray-800">{assessment.weight} kg</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Altura</p>
                                                                    <p className="text-lg font-semibold text-gray-800">{assessment.height} cm</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-600">IMC</p>
                                                                    <p className="text-lg font-semibold text-gray-800">{bmi}</p>
                                                                    <p className={`text-xs ${bmiCategory.color}`}>{bmiCategory.label}</p>
                                                                </div>
                                                                {assessment.bodyFat && (
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">% Gordura</p>
                                                                        <p className="text-lg font-semibold text-gray-800">{assessment.bodyFat}%</p>
                                                                    </div>
                                                                )}
                                                                {assessment.muscleMass && (
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">Massa Muscular</p>
                                                                        <p className="text-lg font-semibold text-gray-800">{assessment.muscleMass} kg</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            {assessment.notes && (
                                                                <div className="bg-gray-50 p-3 rounded">
                                                                    <p className="text-sm text-gray-600 mb-1">Observações:</p>
                                                                    <p className="text-gray-800">{assessment.notes}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Planos Alimentares */}
                            {activeTab === 'plans' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Planos Alimentares ({history.dietPlans.length})
                                    </h3>
                                    
                                    {history.dietPlans.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <Utensils className="mx-auto mb-4 text-gray-400" size={48} />
                                            <p className="text-gray-600">Nenhum plano alimentar criado ainda.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {history.dietPlans
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((plan) => (
                                                    <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="text-lg font-medium text-gray-800 mb-1">{plan.title}</h4>
                                                                {plan.description && (
                                                                    <p className="text-gray-600">{plan.description}</p>
                                                                )}
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                                plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {plan.isActive ? 'Ativo' : 'Inativo'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-600">Data de Início</p>
                                                                <p className="font-medium text-gray-800">{formatDate(plan.startDate)}</p>
                                                            </div>
                                                            {plan.endDate && (
                                                                <div>
                                                                    <p className="text-gray-600">Data de Fim</p>
                                                                    <p className="font-medium text-gray-800">{formatDate(plan.endDate)}</p>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-gray-600">Criado em</p>
                                                                <p className="font-medium text-gray-800">{formatDate(plan.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}