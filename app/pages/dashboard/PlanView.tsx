'use client';

import { useState, useEffect } from 'react';
import { Utensils, Calendar, Target, AlertCircle, Clock } from 'lucide-react';
import { dietPlanService, DietPlan } from '../../services/dietPlanService';

export default function PlanView() {
    const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadActivePlan = async () => {
        try {
            setLoading(true);
            setError(null);
            const plan = await dietPlanService.getActiveDietPlan();
            setActivePlan(plan);
        } catch (err: any) {
            console.error('Erro ao carregar plano:', err);
            setError('Erro ao carregar plano alimentar');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivePlan();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando plano alimentar...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                    <AlertCircle className="text-red-600 mr-2" size={20} />
                    <span className="text-red-800 font-medium">{error}</span>
                </div>
                <button 
                    onClick={loadActivePlan}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    if (!activePlan) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <Utensils className="mx-auto mb-4 text-yellow-600" size={48} />
                <h3 className="text-xl font-medium text-yellow-800 mb-2">
                    Nenhum Plano Ativo
                </h3>
                <p className="text-yellow-700">
                    Seu nutricionista ainda não criou um plano alimentar para você, ou seu plano atual expirou.
                </p>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-6">
            {/* Cabeçalho do Plano */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{activePlan.title}</h2>
                        {activePlan.description && (
                            <p className="text-gray-600">{activePlan.description}</p>
                        )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        <div className="flex items-center mb-1">
                            <Calendar className="mr-1" size={14} />
                            Início: {formatDate(activePlan.startDate)}
                        </div>
                        {activePlan.endDate && (
                            <div className="flex items-center">
                                <Calendar className="mr-1" size={14} />
                                Fim: {formatDate(activePlan.endDate)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Meta de Calorias */}
                {activePlan.targetCalories && (
                    <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="flex items-center">
                            <Target className="text-blue-600 mr-2" size={18} />
                            <span className="font-medium text-blue-800">
                                Meta Diária: {activePlan.targetCalories} kcal
                            </span>
                        </div>
                    </div>
                )}

                {/* Metas Nutricionais */}
                {(activePlan.targetProteins || activePlan.targetCarbohydrates || activePlan.targetFats) && (
                    <div className="bg-amber-50 p-3 rounded-lg">
                        <h4 className="font-medium text-amber-800 mb-2">Metas Nutricionais:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            {activePlan.targetProteins && (
                                <div className="text-center">
                                    <span className="block font-medium text-amber-800">Proteínas</span>
                                    <span className="text-amber-700">{activePlan.targetProteins}g</span>
                                </div>
                            )}
                            {activePlan.targetCarbohydrates && (
                                <div className="text-center">
                                    <span className="block font-medium text-amber-800">Carboidratos</span>
                                    <span className="text-amber-700">{activePlan.targetCarbohydrates}g</span>
                                </div>
                            )}
                            {activePlan.targetFats && (
                                <div className="text-center">
                                    <span className="block font-medium text-amber-800">Gorduras</span>
                                    <span className="text-amber-700">{activePlan.targetFats}g</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Refeições */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Refeições do Dia</h3>
                
                {activePlan.meals.length === 0 ? (
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                        <p className="text-gray-600">Nenhuma refeição configurada ainda.</p>
                    </div>
                ) : (
                    activePlan.meals.map((meal, index) => {
                        // Traduzir tipo de refeição
                        const mealTypeMap: {[key: string]: string} = {
                            'breakfast': 'Café da Manhã',
                            'morning_snack': 'Lanche da Manhã',
                            'lunch': 'Almoço',
                            'afternoon_snack': 'Lanche da Tarde',
                            'dinner': 'Jantar',
                            'evening_snack': 'Ceia'
                        };
                        
                        const mealName = mealTypeMap[meal.type] || meal.type;
                        
                        return (
                            <div key={meal._id || index} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-semibold text-blue-700 flex items-center">
                                        <Clock className="mr-2" size={18} />
                                        {mealName} 
                                        {meal.time && <span className="text-gray-500 ml-2">({meal.time})</span>}
                                    </h4>
                                </div>

                                <div className="space-y-2">
                                    {meal.foods.map((food, foodIndex) => (
                                        <div key={foodIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <span className="text-gray-700">
                                                {food.name} - {food.quantity} {food.unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}