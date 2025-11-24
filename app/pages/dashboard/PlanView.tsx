'use client';

export default function PlanView() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Meu Plano Alimentar: Ganho de Massa</h2>
            
            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg text-blue-700">Café da Manhã (08:00)</h3>
                <p className="text-gray-700">Ovos mexidos (3 unidades) com aveia (30g) e uma banana.</p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg text-blue-700">Almoço (12:30)</h3>
                <p className="text-gray-700">150g de filé de frango grelhado, 200g de batata doce, salada de folhas verdes à vontade.</p>
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-lg text-blue-700">Jantar (19:00)</h3>
                <p className="text-gray-700">150g de salmão assado com brócolis e quinoa (50g).</p>
            </div>
        </div>
    );
}