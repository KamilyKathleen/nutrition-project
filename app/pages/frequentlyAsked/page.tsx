'use client'

import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Placeholder from "@/app/img/placeholder.webp";
import Banner from "@/app/img/banner.jpeg";
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
            <p className="text-lg md:text-justify leading-relaxed">Nesta página você encontra respostas para as principais dúvidas sobre o funcionamento do Nutriplan. Explicamos como registrar refeições, acompanhar sua evolução, acessar o plano alimentar criado pelo seu nutricionista e utilizar todos os recursos da plataforma.</p>
            <p className="text-lg md:text-justify leading-relaxed">Nosso objetivo é oferecer uma experiência simples e prática. Aqui você descobre como tirar o máximo proveito das ferramentas disponíveis, garantindo um acompanhamento nutricional completo e eficiente no seu dia a dia.</p>
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
                title="1. Como registro minhas refeições no Nutriplan?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Basta acessar a aba &apos;Refeições&apos; no seu Dashboard, selecionar o tipo de refeição (café da manhã, almoço, jantar ou lanche) e adicionar os alimentos consumidos. Você também pode incluir fotos, quantidades aproximadas e observações para que o nutricionista compreenda melhor sua rotina.
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Accordion 2"
                title="2. Meu nutricionista consegue visualizar tudo o que eu registro?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Sim! Todas as refeições, atividades físicas e atualizações de progresso são enviadas automaticamente para o painel do seu nutricionista. Assim, ele pode acompanhar sua evolução em tempo real e ajustar seu plano alimentar sempre que necessário.
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Accordion 3"
                title="3. Posso acompanhar meu progresso dentro da plataforma?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Claro! O Nutriplan oferece gráficos, metas e relatórios completos sobre seu peso, medidas, evolução das refeições e treino. Você também pode exportar esses dados em PDF ou Excel para consultar quando quiser.
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Accordion 4"
                title="4. Preciso de um nutricionista para usar o Nutriplan?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Você pode utilizar o Nutriplan de forma independente, porém a experiência é muito mais completa quando conectada a um nutricionista. Assim, você recebe orientações personalizadas e um plano alimentar adequado ao seu objetivo.
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
