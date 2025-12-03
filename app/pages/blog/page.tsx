'use client';

import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner-blog.jpeg";
import PatientBlog from "@/app/pages/blog/PatientBlog";
import NutritionistBlog from "@/app/pages/blog/NutritionistBlog";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";

export default function Blog() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div>
                <Breadcrumb
                    image={Banner}
                    title="Artigos e Receitas"
                    page="Blog"
                />
                <main className="container mx-auto p-4 md:p-8">
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-petroleumGreen"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div>
            <Breadcrumb
                image={Banner}
                title="Artigos e Receitas"
                page="Blog"
            />

            <main className="container mx-auto p-4 md:p-8">
                {user ? (
                    // Se usuário está autenticado, mostrar interface baseada na role
                    user.role === 'nutritionist' ? (
                        <NutritionistBlog />
                    ) : (
                        <PatientBlog />
                    )
                ) : (
                    // Se não está autenticado, mostrar apenas posts públicos (como paciente)
                    <PatientBlog />
                )}
            </main>
        </div>
    );
}