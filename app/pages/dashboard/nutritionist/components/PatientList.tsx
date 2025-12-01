import { Patient } from "../../shared/types";
import { Search, Eye, Edit } from "lucide-react";

interface PatientListProps {
    readonly patients: Patient[];
    readonly searchTerm: string;
    readonly onSearchChange: (value: string) => void;
    readonly selectedPatient: Patient | null;
    readonly onSelectPatient: (patient: Patient) => void;
    readonly onViewHistory: (patient: Patient) => void;
    readonly onEditPatient: (patient: Patient) => void;
}

export default function PatientList({ patients, searchTerm, onSearchChange, selectedPatient, onSelectPatient, onViewHistory, onEditPatient }: PatientListProps) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-gray-800">Meus Pacientes</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar pacientes..." 
                        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b">
                        <th className="py-2 w-16"></th>
                        <th className="py-2">Nome</th>
                        <th className="py-2">E-mail</th>
                        <th className="py-2 text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.length > 0 ? (
                        patients.map((patient) => (
                            <tr 
                                key={patient.id} 
                                className={`border-b transition-colors cursor-pointer ${
                                    selectedPatient?.id === patient.id 
                                        ? 'bg-blue-100 hover:bg-blue-200' 
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => onSelectPatient(patient)}
                            >
                                <td className="py-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                        {patient.name.charAt(0)}
                                    </div>
                                </td>
                                <td className="py-3 font-medium text-gray-800">{patient.name}</td>
                                <td className="py-3 text-gray-600">{patient.email}</td>
                                <td className="py-3">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button 
                                            className="text-gray-500 hover:text-blue-600 transition-colors" 
                                            title="Ver Histórico do Paciente"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewHistory(patient);
                                            }}
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button 
                                            className="text-gray-500 hover:text-green-600 transition-colors" 
                                            title="Editar Paciente / Enviar Convite"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditPatient(patient);
                                            }}
                                        >
                                            <Edit size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-gray-500">
                                Nenhum paciente encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}