'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dados de exemplo que viriam da API
const progressData = [
    { month: 'Ago', peso: 72.0 },
    { month: 'Set', peso: 70.5 },
    { month: 'Out', peso: 69.3 },
    { month: 'Nov', peso: 68.5 },
];

export default function ProgressView() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Evolução de Peso (Últimos meses)</h2>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={progressData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                            formatter={(value: number) => [`${value} kg`, "Peso"]}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="peso" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}