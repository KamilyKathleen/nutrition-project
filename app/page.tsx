import Image from "next/image";
import Banner from "@/app/img/banner-home.webp";
import Link from "next/link";
import Card from "@/app/components/card";
import Iogurt from "@/app/img/iogurte.jpg";
import Bolo from "@/app/img/bolo.webp";
import Panqueca from "@/app/img/panqueca.webp";

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
            <h1 className="text-white text-4xl md:text-5xl py-4 font-bold uppercase mb-4">Nutriplan</h1>
            <p className="text-white text-2xl py-4">Sua rotina alimentar organizada de forma simples, prática e inteligente.</p>
            <p className="text-lg text-white italic py-4">&quot;Transforme sua alimentação, transforme sua vida.&quot;</p>
            <Link
              href='/pages/register'
              className="mt-6 px-12 py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex items-center justify-center"
            >
              Cadastre-se Já!
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-6 mt-4">
        <h1 className="w-[90%] mx-auto text-3xl font-bold text-center uppercase my-2">Organize sua alimentação de forma prática</h1>

        {/* Section 1 */}
        <div className="w-[90%] mx-auto my-5 flex flex-col md:flex-row items-center">
          <div className="p-4 space-y-4">
            <p className="text-lg md:text-justify leading-relaxed">Cuidar da alimentação não precisa ser complicado. Aqui, você encontra uma forma prática de registrar suas refeições, receber orientações personalizadas e criar uma rotina alimentar equilibrada.</p>
            <p className="text-lg md:text-justify leading-relaxed">Nosso sistema ajuda você a entender melhor seus hábitos diários, facilitando o acompanhamento do que consome e como isso impacta diretamente seus resultados.</p>
            <p className="text-lg md:text-justify leading-relaxed">Com ferramentas intuitivas, você e seu nutricionista podem trabalhar juntos para construir um plano alimentar funcional, adaptado ao seu estilo de vida e aos seus objetivos.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-iceWhite my-10 flex flex-col md:flex-row-reverse items-center">
          <div className="w-[90%] mx-auto p-4 space-y-4 my-8">
            <h2 className="text-2xl font-semibold text-center mb-4">Por que usar o Nutriplan?</h2>
            <p className="text-lg md:text-justify leading-relaxed">Nosso objetivo é tornar o cuidado com a saúde mais acessível e eficiente. Através de recursos completos, você consegue registrar suas refeições, monitorar seus treinos e obter orientações baseadas no seu progresso real.</p>
            <p className="text-lg md:text-justify leading-relaxed">Ao integrar alimentação, exercícios e relatórios automáticos, o Nutriplan proporciona uma visão clara da sua evolução, permitindo ajustes precisos no seu plano alimentar.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mx-auto justify-center items-center py-3">
              <div>
                <WhyUsCard
                  title="Consumo Alimentar"
                  description="Registre suas refeições para que seu nutricionista possa criar um plano de dietas personalizado somente para você!"
                />
              </div>
              <div className="md:border-x md:border-y-transparent border-y border-mintGreen">
                <WhyUsCard
                  title="Exercícios Físicos"
                  description="Registre suas atividades, acompanhe calorias gastas e integre seus treinos ao plano nutricional para resultados mais consistentes."
                />
              </div>
              <div>
                <WhyUsCard
                  title="Acompanhamento de Progresso"
                  description="Acompanhe o seu progresso e exporte seus dados em relatórios PDF ou Excel."
                />
              </div>
            </div>
            <p className="text-lg text-center italic py-4">&quot;Pequenas mudanças diárias geram grandes transformações.&quot;</p>
            <Link
              href='/pages/frequentlyAsked'
              className="py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex justify-center max-w-[200px] mx-auto"
            >
              Conheça os Recursos
            </Link>
          </div>
        </div>

        {/* Section 3 */}
        <div className="w-[90%] mx-auto my-10 space-y-4">
          <h2 className="text-2xl font-semibold text-center mb-4">Receitas do Blog</h2>
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

      </div>
    </>
  );
}
