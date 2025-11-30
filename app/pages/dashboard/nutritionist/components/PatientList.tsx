import { Patient } from "../../shared/types";
import { Search, Eye, Edit, Clock, AlertCircle } from "lucide-react";

interface PatientListProps {
    readonly patients: Patient[];
    readonly searchTerm: string;
    readonly onSearchChange: (value: string) => void;
    readonly selectedPatient: Patient | null;
    readonly onSelectPatient: (patient: Patient) => void;
    readonly onViewHistory: (patient: Patient) => void;
    readonly onEditPatient: (patient: Patient) => void;
}

// Constantes para controle de expiração de convites
const INVITE_EXPIRATION_DAYS = 7;
const INVITE_URGENT_THRESHOLD_DAYS = 2;

// Função para calcular dias restantes até a expiração
const getDaysUntilExpiration = (inviteDate: string): number => {
    const invite = new Date(inviteDate);
    const expiration = new Date(invite.getTime() + INVITE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((expiration.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return daysLeft;
};

// Função para obter informações de status do paciente
const getPatientStatusInfo = (patient: Patient) => {
    // Se paciente tem userId, está vinculado a uma conta
    if (patient.userId) {
        return {
            label: 'Vinculado',
            color: 'bg-green-100 text-green-800',
            icon: null,
            showExpiration: false,
            daysLeft: 0
        };
    }
    
    // Se existe data de convite, verificar status
    if (patient.inviteDate) {
        const daysLeft = getDaysUntilExpiration(patient.inviteDate);
        
        if (daysLeft <= 0) {
            return {
                label: 'Convite Expirado',
                color: 'bg-red-100 text-red-800',
                icon: <AlertCircle size={14} className="inline mr-1" />,
                showExpiration: false,
                daysLeft: 0
            };
        }
        
        if (daysLeft <= INVITE_URGENT_THRESHOLD_DAYS) {
            return {
                label: 'Convite Pendente',
                color: 'bg-yellow-100 text-yellow-800',
                icon: <Clock size={14} className="inline mr-1 animate-pulse" />,
                showExpiration: true,
                daysLeft
            };
        }
        
        return {
            label: 'Convite Pendente',
            color: 'bg-blue-100 text-blue-800',
            icon: <Clock size={14} className="inline mr-1" />,
            showExpiration: true,
            daysLeft
        };
    }
    
    // Paciente não vinculado sem convite
    return {
        label: 'Não Vinculado',
        color: 'bg-gray-100 text-gray-800',
        icon: null,
        showExpiration: false,
        daysLeft: 0
    };
};

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
                                    {(() => {
                                        const statusInfo = getPatientStatusInfo(patient);
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center ${statusInfo.color}`}>
                                                    {statusInfo.icon}
                                                    {statusInfo.label}
                                                </span>
                                                {statusInfo.showExpiration && statusInfo.daysLeft > 0 && (
                                                    <span className={`text-xs ${statusInfo.daysLeft <= INVITE_URGENT_THRESHOLD_DAYS ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                                                        Expira em {statusInfo.daysLeft} {statusInfo.daysLeft === 1 ? 'dia' : 'dias'}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </td>
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