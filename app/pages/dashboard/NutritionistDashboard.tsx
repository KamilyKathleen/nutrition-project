'use client';

import { useState } from "react";
import { Patient } from "./types";
import OverviewCards from "./OverviewCards";
import PatientList from "./PatientList";
import QuickActions from "./QuickActions";
import AddPatientModal from './AddPatientModal'; // Importando o novo modal
import NewEvaluationModal from "./NewEvaluationModal";
import CreatePlanModal from "./CreatePlanModal";

export default function NutritionistDashboard() {
    // No futuro, estes dados virão de uma chamada de API quando o componente carregar.
    // Por enquanto, inicializamos o estado com eles.
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [isCreatePlanModalOpen, setCreatePlanModalOpen] = useState(false);
    const scheduledAppointments = 0; // No futuro, virá da API
    
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
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Visão Geral</h1>
                <p className="text-gray-600">Bem-vindo de volta, Dr(a).! Aqui está um resumo da sua atividade.</p>
            </div>
            
            <OverviewCards totalPatients={patients.length} scheduledAppointments={scheduledAppointments} />
            
            {selectedPatient && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <p className="text-sm text-gray-600">Ações para:</p>
                    <h3 className="text-lg font-bold text-blue-800">{selectedPatient.name}</h3>
                </div>
            )}

            <QuickActions 
                onInviteClick={() => setAddModalOpen(true)} 
                onNewEvaluationClick={() => setEvaluationModalOpen(true)}
                onCreatePlanClick={() => setCreatePlanModalOpen(true)}
                isPatientSelected={!!selectedPatient} 
            />
            
            <PatientList patients={filteredPatients} searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedPatient={selectedPatient} onSelectPatient={handleSelectPatient} />

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
        </div>
    );
}