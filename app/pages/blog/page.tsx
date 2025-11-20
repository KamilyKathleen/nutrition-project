import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner.jpeg";
import Card from "@/app/components/card";
import Placeholder from "@/app/img/placeholder.webp";
import Iogurt from "@/app/img/iogurte.jpg";
import Bolo from "@/app/img/bolo.webp";
import Panqueca from "@/app/img/panqueca.webp";

export default function Blog() {
    return (
        <div>
            <Breadcrumb
                image={Banner}
                title="Artigos"
                page="Blog"
            />

            <div className="w-[90%] mx-auto my-10 space-y-4">
                <h2 className="text-2xl font-semibold text-center mb-4">Mais Acessados</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <Card
                        image={Iogurt}
                        title=""
                        subtitle="Receita de iogurte com chia e frutas"
                        description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
                        page="/pages/test"
                        button="Ler mais"
                    />
                    <Card
                        image={Bolo}
                        title=""
                        subtitle="Receita de bolo de aveia"
                        description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
                        page="/pages/test"
                        button="Ler mais"
                    />
                    <Card
                        image={Panqueca}
                        title=""
                        subtitle="Receita de panqueca de banana"
                        description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
                        page="/pages/test"
                        button="Ler mais"
                    />
                </div>
            </div>
        </div>
    )
}