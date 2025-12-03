'use client';

import Image from "next/image";
import Banner from "@/app/img/banner-home.webp";
import Link from "next/link";
import Card from "@/app/components/card";
import Iogurt from "@/app/img/iogurte.jpg";
import Bolo from "@/app/img/bolo.webp";
import Panqueca from "@/app/img/panqueca.webp";
import { useEffect, useState } from "react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  slug: string;
}

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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Posts padrão caso a API falhe
  const defaultPosts = [
    {
      id: '1',
      title: 'Receita de iogurte com chia e frutas',
      excerpt: 'Uma opção leve e nutritiva para começar o dia com energia e equilíbrio.',
      imageUrl: Iogurt.src,
      slug: 'iogurte-chia-frutas'
    },
    {
      id: '2',
      title: 'Receita de bolo de aveia',
      excerpt: 'Rico em fibras e muito saboroso, ideal para lanches saudáveis ao longo da semana.',
      imageUrl: Bolo.src,
      slug: 'bolo-aveia'
    },
    {
      id: '3',
      title: 'Receita de panqueca de banana',
      excerpt: 'Prática, rápida e sem açúcar refinado — perfeita para uma rotina mais saudável.',
      imageUrl: Panqueca.src,
      slug: 'panqueca-banana'
    }
  ];

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      console.log('🔍 [Home] Buscando posts do blog...');
      console.log('🌐 URL:', `${process.env.NEXT_PUBLIC_API_URL}/blog/public/recent/posts?limit=3`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/public/recent/posts?limit=3`);
      
      console.log('📥 Status:', response.status);
      console.log('📥 OK?:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Result recebido:', result);
        
        // A API retorna { success: true, data: posts[] }
        const data = result.data || result;
        console.log('📦 Data extraído:', data);
        
        // Mapear os dados da API para o formato esperado
        const posts = data.map((post: any) => ({
          id: post._id,
          title: post.title,
          excerpt: post.excerpt || post.content?.substring(0, 150) + '...',
          imageUrl: post.featuredImage || '',
          slug: post.slug
        }));
        
        console.log('📋 Posts mapeados:', posts);
        setBlogPosts(posts);
      } else {
        console.error('❌ Resposta não OK');
        const errorText = await response.text();
        console.error('❌ Erro:', errorText);
        setBlogPosts([]);
      }
    } catch (error: any) {
      console.error('🔥 Erro ao buscar posts:', error);
      console.error('🔥 Stack:', error.stack);
      setBlogPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

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
        <h1 className="w-[90%] mx-auto text-3xl font-bold text-center uppercase my-2">Conecte-se com seu nutricionista e organize sua saúde</h1>

        {/* Section 1 */}
        <div className="w-[90%] mx-auto my-5 flex flex-col md:flex-row items-center">
          <div className="p-4 space-y-4">
            <p className="text-lg md:text-justify leading-relaxed">O Nutriplan conecta você diretamente ao seu nutricionista em uma plataforma integrada. Aceite convites profissionais, acompanhe suas consultas agendadas e acesse seus planos alimentares personalizados em um só lugar.</p>
            <p className="text-lg md:text-justify leading-relaxed">Nossa plataforma facilita a comunicação e o acompanhamento nutricional, permitindo que você visualize seu plano ativo, consulte o histórico de planos anteriores e saiba exatamente quando será sua próxima consulta.</p>
            <p className="text-lg md:text-justify leading-relaxed">Para nutricionistas, oferecemos ferramentas completas de gestão: cadastre pacientes, agende consultas, crie planos alimentares personalizados e compartilhe conteúdo relevante através do blog integrado.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="bg-iceWhite my-10 flex flex-col md:flex-row-reverse items-center">
          <div className="w-[90%] mx-auto p-4 space-y-4 my-8">
            <h2 className="text-2xl font-semibold text-center mb-4">Por que usar o Nutriplan?</h2>
            <p className="text-lg md:text-justify leading-relaxed">Criamos uma ponte digital entre nutricionistas e pacientes, tornando o acompanhamento nutricional mais prático e organizado. Agende consultas, receba convites profissionais e tenha todos os seus planos alimentares sempre à mão.</p>
            <p className="text-lg md:text-justify leading-relaxed">Com dashboard personalizado para pacientes e nutricionistas, calendário de consultas integrado, histórico completo de planos e blog com receitas e dicas, o Nutriplan é a solução completa para gestão nutricional.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto justify-center items-center py-3">
              <div>
                <WhyUsCard
                  title="Gestão de Consultas"
                  description="Agende, visualize e gerencie suas consultas nutricionais em um calendário integrado. Pacientes acompanham a próxima consulta em tempo real, enquanto nutricionistas controlam toda agenda."
                />
              </div>
              <div className="md:border-x md:border-y-transparent border-y border-mintGreen">
                <WhyUsCard
                  title="Planos Personalizados"
                  description="Nutricionistas criam planos alimentares sob medida para cada paciente. Acesse seu plano ativo a qualquer momento e consulte o histórico completo de todas as orientações recebidas."
                />
              </div>
            </div>
            <p className="text-lg text-center italic py-4">&quot;A nutrição adequada começa com um bom acompanhamento profissional.&quot;</p>
            <Link
              href='/pages/frequentlyAsked'
              className="py-3 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex justify-center max-w-[200px] mx-auto"
            >
              Dúvidas Frequentes
            </Link>
          </div>
        </div>

        {/* Section 3 */}
        <div className="w-[90%] mx-auto my-10 space-y-4">
          <h2 className="text-2xl font-semibold text-center mb-4">Receitas do Blog</h2>
          
          {loadingPosts ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Carregando receitas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card
                  key={post.id}
                  image={post.imageUrl || Iogurt}
                  title=""
                  subtitle={post.title}
                  description={post.excerpt}
                  page={`/pages/blog/${post.slug}`}
                  button="Ler mais"
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
