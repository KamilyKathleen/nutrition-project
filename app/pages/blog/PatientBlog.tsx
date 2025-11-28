import Card from "@/app/components/card";
import Iogurt from "@/app/img/iogurte.jpg";
import Bolo from "@/app/img/bolo.webp";
import Panqueca from "@/app/img/panqueca.webp";

export default function PatientBlog() {
    return (
        <div className="w-[90%] mx-auto my-10 space-y-4">
            <h2 className="text-2xl font-semibold text-center mb-4">Mais Acessados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <Card
                    image={Iogurt}
                    title=""
                    subtitle="Receita de iogurte com chia e frutas"
                    description="Uma opção leve e nutritiva para começar o dia com energia e equilíbrio."
                    page="/pages/test"
                    button="Ler mais"
                />
                <Card
                    image={Bolo}
                    title=""
                    subtitle="Receita de bolo de aveia"
                    description="Rico em fibras e muito saboroso, ideal para lanches saudáveis ao longo da semana."
                    page="/pages/test"
                    button="Ler mais"
                />
                <Card
                    image={Panqueca}
                    title=""
                    subtitle="Receita de panqueca de banana"
                    description="Prática, rápida e sem açúcar refinado — perfeita para uma rotina mais saudável."
                    page="/pages/test"
                    button="Ler mais"
                />
            </div>
        </div>
    )
}