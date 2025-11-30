'use client';

import { useState, useEffect } from "react";
import { Patient } from "../shared/types";
import OverviewCards from "./components/OverviewCards";
import PatientList from "./components/PatientList";
import QuickActions from "./components/QuickActions";
import AddPatientModal from './modals/AddPatientModal';
import NewEvaluationModal from "./modals/NewEvaluationModal";
import CreatePlanModal from "./modals/CreatePlanModal";
import ScheduleAppointmentModal from "./modals/ScheduleAppointmentModal";
import ConsultationsCalendarModal from "./modals/ConsultationsCalendarModal";
import PatientHistoryModal from "./modals/PatientHistoryModal";
import EditPatientModal from "./modals/EditPatientModal";

export default function NutritionistDashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEvaluationModalOpen, setEvaluationModalOpen] = useState(false);
    const [isCreatePlanModalOpen, setCreatePlanModalOpen] = useState(false);
    const [isScheduleAppointmentModalOpen, setScheduleAppointmentModalOpen] = useState(false);
    const [isCalendarModalOpen, setCalendarModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [scheduledAppointments, setScheduledAppointments] = useState(0);
    
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

    // Buscar consultas agendadas (futuras)
    const fetchScheduledAppointments = async () => {
        console.log('🔵 fetchScheduledAppointments INICIOU');
        try {
            const token = localStorage.getItem('authToken');
            console.log('🔑 Token:', token ? 'existe' : 'NÃO EXISTE');
            
            const now = new Date();
            console.log('📅 Data atual:', now);
            
            const response = await fetch('http://localhost:8000/api/consultations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📅 DADOS COMPLETOS da API:', JSON.stringify(data, null, 2));
                console.log('📅 Consultas carregadas (todas):', data.data);
                console.log('📅 Número de consultas:', data.data?.length || 0);
                
                // Filtrar consultas FUTURAS agendadas (a partir de hoje)
                const scheduledConsultations = (data.data || []).filter((consultation: any) => {
                    const consultationDate = new Date(consultation.date);
                    const isFuture = consultationDate >= now;
                    const isScheduled = consultation.status === 'scheduled' || consultation.status === 'rescheduled';
                    
                    console.log('Verificando consulta:', {
                        date: consultation.date,
                        parsed: consultationDate,
                        status: consultation.status,
                        isFuture,
                        isScheduled,
                        willInclude: isFuture && isScheduled
                    });
                    
                    return isFuture && isScheduled;
                });
                
                console.log('📅 Consultas futuras agendadas:', scheduledConsultations);
                console.log('📊 Total de consultas agendadas:', scheduledConsultations.length);
                
                setScheduledAppointments(scheduledConsultations.length);
                console.log('✅ Estado atualizado! scheduledAppointments =', scheduledConsultations.length);
            } else {
                console.error('❌ Erro ao carregar consultas:', response.status);
            }
        } catch (error) {
            console.error('❌ Erro ao buscar consultas:', error);
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

    // Carregar pacientes ao montar o componente
    useEffect(() => {
        fetchPatients();
        fetchScheduledAppointments();
    }, []);

    // Auto-refresh a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            fetchPatients();
            fetchScheduledAppointments();
        }, 30000); // 30 segundos

        return () => clearInterval(interval); // Limpar ao desmontar
    }, []);

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
            
            <OverviewCards 
                totalPatients={patients.length} 
                scheduledAppointments={scheduledAppointments}
                onScheduledAppointmentsClick={() => setCalendarModalOpen(true)}
            />
            
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
                onScheduleAppointmentClick={() => setScheduleAppointmentModalOpen(true)}
                isPatientSelected={!!selectedPatient} 
            />
            
            {loading ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">Carregando pacientes...</p>
                </div>
            ) : (
                <PatientList 
                    patients={filteredPatients} 
                    searchTerm={searchTerm} 
                    onSearchChange={setSearchTerm} 
                    selectedPatient={selectedPatient} 
                    onSelectPatient={handleSelectPatient}
                    onViewHistory={(patient) => {
                        setSelectedPatient(patient);
                        setHistoryModalOpen(true);
                    }}
                    onEditPatient={(patient) => {
                        setSelectedPatient(patient);
                        setEditModalOpen(true);
                    }}
                />
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
            <ScheduleAppointmentModal
                isOpen={isScheduleAppointmentModalOpen}
                onClose={() => {
                    setScheduleAppointmentModalOpen(false);
                    fetchScheduledAppointments(); // Atualizar contagem
                }}
                patient={selectedPatient}
            />
            <ConsultationsCalendarModal
                isOpen={isCalendarModalOpen}
                onClose={() => setCalendarModalOpen(false)}
            />
            <PatientHistoryModal
                patient={selectedPatient}
                isOpen={isHistoryModalOpen}
                onClose={() => setHistoryModalOpen(false)}
            />
            <EditPatientModal
                patient={selectedPatient!}
                isOpen={isEditModalOpen}
                onClose={() => setEditModalOpen(false)}
                onUpdate={fetchPatients}
            />
        </div>
    );
}