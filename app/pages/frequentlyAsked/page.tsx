'use client'

import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Placeholder from "@/app/img/placeholder.webp";
import Banner from "@/app/img/banner.jpeg";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";

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
        title="Testando o banner no TS"
        page="Perguntas Frequentes"
      />

      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 p-4">
          <div className='w-[90%] md:w-[80%] mx-auto space-y-8 my-6'>
            <h2 className="uppercase text-3xl text-center text-petroleumGreen font-bold">Título sobre o que é feito nessa página</h2>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
            <p className="text-lg md:text-justify leading-relaxed">Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.</p>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className='w-full'>
            <Image src={Placeholder} alt="Placeholder" className="bg-cover" />
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
                title="1. Lorem Ipsum?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="Accordion 2"
                title="2. Lorem Ipsum?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="Accordion 3"
                title="3. Lorem Ipsum?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.
              </AccordionItem>
              <AccordionItem
                key="4"
                aria-label="Accordion 4"
                title="4. Lorem Ipsum?"
                indicator={({ isOpen }) => (isOpen ? <FaAngleUp /> : <FaAngleDown />)}
              >
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim.
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
}
