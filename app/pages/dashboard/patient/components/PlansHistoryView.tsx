'use client';

import { useEffect, useState } from 'react';
import { Calendar, FileText } from 'lucide-react';

interface DietPlan {
    _id: string;
    name: string;
    goal: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function PlansHistoryView() {
    const [plans, setPlans] = useState<DietPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Token não encontrado');
                setLoading(false);
                return;
            }

            // Buscar planos diretamente pela nova rota /my-plans
            const plansResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diet-plans/my-plans`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!plansResponse.ok) {
                throw new Error('Erro ao buscar planos');
            }

            const plansData = await plansResponse.json();
            setPlans(plansData.data || []);
        } catch (err: any) {
            console.error('Erro ao buscar planos:', err);
            setError(err.message || 'Não foi possível carregar o histórico de planos');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">Carregando histórico de planos...</p>
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
            <h2 className="text-xl font-bold text-gray-800 mb-6">Histórico de Planos Alimentares</h2>
            
            <div className="space-y-4">
                {plans.map((plan) => (
                    <div 
                        key={plan._id}
                        className={`border rounded-lg p-4 ${plan.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="text-gray-600" size={20} />
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        {plan.name}
                                    </h3>
                                    {plan.isActive && (
                                        <span className="px-2 py-1 text-xs bg-green-500 text-white rounded-full">
                                            Ativo
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Objetivo:</strong> {plan.goal}
                                </p>
                                
                                {plan.description && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        {plan.description}
                                    </p>
                                )}
                                
                                <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        Criado em: {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                    {plan.createdAt !== plan.updatedAt && (
                                        <span className="flex items-center gap-1">
                                            Atualizado em: {new Date(plan.updatedAt).toLocaleDateString('pt-BR')}
                                        </span>
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
