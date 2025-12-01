'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Assessment {
    id: string;
    anthropometricData: {
        weight: number;
        height: number;
        bmi?: number;
        bodyFatPercentage?: number;
        waistCircumference?: number;
        hipCircumference?: number;
        muscleMass?: number;
    };
    createdAt: string;
}

interface ChartData {
    data: string;
    peso: number;
    imc?: number;
}

export default function ProgressView() {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMetrics] = useState({
        peso: true,
        imc: true
    });

    useEffect(() => {
        fetchAssessments();
    }, []);

    useEffect(() => {
        if (assessments.length > 0) {
            processChartData();
        }
    }, [assessments]);

    const fetchAssessments = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setError('Token não encontrado');
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nutritional-assessments/my-assessments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar avaliações');
            }

            const result = await response.json();
            // Backend retorna { success, message, data }
            const assessmentsData = result.data || result;
            
            // Ordenar por data mais antiga primeiro para o gráfico
            const sorted = assessmentsData.sort((a: Assessment, b: Assessment) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setAssessments(sorted);
        } catch (err) {
            console.error('Erro ao buscar avaliações:', err);
            setError('Não foi possível carregar as avaliações');
        } finally {
            setLoading(false);
        }
    };

    const processChartData = () => {
        const data: ChartData[] = assessments.map(assessment => {
            const date = new Date(assessment.createdAt);
            const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            
            return {
                data: formattedDate,
                peso: assessment.anthropometricData.weight,
                imc: assessment.anthropometricData.bmi
            };
        });

        setChartData(data);
    };

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p className="text-gray-600">Carregando dados de progresso...</p>
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

    if (assessments.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Evolução - Últimas Avaliações</h2>
                <p className="text-gray-600">Nenhuma avaliação encontrada. Aguarde sua primeira avaliação com o nutricionista.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Evolução - Peso e IMC</h2>
            
            {/* Gráfico */}
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        
                        <Line 
                            type="monotone" 
                            dataKey="peso" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="Peso (kg)"
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        
                        <Line 
                            type="monotone" 
                            dataKey="imc" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="IMC"
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Resumo estatístico */}
            {chartData.length > 1 && (
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {chartData[0].peso && chartData[chartData.length - 1].peso && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600">Variação de Peso</p>
                            <p className="text-lg font-bold text-blue-600">
                                {(chartData[chartData.length - 1].peso - chartData[0].peso).toFixed(1)} kg
                            </p>
                        </div>
                    )}
                    
                    {chartData[0].imc && chartData[chartData.length - 1].imc && (
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-600">Variação de IMC</p>
                            <p className="text-lg font-bold text-green-600">
                                {((chartData[chartData.length - 1].imc ?? 0) - (chartData[0].imc ?? 0)).toFixed(1)}
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            <p className="text-xs text-gray-500 mt-4">
                Total de avaliações: {assessments.length} | 
                Período: {new Date(assessments[0].createdAt).toLocaleDateString('pt-BR')} até {new Date(assessments[assessments.length - 1].createdAt).toLocaleDateString('pt-BR')}
            </p>
        </div>
    );
}