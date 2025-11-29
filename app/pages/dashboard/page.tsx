'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "../../img/banner-dashboard.jpg";
import NutritionistDashboard from "./NutritionistDashboard";
import PatientDashboard from "./PatientDashboard";

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/pages/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-petroleumGreen text-xl">Carregando...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-petroleumGreen text-xl">Redirecionando...</div>
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                image={Banner}
                title={`Bem-vindo(a), ${user.name}!`}
                page="Dashboard"
            />

            <main className="container mx-auto p-4 md:p-8">
                {user.role === 'nutritionist' ? (
                    <NutritionistDashboard />
                ) : (
                    <PatientDashboard />
                )}
            </main>
        </div>
    );
}