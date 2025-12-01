'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, User } from 'lucide-react';

interface DietPlan {
    _id: string;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    nutritionist?: {
        name: string;
    };
    createdAt: string;
    updatedAt: string;
}

export default function PlanHistoryView() {
    const [plans, setPlans] = useState<DietPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlanHistory();
    }, []);

    const fetchPlanHistory = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Token não encontrado');
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diet-plans/my-plans`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar histórico de planos');
            }

            const result = await response.json();
            const plansData = result.data || [];
            
            // Ordenar por data mais recente primeiro
            const sorted = plansData.sort((a: DietPlan, b: DietPlan) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setPlans(sorted);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            setError('Não foi possível carregar o histórico de planos alimentares');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">Carregando histórico...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Planos Alimentares</h2>
                <p className="text-gray-600">Nenhum plano alimentar encontrado.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Planos Alimentares</h2>
            <p className="text-gray-600 mb-6">
                Total de planos: {plans.length} | Ativo: {plans.filter(p => p.isActive).length}
            </p>

            <div className="space-y-4">
                {plans.map((plan) => (
                    <div 
                        key={plan._id}
                        className={`border rounded-lg p-4 ${
                            plan.isActive 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-300 bg-gray-50'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {plan.name}
                                    </h3>
                                    {plan.isActive && (
                                        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                                            Ativo
                                        </span>
                                    )}
                                </div>

                                {plan.description && (
                                    <p className="text-gray-600 mb-3">{plan.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    {plan.nutritionist && (
                                        <div className="flex items-center gap-1">
                                            <User size={16} />
                                            <span>{plan.nutritionist.name}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>Criado em {formatDate(plan.createdAt)}</span>
                                    </div>

                                    {plan.startDate && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>Início: {formatDate(plan.startDate)}</span>
                                        </div>
                                    )}

                                    {plan.endDate && (
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            <span>Fim: {formatDate(plan.endDate)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
