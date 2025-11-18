import Image from "next/image";
import LoremIpsum from "@/app/components/loremIpsum";
import Breadcrumb from "@/app/components/breadcrumb";
import Banner from "@/app/img/banner.jpeg";

export default function Dashboard() {
    return (
        <div>
            <Breadcrumb
                image={Banner}
                title="Testando o banner no TS"
                page="Dashboard"
            />

            <LoremIpsum/>
        </div>
    )
}