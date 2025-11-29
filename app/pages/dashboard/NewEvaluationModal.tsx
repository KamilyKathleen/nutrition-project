'use client';

import { X, ClipboardPlus, Calculator, Activity } from 'lucide-react';
import { Patient } from './types';
import { useState, useEffect } from 'react';

interface NewEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
}

export default function NewEvaluationModal({ isOpen, onClose, patient }: NewEvaluationModalProps) {
    const [activeTab, setActiveTab] = useState<'anthropometric' | 'activity' | 'clinical'>('anthropometric');
    
    // Estados para dados antropométricos
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bmi, setBmi] = useState('');
    const [waistCircumference, setWaistCircumference] = useState('');
    const [hipCircumference, setHipCircumference] = useState('');
    const [bodyFatPercentage, setBodyFatPercentage] = useState('');
    const [muscleMass, setMuscleMass] = useState('');
    
    // Estados para dobras cutâneas
    const [tricipital, setTricipital] = useState('');
    const [subescapular, setSubescapular] = useState('');
    const [suprailiac, setSuprailiac] = useState('');
    const [abdominal, setAbdominal] = useState('');
    
    // Estados para atividade física
    const [weeklyFrequency, setWeeklyFrequency] = useState('0');
    const [sedentaryTime, setSedentaryTime] = useState('');
    
    // Estado para observações
    const [observations, setObservations] = useState('');

    // Calcular IMC automaticamente sempre que altura ou peso mudarem
    const calculateBMI = () => {
        const h = Number.parseFloat(height);
        const w = Number.parseFloat(weight);
        if (h > 0 && w > 0) {
            const heightInMeters = h / 100;
            const calculatedBMI = (w / (heightInMeters * heightInMeters)).toFixed(1);
            setBmi(calculatedBMI);
        } else {
            setBmi('');
        }
    };

    // useEffect para cálculo automático do IMC
    useEffect(() => {
        calculateBMI();
    }, [height, weight]);

    if (!isOpen || !patient) return null;

    // Função para resetar todos os campos
    const resetForm = () => {
        setHeight('');
        setWeight('');
        setBmi('');
        setWaistCircumference('');
        setHipCircumference('');
        setBodyFatPercentage('');
        setMuscleMass('');
        setTricipital('');
        setSubescapular('');
        setSuprailiac('');
        setAbdominal('');
        setWeeklyFrequency('0');
        setSedentaryTime('');
        setObservations('');
        setActiveTab('anthropometric');
    };

    // Função personalizada para fechar o modal
    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Estruturar dados usando os estados individuais
        const assessmentData: any = {
            anthropometricData: {
                height: Number.parseFloat(height),
                weight: Number.parseFloat(weight),
                waistCircumference: waistCircumference ? Number.parseFloat(waistCircumference) : undefined,
                hipCircumference: hipCircumference ? Number.parseFloat(hipCircumference) : undefined,
                bodyFatPercentage: bodyFatPercentage ? Number.parseFloat(bodyFatPercentage) : undefined,
                muscleMass: muscleMass ? Number.parseFloat(muscleMass) : undefined,
                skinfoldMeasurements: [
                    { location: 'tricep', measurement: tricipital ? Number.parseFloat(tricipital) : 0 },
                    { location: 'subscapular', measurement: subescapular ? Number.parseFloat(subescapular) : 0 },
                    { location: 'suprailiac', measurement: suprailiac ? Number.parseFloat(suprailiac) : 0 },
                    { location: 'abdominal', measurement: abdominal ? Number.parseFloat(abdominal) : 0 }
                ].filter(item => item.measurement > 0)
            },
            observations: observations || ''
        };

        // Só adicionar physicalActivity se tiver dados válidos
        const weeklyFreq = Number.parseInt(weeklyFrequency) || 0;
        const sedTime = sedentaryTime ? Number.parseInt(sedentaryTime) : 0;
        
        if (weeklyFreq > 0 || sedTime > 0) {
            assessmentData.physicalActivity = {
                weeklyFrequency: weeklyFreq,
                sedentaryTime: sedTime,
                activities: []
            };
        }

        console.log('📊 Dados da avaliação a serem enviados:', assessmentData);

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/nutritional-assessments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...assessmentData,
                    patientId: patient.id
                })
            });
            
            if (response.ok) {
                alert(`Avaliação nutricional de ${patient.name} salva com sucesso!`);
                handleClose(); // Usar a função personalizada que reseta o formulário
            } else {
                const error = await response.json();
                console.error('❌ Erro do servidor:', error);
                alert('Erro ao salvar avaliação: ' + (error.message || JSON.stringify(error)));
            }
        } catch (error) {
            console.error('❌ Erro ao salvar avaliação:', error);
            alert('Erro ao salvar avaliação. Tente novamente.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl relative max-h-[95vh] overflow-y-auto">
                <button 
                    onClick={handleClose} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    title="Fechar modal"
                    aria-label="Fechar"
                >
                    <X size={24} />
                </button>
                
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">🩺 Avaliação Nutricional Completa</h2>
                    <p className="text-gray-600">
                        Paciente: <span className="font-semibold text-blue-600">{patient.name}</span>
                    </p>
                </div>

                {/* Tabs de Navegação */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        type="button"
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'anthropometric'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('anthropometric')}
                    >
                        📏 Antropometria
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'activity'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('activity')}
                    >
                        🏃‍♀️ Atividade Física
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 font-medium text-sm ${
                            activeTab === 'clinical'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('clinical')}
                    >
                        📋 Observações Clínicas
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Aba Antropometria */}
                    {activeTab === 'anthropometric' && (
                        <div className="space-y-6">
                            {/* Medidas Básicas */}
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-blue-800 mb-4">📐 Medidas Básicas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="height" className="block text-sm font-medium text-gray-700">Altura (cm) *</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="50"
                                            max="250"
                                            id="height" 
                                            name="height"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            required 
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            placeholder="Ex: 175 (50-250 cm)" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Peso (kg) *</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="20"
                                            max="300"
                                            id="weight" 
                                            name="weight"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            required 
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            placeholder="Ex: 70.5 (20-300 kg)" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">IMC (calculado automaticamente)</label>
                                        <input 
                                            type="text" 
                                            id="bmi" 
                                            name="bmi"
                                            value={bmi ? `${bmi} kg/m²` : 'Digite altura e peso'}
                                            readOnly 
                                            className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg ${
                                                bmi ? 'bg-blue-50 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-500'
                                            }`} 
                                            placeholder="Calculado automaticamente" 
                                        />
                                        {bmi && (
                                            <div className="text-xs mt-1 text-gray-600">
                                                {Number.parseFloat(bmi) < 18.5 && '📉 Abaixo do peso'}
                                                {Number.parseFloat(bmi) >= 18.5 && Number.parseFloat(bmi) < 25 && '✅ Peso normal'}
                                                {Number.parseFloat(bmi) >= 25 && Number.parseFloat(bmi) < 30 && '⚠️ Sobrepeso'}
                                                {Number.parseFloat(bmi) >= 30 && '🚨 Obesidade'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-end">
                                        <div className="w-full text-center text-xs text-gray-500 py-2">
                                            💡 IMC atualizado automaticamente
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Circunferências */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">📏 Circunferências (cm)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="waistCircumference" className="block text-sm font-medium text-gray-700">Cintura</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="40"
                                            max="200"
                                            id="waistCircumference" 
                                            name="waistCircumference"
                                            value={waistCircumference}
                                            onChange={(e) => setWaistCircumference(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                            placeholder="Ex: 85.0 (40-200 cm)" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="hipCircumference" className="block text-sm font-medium text-gray-700">Quadril</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="40"
                                            max="200"
                                            id="hipCircumference" 
                                            name="hipCircumference"
                                            value={hipCircumference}
                                            onChange={(e) => setHipCircumference(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                            placeholder="Ex: 95.0 (40-200 cm)" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Composição Corporal */}
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4">🧬 Composição Corporal (%)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="bodyFatPercentage" className="block text-sm font-medium text-gray-700">Gordura Corporal</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="3"
                                            max="50"
                                            id="bodyFatPercentage" 
                                            name="bodyFatPercentage"
                                            value={bodyFatPercentage}
                                            onChange={(e) => setBodyFatPercentage(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                            placeholder="Ex: 18.5 (3-50%)" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="muscleMass" className="block text-sm font-medium text-gray-700">Massa Muscular</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            min="20"
                                            max="80"
                                            id="muscleMass" 
                                            name="muscleMass"
                                            value={muscleMass}
                                            onChange={(e) => setMuscleMass(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" 
                                            placeholder="Ex: 45.2 (20-80%)" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dobras Cutâneas */}
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-orange-800 mb-4">📐 Dobras Cutâneas (mm)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label htmlFor="tricipital" className="block text-sm font-medium text-gray-700">Tricipital</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            id="tricipital" 
                                            name="tricipital"
                                            value={tricipital}
                                            onChange={(e) => setTricipital(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                            placeholder="Ex: 12.5" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="subescapular" className="block text-sm font-medium text-gray-700">Subescapular</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            id="subescapular" 
                                            name="subescapular"
                                            value={subescapular}
                                            onChange={(e) => setSubescapular(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                            placeholder="Ex: 15.0" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="suprailiac" className="block text-sm font-medium text-gray-700">Suprailíaca</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            id="suprailiac" 
                                            name="suprailiac"
                                            value={suprailiac}
                                            onChange={(e) => setSuprailiac(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                            placeholder="Ex: 20.0" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="abdominal" className="block text-sm font-medium text-gray-700">Abdominal</label>
                                        <input 
                                            type="number" 
                                            step="0.1" 
                                            id="abdominal" 
                                            name="abdominal"
                                            value={abdominal}
                                            onChange={(e) => setAbdominal(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                                            placeholder="Ex: 22.0" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aba Atividade Física */}
                    {activeTab === 'activity' && (
                        <div className="space-y-6">
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-green-800 mb-4">🏃‍♀️ Perfil de Atividade Física</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="weeklyFrequency" className="block text-sm font-medium text-gray-700">Frequência Semanal (dias)</label>
                                        <select 
                                            id="weeklyFrequency" 
                                            name="weeklyFrequency"
                                            value={weeklyFrequency}
                                            onChange={(e) => setWeeklyFrequency(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="0">Sedentário (0 dias)</option>
                                            <option value="1">1 dia por semana</option>
                                            <option value="2">2 dias por semana</option>
                                            <option value="3">3 dias por semana</option>
                                            <option value="4">4 dias por semana</option>
                                            <option value="5">5 dias por semana</option>
                                            <option value="6">6 dias por semana</option>
                                            <option value="7">Todos os dias</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="sedentaryTime" className="block text-sm font-medium text-gray-700">Tempo Sedentário (horas/dia)</label>
                                        <input 
                                            type="number" 
                                            min="0" 
                                            max="24" 
                                            id="sedentaryTime" 
                                            name="sedentaryTime"
                                            value={sedentaryTime}
                                            onChange={(e) => setSedentaryTime(e.target.value)}
                                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
                                            placeholder="Ex: 8" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Aba Observações Clínicas */}
                    {activeTab === 'clinical' && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="observations" className="block text-sm font-medium text-gray-700">📋 Observações e Anotações Clínicas</label>
                                <textarea 
                                    id="observations" 
                                    name="observations" 
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    rows={8} 
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="• História clínica relevante&#10;• Alergias alimentares&#10;• Medicações em uso&#10;• Exames laboratoriais recentes&#10;• Objetivos nutricionais&#10;• Outras observações importantes..."
                                ></textarea>
                            </div>
                        </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            * Campos obrigatórios
                        </div>
                        <div className="flex space-x-3">
                            <button 
                                type="button" 
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                            >
                                <ClipboardPlus size={18} />
                                <span>Salvar Avaliação Completa</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}