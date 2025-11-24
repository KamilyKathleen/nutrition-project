import { Patient } from "./types";
import { Search, UserPlus, Eye, Edit, BarChartHorizontal } from "lucide-react";

interface PatientListProps {
    patients: Patient[];
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedPatient: Patient | null;
    onSelectPatient: (patient: Patient) => void;
}

export default function PatientList({ patients, searchTerm, onSearchChange, selectedPatient, onSelectPatient }: PatientListProps) {
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
                        <th className="py-2">Última Consulta</th>
                        <th className="py-2">Status</th>
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
                                <td className="py-3 text-gray-600">{patient.lastAppointment}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        patient.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {patient.status}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button className="text-gray-500 hover:text-blue-600" title="Visualizar Perfil">
                                            <Eye size={20} />
                                        </button>
                                        <button className="text-gray-500 hover:text-green-600" title="Editar Paciente">
                                            <Edit size={20} />
                                        </button>
                                        <button className="text-gray-500 hover:text-purple-600" title="Ver Relatórios">
                                            <BarChartHorizontal size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="text-center py-8 text-gray-500">
                                Nenhum paciente encontrado.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}