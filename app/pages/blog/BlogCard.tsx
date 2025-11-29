import { LucideIcon } from "lucide-react";

interface BlogCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    onClick?: () => void;
    isActive?: boolean;
}

export default function BlogCard({ title, value, icon: Icon, onClick, isActive }: BlogCardProps) {
    return (
        <div
            onClick={onClick}
            className={`w-[300px] p-6 rounded-lg shadow-md flex items-center space-x-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg hover:bg-iceWhite' : ''} ${isActive ? 'border-2 border-mintGreen' : 'bg-white'}`}
        >
            <div className="bg-mintGreen p-3 rounded-full">
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-lg font-bold text-petroleumGreen uppercase">{value}</p>
            </div>
        </div>
    );
}