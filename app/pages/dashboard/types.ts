export interface Patient {
    id: string;
    name: string;
    email: string;
    lastAppointment: string;
    status: 'Ativo' | 'Inativo';
}

export interface Appointment {
    id: string;
    patientName: string;
    date: string;
    time: string;
}

export type UserRole = 'nutritionist' | 'patient';

export interface User {
    name: string;
    role: UserRole;
}