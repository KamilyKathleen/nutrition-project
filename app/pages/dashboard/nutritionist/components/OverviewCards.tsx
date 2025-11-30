import { Users, Calendar } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface OverviewCardsProps {
    readonly totalPatients: number;
    readonly scheduledAppointments: number;
    readonly onScheduledAppointmentsClick?: () => void;
}

export default function OverviewCards({ totalPatients, scheduledAppointments, onScheduledAppointmentsClick }: OverviewCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Total de Pacientes" value={totalPatients} icon={Users} />
            <DashboardCard 
                title="Consultas Agendadas" 
                value={scheduledAppointments} 
                icon={Calendar}
                onClick={onScheduledAppointmentsClick}
            />
        </div>
    );
}