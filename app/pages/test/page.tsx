import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Placeholder from "@/app/img/placeholder.webp";
import Banner from "@/app/img/banner.jpeg";

export default function Test() {
  return (
    <>
      <Breadcrumb
        image={Banner}
        title="Testando o banner no TS"
        page="Teste"
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
        <div className="w-[90%] mx-auto py-4">
          <LoremIpsum />
        </div>
      </div>
    </>
  );
}
