import { Users, Calendar, Clock } from "lucide-react";
import DashboardCard from "./DashboardCard";

interface OverviewCardsProps {
    totalPatients: number;
    scheduledAppointments: number;
}

export default function OverviewCards({ totalPatients, scheduledAppointments }: OverviewCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Total de Pacientes" value={totalPatients} icon={Users} />
            <DashboardCard title="Consultas Agendadas (Mês)" value={scheduledAppointments} icon={Calendar} />
            <DashboardCard title="Atividades de Hoje" value={0} icon={Clock} />
        </div>
    );
}