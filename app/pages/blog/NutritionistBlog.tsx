'use client';
import { useState } from "react";
import { SquarePen, Newspaper, FolderOpen } from "lucide-react";
import BlogCard from "@/app/pages/blog/BlogCard";
import WriteView from "@/app/pages/blog/WriteView";
import ReadView from "@/app/pages/blog/ReadView";
import PatientBlog from "@/app/pages/blog/PatientBlog";

type NutritionistView = 'write' | 'manage' | 'blog';

const renderContent = (view: NutritionistView) => {
    if (view === 'write') return <WriteView />;
    if (view === 'manage') return <ReadView />;
    if (view === 'blog') return <PatientBlog />;
}

export default function NutritionistBlog() {
    const [activeView, setActiveView] = useState<NutritionistView>('blog');

    return (
        <div className="w-[90%] mx-auto my-10 space-y-4">
            <h2 className="uppercase text-3xl text-center text-petroleumGreen font-bold mb-4">Área de Blog</h2>

            <div className="flex justify-center flex-wrap gap-6 mb-8">
                <BlogCard
                    title="Blog"
                    value={"Ver posts publicados"}
                    icon={Newspaper}
                    onClick={() => setActiveView('blog')} 
                    isActive={activeView === 'blog'}
                />
                <BlogCard
                    title="Gerenciar"
                    value={"Meus artigos"}
                    icon={FolderOpen}
                    onClick={() => setActiveView('manage')} 
                    isActive={activeView === 'manage'}
                />
                <BlogCard
                    title="Escrever"
                    value={"Criar novo artigo"}
                    icon={SquarePen}
                    onClick={() => setActiveView('write')} 
                    isActive={activeView === 'write'}
                />
            </div>

            {renderContent(activeView)}
        </div>
    )
}