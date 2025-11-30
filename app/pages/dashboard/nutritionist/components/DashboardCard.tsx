import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    onClick?: () => void;
    isActive?: boolean;
}

export default function DashboardCard({ title, value, icon: Icon, onClick, isActive }: DashboardCardProps) {
    return (
        <div onClick={onClick} className={`p-6 rounded-lg shadow-md flex items-center space-x-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg hover:bg-gray-50' : ''} ${isActive ? 'bg-blue-50 border border-blue-500' : 'bg-white'}`}>
            <div className="bg-blue-100 p-3 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
        </div>
    );
}