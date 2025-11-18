import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner.jpeg";

export default function Blog() {
    return (
        <div>
            <Breadcrumb
                image={Banner}
                title="Testando o banner no TS"
                page="Blog"
            />

            <LoremIpsum/>
        </div>
    )
}