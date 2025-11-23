import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Placeholder from "@/app/img/placeholder.webp";
import Banner from "@/app/img/banner.jpeg";
import Link from "next/link";
import Card from "@/app/components/card";

interface WhyUsCardProps {
  title: string;
  description: string;
}

function WhyUsCard({ title, description }: Readonly<WhyUsCardProps>) {
  return (
    <div className="m-4 p-6 text-center flex flex-col h-full max-w-[400px] mx-auto">
      <h3 className="text-lg text-petroleumGreen font-semibold pb-6 uppercase">{title}</h3>
      <p className="text-base">{description}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      {/* Banner */}
      <div className="relative w-full h-[100vh]">
        <Image src={Banner} alt="Banner" className='object-cover' fill priority />
        <div className="absolute inset-0 bg-coalGray/60 z-10">
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center">
            <h1 className="text-white text-4xl md:text-5xl py-4 font-bold uppercase mb-4">Título chamativo</h1>
            <p className="text-white text-2xl py-4">Frase de efeito sobre o propósito do site.</p>
            <p className="text-lg text-white italic py-4">&quot;Frase de efeito&quot;</p>
            <Link
              href='/pages/test'
              className="mt-6 px-12 py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex items-center justify-center"
            >Saiba Mais
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-6 mt-4">
        <h1 className="w-[90%] mx-auto text-3xl font-bold text-center uppercase my-2">Um título longo para o site</h1>

        {/* Section 1 */}
        <div className="w-[90%] mx-auto my-5 flex flex-col md:flex-row items-center">
          <div className="p-4 space-y-4">
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-iceWhite my-10 flex flex-col md:flex-row-reverse items-center">
          <div className="w-[90%] mx-auto p-4 space-y-4 my-8">
            <h2 className="text-2xl font-semibold text-center mb-4">Título da Seção</h2>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mx-auto justify-center items-center py-3">
              <div>
                <WhyUsCard
                  title="Título do Card"
                  description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                />
              </div>
              <div className="md:border-x md:border-y-transparent border-y border-mintGreen">
                <WhyUsCard
                  title="Título do Card"
                  description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                />
              </div>
              <div>
                <WhyUsCard
                  title="Título do Card"
                  description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit."
                />
              </div>
            </div>
            <p className="text-lg text-center italic py-4">&quot;Mini frase de efeito!&quot;</p>
            <Link
              href='/pages/collectionPoints'
              className="py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex justify-center max-w-[200px] mx-auto"
            >
              Botão Importante
            </Link>
          </div>
        </div>

        {/* Section 3 */}
        <div className="w-[90%] mx-auto my-10 space-y-4">
          <h2 className="text-2xl font-semibold text-center mb-4">Páginas do Site</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card
              image={Placeholder}
              title="Nome da"
              subtitle="Página"
              description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
              page="/pages/test"
            />
            <Card
              image={Placeholder}
              title="Nome da"
              subtitle="Página"
              description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
              page="/pages/test"
            />
            <Card
              image={Placeholder}
              title="Nome da"
              subtitle="Página"
              description="Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa."
              page="/pages/test"
            />
          </div>
        </div>

      </div>
    </>
  );
}
