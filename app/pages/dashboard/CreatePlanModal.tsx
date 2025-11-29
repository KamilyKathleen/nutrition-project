'use client';

import { X, Utensils, Plus, Minus, Calculator } from 'lucide-react';
import { Patient } from './types';
import { useState } from 'react';

interface CreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

interface MealFood {
    name: string;
    quantity: number;
    unit: string;
    calories?: number;
    proteins?: number;
    carbohydrates?: number;
    fats?: number;
}

interface Meal {
    type: 'breakfast' | 'morning_snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'evening_snack';
    time: string;
    foods: MealFood[];
    instructions?: string;
}

const MEAL_TYPES = [
    { value: 'breakfast', label: '🍳 Café da Manhã', defaultTime: '07:00' },
    { value: 'morning_snack', label: '🍎 Lanche da Manhã', defaultTime: '09:30' },
    { value: 'lunch', label: '🍽️ Almoço', defaultTime: '12:00' },
    { value: 'afternoon_snack', label: '🥙 Lanche da Tarde', defaultTime: '15:00' },
    { value: 'dinner', label: '🍲 Jantar', defaultTime: '19:00' },
    { value: 'evening_snack', label: '🥛 Ceia', defaultTime: '21:00' }
];

const FOOD_UNITS = ['g', 'ml', 'unidade', 'fatia', 'colher', 'xícara', 'copo', 'porção'];

export default function CreatePlanModal({ isOpen, onClose, patient }: CreatePlanModalProps) {
    const [meals, setMeals] = useState<Meal[]>([
        { type: 'breakfast', time: '07:00', foods: [{ name: '', quantity: 0, unit: 'g' }] },
        { type: 'lunch', time: '12:00', foods: [{ name: '', quantity: 0, unit: 'g' }] },
        { type: 'dinner', time: '19:00', foods: [{ name: '', quantity: 0, unit: 'g' }] }
    ]);

    const [planData, setPlanData] = useState({
        title: '',
        description: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        targetCalories: 2000,
        targetProteins: 120,
        targetCarbohydrates: 250,
        targetFats: 65
    });

    if (!isOpen || !patient) return null;

    const addMeal = () => {
        const availableTypes = MEAL_TYPES.filter(
            type => !meals.find(meal => meal.type === type.value)
        );
        
        if (availableTypes.length > 0) {
            const newMealType = availableTypes[0];
            setMeals([...meals, {
                type: newMealType.value as any,
                time: newMealType.defaultTime,
                foods: [{ name: '', quantity: 0, unit: 'g' }]
            }]);
        }
    };

    const removeMeal = (mealIndex: number) => {
        setMeals(meals.filter((_, index) => index !== mealIndex));
    };

    const addFood = (mealIndex: number) => {
        const updatedMeals = [...meals];
        updatedMeals[mealIndex].foods.push({ name: '', quantity: 0, unit: 'g' });
        setMeals(updatedMeals);
    };

    const removeFood = (mealIndex: number, foodIndex: number) => {
        const updatedMeals = [...meals];
        updatedMeals[mealIndex].foods = updatedMeals[mealIndex].foods.filter((_, index) => index !== foodIndex);
        setMeals(updatedMeals);
    };

    const updateMeal = (mealIndex: number, field: keyof Meal, value: any) => {
        const updatedMeals = [...meals];
        (updatedMeals[mealIndex] as any)[field] = value;
        setMeals(updatedMeals);
    };

    const updateFood = (mealIndex: number, foodIndex: number, field: keyof MealFood, value: any) => {
        const updatedMeals = [...meals];
        (updatedMeals[mealIndex].foods[foodIndex] as any)[field] = value;
        setMeals(updatedMeals);
    };

    const calculateTotalNutrients = () => {
        let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFats = 0;
        
        meals.forEach(meal => {
            meal.foods.forEach(food => {
                totalCal += food.calories || 0;
                totalProt += food.proteins || 0;
                totalCarbs += food.carbohydrates || 0;
                totalFats += food.fats || 0;
            });
        });
        
        return { totalCal, totalProt, totalCarbs, totalFats };
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const dietPlanData = {
            ...planData,
            meals: meals.map(meal => ({
                type: meal.type,
                time: meal.time,
                foods: meal.foods.filter(food => food.name.trim() !== ''),
                instructions: meal.instructions || ''
            })).filter(meal => meal.foods.length > 0)
        };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/diet-plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...dietPlanData,
                    patientId: patient.id
                })
            });
            
            if (response.ok) {
                alert(`Plano alimentar para ${patient.name} criado com sucesso!`);
                onClose();
            } else {
                const error = await response.json();
                alert('Erro ao criar plano: ' + error.message);
            }
        } catch (error) {
            console.error('Erro ao criar plano:', error);
            alert('Erro ao criar plano alimentar. Tente novamente.');
        }
    };

    const { totalCal, totalProt, totalCarbs, totalFats } = calculateTotalNutrients();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-6xl relative max-h-[95vh] overflow-y-auto">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    title="Fechar modal"
                    aria-label="Fechar"
                >
                    <X size={24} />
                </button>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">🍽️ Criar Plano Alimentar Personalizado</h2>
                    <p className="text-gray-600">
                        Paciente: <span className="font-semibold text-blue-600">{patient.name}</span>
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Informações Básicas do Plano */}
                    <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                        <h3 className="text-lg font-semibold text-blue-800">📋 Informações do Plano</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título do Plano *</label>
                                <input 
                                    type="text" 
                                    id="title" 
                                    value={planData.title}
                                    onChange={(e) => setPlanData({...planData, title: e.target.value})}
                                    required 
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Ex: Plano para Hipertrofia - João" 
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                                <input 
                                    type="text" 
                                    id="description" 
                                    value={planData.description}
                                    onChange={(e) => setPlanData({...planData, description: e.target.value})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="Objetivo e orientações gerais" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início *</label>
                                <input 
                                    type="date" 
                                    id="startDate" 
                                    value={planData.startDate}
                                    onChange={(e) => setPlanData({...planData, startDate: e.target.value})}
                                    required 
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim (opcional)</label>
                                <input 
                                    type="date" 
                                    id="endDate" 
                                    value={planData.endDate}
                                    onChange={(e) => setPlanData({...planData, endDate: e.target.value})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Metas Nutricionais */}
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-800 mb-4">🎯 Metas Nutricionais Diárias</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Calorias (kcal) *</label>
                                <input 
                                    type="number" 
                                    min="400" 
                                    max="15000"
                                    value={planData.targetCalories}
                                    onChange={(e) => setPlanData({...planData, targetCalories: Number(e.target.value)})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Proteínas (g) *</label>
                                <input 
                                    type="number" 
                                    min="20" 
                                    max="300"
                                    value={planData.targetProteins}
                                    onChange={(e) => setPlanData({...planData, targetProteins: Number(e.target.value)})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Carboidratos (g) *</label>
                                <input 
                                    type="number" 
                                    min="50" 
                                    max="800"
                                    value={planData.targetCarbohydrates}
                                    onChange={(e) => setPlanData({...planData, targetCarbohydrates: Number(e.target.value)})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gorduras (g) *</label>
                                <input 
                                    type="number" 
                                    min="20" 
                                    max="200"
                                    value={planData.targetFats}
                                    onChange={(e) => setPlanData({...planData, targetFats: Number(e.target.value)})}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resumo Nutricional Calculado */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-purple-800 mb-4">📊 Resumo Nutricional Calculado</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-lg text-purple-600">{totalCal.toFixed(0)}</div>
                                <div className="text-gray-600">kcal calculadas</div>
                                <div className="text-xs text-gray-500">Meta: {planData.targetCalories}</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg text-purple-600">{totalProt.toFixed(1)}g</div>
                                <div className="text-gray-600">Proteínas</div>
                                <div className="text-xs text-gray-500">Meta: {planData.targetProteins}g</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg text-purple-600">{totalCarbs.toFixed(1)}g</div>
                                <div className="text-gray-600">Carboidratos</div>
                                <div className="text-xs text-gray-500">Meta: {planData.targetCarbohydrates}g</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg text-purple-600">{totalFats.toFixed(1)}g</div>
                                <div className="text-gray-600">Gorduras</div>
                                <div className="text-xs text-gray-500">Meta: {planData.targetFats}g</div>
                            </div>
                        </div>
                    </div>

                    {/* Refeições */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-800">🍽️ Refeições do Plano</h3>
                            <button
                                type="button"
                                onClick={addMeal}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 text-sm"
                            >
                                <Plus size={16} />
                                <span>Adicionar Refeição</span>
                            </button>
                        </div>

                        {meals.map((meal, mealIndex) => (
                            <div key={mealIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo de Refeição</label>
                                            <select
                                                value={meal.type}
                                                onChange={(e) => updateMeal(mealIndex, 'type', e.target.value)}
                                                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {MEAL_TYPES.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Horário</label>
                                            <input
                                                type="time"
                                                value={meal.time}
                                                onChange={(e) => updateMeal(mealIndex, 'time', e.target.value)}
                                                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    {meals.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMeal(mealIndex)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                            title="Remover refeição"
                                        >
                                            <Minus size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Alimentos da Refeição */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-700">Alimentos</h4>
                                        <button
                                            type="button"
                                            onClick={() => addFood(mealIndex)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
                                        >
                                            <Plus size={14} />
                                            <span>Alimento</span>
                                        </button>
                                    </div>
                                    
                                    {meal.foods.map((food, foodIndex) => (
                                        <div key={foodIndex} className="grid grid-cols-12 gap-2 items-end">
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    placeholder="Nome do alimento"
                                                    value={food.name}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'name', e.target.value)}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="Qtd"
                                                    value={food.quantity || ''}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'quantity', Number(e.target.value))}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <select
                                                    value={food.unit}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'unit', e.target.value)}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    {FOOD_UNITS.map(unit => (
                                                        <option key={unit} value={unit}>{unit}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    placeholder="kcal"
                                                    value={food.calories || ''}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'calories', Number(e.target.value))}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="prot"
                                                    value={food.proteins || ''}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'proteins', Number(e.target.value))}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="carb"
                                                    value={food.carbohydrates || ''}
                                                    onChange={(e) => updateFood(mealIndex, foodIndex, 'carbohydrates', Number(e.target.value))}
                                                    className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                {meal.foods.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFood(mealIndex, foodIndex)}
                                                        className="w-full p-2 text-red-600 hover:bg-red-50 rounded"
                                                        title="Remover alimento"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Instruções da Refeição */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Instruções de Preparo (opcional)</label>
                                    <textarea
                                        value={meal.instructions || ''}
                                        onChange={(e) => updateMeal(mealIndex, 'instructions', e.target.value)}
                                        rows={2}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Ex: Cozinhar no vapor, temperar com ervas frescas..."
                                    ></textarea>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            * Campos obrigatórios
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                type="button" 
                                onClick={onClose}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                            >
                                <Utensils size={18} />
                                <span>Criar Plano Alimentar</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}