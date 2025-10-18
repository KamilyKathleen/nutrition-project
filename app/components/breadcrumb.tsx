import Link from "next/link";
import Image from "next/image";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

interface BreadcrumbProps {
    image: string | StaticImport;
    title: string;
    page: string;
}

export default function Breadcrumb({image, title, page} : BreadcrumbProps) {
    return (
        <>
            <div className="relative w-full h-[75vh] mb-4">
                <Image src={image} alt="Banner" className="object-cover" fill priority />
                <div className="absolute inset-0 bg-coalGray/60 z-10">
                    <div className="absolute inset-0 flex flex-col justify-center">
                        <div className="w-[90%] mx-auto text-center">
                            <h1 className="text-white text-4xl md:text-5xl py-4 font-bold uppercase mb-4">{title}</h1>
                            <ul className="text-white text-2xl font-semibold py-4">
                                <li className="inline hover:underline">
                                    <Link href="/">Home</Link>
                                </li>
                                <li className="inline"> / {page}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}