'use client';
import { useState } from 'react';
import { X, Scale, Ruler, Activity } from 'lucide-react';
import { Patient } from './types';

interface AnthropometricEvaluationModalProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient;
    onSuccess: () => void;
}

interface AnthropometricData {
    height: number | '';
    weight: number | '';
    waistCircumference: number | '';
    hipCircumference: number | '';
    bodyFatPercentage: number | '';
    muscleMass: number | '';
    observations: string;
}

export default function AnthropometricEvaluationModal({ 
    isOpen, 
    onClose, 
    patient,
    onSuccess 
}: AnthropometricEvaluationModalProps) {
    
    const [formData, setFormData] = useState<AnthropometricData>({
        height: '',
        weight: '',
        waistCircumference: '',
        hipCircumference: '',
        bodyFatPercentage: '',
        muscleMass: '',
        observations: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calcular IMC automaticamente
    const calculateBMI = () => {
        if (formData.height && formData.weight) {
            const heightInMeters = Number(formData.height) / 100;
            const bmi = Number(formData.weight) / (heightInMeters * heightInMeters);
            return bmi.toFixed(2);
        }
        return '-';
    };

    // Classificação do IMC
    const getBMIClassification = (bmi: string) => {
        const bmiValue = parseFloat(bmi);
        if (isNaN(bmiValue)) return '';
        if (bmiValue < 18.5) return 'Abaixo do peso';
        if (bmiValue < 25) return 'Peso normal';
        if (bmiValue < 30) return 'Sobrepeso';
        if (bmiValue < 35) return 'Obesidade Grau I';
        if (bmiValue < 40) return 'Obesidade Grau II';
        return 'Obesidade Grau III';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : parseFloat(value) || value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validação básica
        if (!formData.height || !formData.weight) {
            setError('Altura e peso são obrigatórios');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // TODO: Integrar com API
            console.log('📊 Dados da avaliação:', {
                patientId: patient.id,
                anthropometricData: {
                    height: Number(formData.height),
                    weight: Number(formData.weight),
                    waistCircumference: formData.waistCircumference ? Number(formData.waistCircumference) : undefined,
                    hipCircumference: formData.hipCircumference ? Number(formData.hipCircumference) : undefined,
                    bodyFatPercentage: formData.bodyFatPercentage ? Number(formData.bodyFatPercentage) : undefined,
                    muscleMass: formData.muscleMass ? Number(formData.muscleMass) : undefined,
                },
                observations: formData.observations
            });

            // Simular sucesso
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            onSuccess();
            onClose();
            
            // Reset form
            setFormData({
                height: '',
                weight: '',
                waistCircumference: '',
                hipCircumference: '',
                bodyFatPercentage: '',
                muscleMass: '',
                observations: ''
            });
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar avaliação');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const bmi = calculateBMI();
    const bmiClass = getBMIClassification(bmi);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-petroleumGreen">Avaliação Antropométrica</h2>
                        <p className="text-sm text-gray-600 mt-1">Paciente: <span className="font-medium">{patient.name}</span></p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700"
                        title="Fechar"
                        aria-label="Fechar modal"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Medidas Básicas */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Ruler className="h-5 w-5 text-mintGreen" />
                            Medidas Básicas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Altura (cm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="height"
                                    value={formData.height}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    max="250"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 170"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Peso (kg) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    max="300"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 70"
                                    required
                                />
                            </div>
                        </div>

                        {/* IMC Calculado */}
                        {bmi !== '-' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">IMC Calculado</p>
                                        <p className="text-2xl font-bold text-blue-600">{bmi}</p>
                                        <p className="text-sm text-gray-600 mt-1">{bmiClass}</p>
                                    </div>
                                    <Scale className="h-12 w-12 text-blue-400" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Circunferências */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-mintGreen" />
                            Circunferências
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cintura (cm)
                                </label>
                                <input
                                    type="number"
                                    name="waistCircumference"
                                    value={formData.waistCircumference}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 80"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Quadril (cm)
                                </label>
                                <input
                                    type="number"
                                    name="hipCircumference"
                                    value={formData.hipCircumference}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 95"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Composição Corporal */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Composição Corporal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Percentual de Gordura (%)
                                </label>
                                <input
                                    type="number"
                                    name="bodyFatPercentage"
                                    value={formData.bodyFatPercentage}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 25"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Massa Muscular (kg)
                                </label>
                                <input
                                    type="number"
                                    name="muscleMass"
                                    value={formData.muscleMass}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen"
                                    placeholder="Ex: 50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observações
                        </label>
                        <textarea
                            name="observations"
                            value={formData.observations}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-mintGreen focus:border-mintGreen resize-none"
                            placeholder="Anotações sobre a avaliação, condições especiais, etc..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-mintGreen text-white rounded-lg hover:bg-petroleumGreen transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
