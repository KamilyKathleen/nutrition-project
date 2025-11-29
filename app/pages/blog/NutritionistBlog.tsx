'use client';
import { useState } from "react";
import { SquarePen, Newspaper } from "lucide-react";
import BlogCard from "@/app/pages/blog/BlogCard";
import WriteView from "@/app/pages/blog/WriteView";
import ReadView from "@/app/pages/blog/ReadView";

type NutritionistView = 'write' | 'read';

const renderContent = (view: NutritionistView) => {
    if (view === 'write') return <WriteView />;
    if (view === 'read') return <ReadView />;
}

export default function NutritionistBlog() {
    const [activeView, setActiveView] = useState<NutritionistView>('read');

    return (
        <div className="w-[90%] mx-auto my-10 space-y-4">
            <h2 className="uppercase text-3xl text-center text-petroleumGreen font-bold mb-4">Área de Blog</h2>

            <div className="flex justify-center flex-wrap gap-6 mb-8">
                <BlogCard
                    title="Ler"
                    value={"Veja os artigos"}
                    icon={Newspaper}
                    onClick={() => setActiveView('read')} isActive={activeView === 'read'}
                />
                <BlogCard
                    title="Escrever"
                    value={"Escreva um artigo"}
                    icon={SquarePen}
                    onClick={() => setActiveView('write')} isActive={activeView === 'write'}
                />
            </div>

            {renderContent(activeView)}
        </div>
    )
}