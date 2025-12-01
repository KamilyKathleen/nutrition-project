'use client'

import Image from "next/image";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner-faq.webp";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Mesa from "@/app/img/mesa.webp"

export default function FAQ() {

  const itemClasses = {
    title: "text-lg font-bold text-petroleumGreen",
    trigger: "px-2 py-4 flex items-center justify-between",
    indicator: "text-petroleumGreen text-2xl",
    content: "p-2",
  };

  return (
    <>
      <Breadcrumb
        image={Banner}
        title="Dúvidas Frequentes"
        page="Perguntas Frequentes"
      />

      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 p-4">
          <div className='w-[90%] md:w-[80%] mx-auto space-y-8 my-6'>
            <h2 className="uppercase text-3xl text-center text-petroleumGreen font-bold">Entenda como o Nutriplan funciona</h2>
            <p className="text-lg md:text-justify leading-relaxed">Nesta página você encontra respostas para as principais dúvidas sobre o funcionamento do Nutriplan. Explicamos como conectar-se com seu nutricionista, agendar consultas, acessar planos alimentares e utilizar todos os recursos da plataforma.</p>
            <p className="text-lg md:text-justify leading-relaxed">Nosso objetivo é oferecer uma experiência simples e prática para conectar pacientes e nutricionistas. Aqui você descobre como tirar o máximo proveito das ferramentas disponíveis, garantindo um acompanhamento nutricional completo e eficiente.</p>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className='w-full'>
            <Image src={Mesa} alt="Placeholder" className="bg-cover" />
          </div>
        </div>
      </div>

      <div className="bg-iceWhite">
        <div className="w-[90%] mx-auto py-4 space-y-8">
          <h2 className="uppercase text-3xl text-center text-petroleumGreen font-bold">Perguntas Frequentes</h2>
          <div className="max-w-[750px] m-auto">
            <Accordion
              variant="light"
              className="w-full max-w-[800px] mx-auto space-y-4"
              itemClasses={itemClasses}
            >
              <AccordionItem
                key="1"
                aria-label="Accordion 1"
                title="1. Como me conecto com um nutricionista?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Para se conectar com um nutricionista no Nutriplan, você precisa receber um convite dele dentro da própria plataforma. Quando o nutricionista te adiciona como paciente, o convite aparece automaticamente no seu dashboard. Basta acessar sua conta e aceitá-lo. Uma vez aceito, você poderá visualizar consultas agendadas, acessar planos alimentares criados pelo profissional e acompanhar seu atendimento nutricional completo.
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Accordion 2"
                title="2. Como funcionam as consultas?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Seu nutricionista agenda as consultas através do sistema. Você pode visualizar todas as suas consultas próximas no dashboard, incluindo data e horário. Após a realização da consulta, o nutricionista marca como concluída no sistema, e ela deixa de aparecer nas suas consultas pendentes. O histórico completo fica disponível para ambos.
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Accordion 3"
                title="3. Como acesso meu plano alimentar?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Seu nutricionista cria planos alimentares personalizados para você através da plataforma. No dashboard, você encontra a seção "Plano Ativo" onde pode visualizar seu plano atual com todas as refeições e orientações do profissional para seu atendimento nutricional.
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Accordion 4"
                title="4. O que encontro no blog?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                O blog do Nutriplan oferece artigos sobre nutrição, receitas saudáveis e dicas de alimentação publicados por nutricionistas. É um espaço para você se informar, descobrir novas receitas e aprender mais sobre alimentação equilibrada. Todo o conteúdo é criado por profissionais da área para garantir informações de qualidade.
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
