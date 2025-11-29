'use client';

import { useState, useEffect } from "react";
import { Patient } from "./types";
import OverviewCards from "./OverviewCards";
import PatientList from "./PatientList";
import QuickActions from "./QuickActions";
import AddPatientModal from './AddPatientModal'; // Importando o novo modal
import NewEvaluationModal from "./NewEvaluationModal";
import CreatePlanModal from "./CreatePlanModal";
import InvitePatientModal from "./InvitePatientModal";

export default function NutritionistDashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [isCreatePlanModalOpen, setCreatePlanModalOpen] = useState(false);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [sentInvites, setSentInvites] = useState<any[]>([]);
    const scheduledAppointments = 0; // No futuro, virá da API
    
    // Buscar pacientes da API
    const fetchPatients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/patients', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('📋 Pacientes carregados:', data.data);
                setPatients(data.data || []);
            } else {
                console.error('❌ Erro ao carregar pacientes:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar pacientes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtra os pacientes com base no termo de busca (nome ou email)
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleAddPatient = (newPatient: Patient) => {
        setPatients(prevPatients => [newPatient, ...prevPatients]);
        setSelectedPatient(newPatient); // Seleciona o paciente recém-adicionado
    };

    const handleSelectPatient = (patient: Patient) => {
        // Se o paciente clicado já estiver selecionado, deselecione-o. Caso contrário, selecione-o.
        setSelectedPatient(prevSelected => 
            prevSelected?.id === patient.id ? null : patient
        );
    };

    // Carregar dados iniciais
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchPatients(),
                fetchSentInvites()
            ]);
        };

        loadInitialData();
    }, []);

    // Buscar convites enviados
    const fetchSentInvites = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8000/api/patients/invites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSentInvites(data.data || []);
            }
        } catch (error) {
            console.error('Erro ao buscar convites enviados:', error);
        }
    };

    // Cancelar convite
    const handleCancelInvite = async (inviteId: string) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8000/api/patients/invite/${inviteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                alert('Convite cancelado com sucesso!');
                // Remover da lista
                setSentInvites(prev => prev.filter(invite => invite.id !== inviteId));
            } else {
                const error = await response.json();
                alert('Erro ao cancelar convite: ' + error.message);
            }
        } catch (error) {
            console.error('Erro ao cancelar convite:', error);
            alert('Erro ao cancelar convite. Tente novamente.');
        }
    };
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Visão Geral</h1>
                    <p className="text-gray-600">Bem-vindo de volta, Dr(a).! Aqui está um resumo da sua atividade.</p>
                </div>
                <button 
                    onClick={fetchPatients}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                    <span>🔄</span>
                    <span>{loading ? 'Atualizando...' : 'Atualizar Lista'}</span>
                </button>
            </div>
            
            <OverviewCards totalPatients={patients.length} scheduledAppointments={scheduledAppointments} />
            
            {selectedPatient && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-gray-600">Ações para:</p>
                    <h3 className="text-lg font-bold text-blue-800">{selectedPatient.name}</h3>
                </div>
            )}

            <QuickActions 
                onInviteClick={() => setInviteModalOpen(true)} 
                onNewEvaluationClick={() => setEvaluationModalOpen(true)}
                onCreatePlanClick={() => setCreatePlanModalOpen(true)}
                isPatientSelected={!!selectedPatient} 
            />
            
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Carregando pacientes...</p>
                </div>
            ) : (
                <PatientList patients={filteredPatients} searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedPatient={selectedPatient} onSelectPatient={handleSelectPatient} />
            )}

            {/* Convites Enviados */}
            {sentInvites.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-4">
                        Convites Enviados ({sentInvites.length})
                    </h3>
                    
                    <div className="space-y-3">
                        {sentInvites.map((invite) => (
                            <div key={invite.id} className="bg-white rounded-lg p-4 border border-yellow-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-gray-800">
                                            {invite.patientEmail}
                                            {invite.patientName && ` (${invite.patientName})`}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Status: <span className={`capitalize ${invite.status === 'pending' ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                {invite.status === 'pending' ? 'Pendente' : invite.status}
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enviado em: {new Date(invite.sentAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {invite.status === 'pending' && (
                                            <button 
                                                onClick={() => handleCancelInvite(invite.id)}
                                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-4">
                        <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            + Enviar Novo Convite
                        </button>
                    </div>
                </div>
            )}

            <AddPatientModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddPatient={handleAddPatient}
            />
            <NewEvaluationModal
                isOpen={isEvaluationModalOpen}
                onClose={() => setEvaluationModalOpen(false)}
                patient={selectedPatient}
            />
            <CreatePlanModal
                isOpen={isCreatePlanModalOpen}
                onClose={() => setCreatePlanModalOpen(false)}
                patient={selectedPatient}
            />
            <InvitePatientModal
                isOpen={isInviteModalOpen}
                onClose={() => setInviteModalOpen(false)}
                onInviteSent={fetchSentInvites}
            />
        </div>
    );
}