'use client'

import { FaInstagram, FaGlobe } from "react-icons/fa";
import Link from 'next/link';
import Image from "next/image";
import Logo from "@/public/logoipsum.png";
import LogoWhite from "@/public/logoipsum-white.png";

export default function Footer() {

    return (
        <footer className="bg-mintGreen text-center py-6 mt-8 w-full">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mx-auto justify-center items-center py-3">
                    <div className="w-full text-center mb-4 md:mb-0">
                        <Link href="/" className="no-underline">
                            <Image
                                src={Logo}
                                alt="Logo"
                                className="mx-auto w-60"
                            />
                        </Link>
                    </div>
                    <div className="w-full items-center py-6">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="text-xl text-coalGray hover:underline"
                            >
                                Home
                            </Link>
                            <Link
                                href='/pages/about'
                                className="text-xl text-coalGray hover:underline"
                            >
                                Sobre
                            </Link>
                            <Link
                                href='/pages/collectionPoints'
                                className="text-xl text-coalGray hover:underline"
                            >
                                Pontos de Coleta
                            </Link>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center">
                        <div className="flex gap-8">
                            {/* <a href="https://emile.net.br/" target={"_blank"} className="text-white hover:text-blue-500 hover:bg-white hover:rounded-xl">
                                <FaGlobe size={32} />
                            </a>
                            <a href="https://www.instagram.com/emilereciclagem?igsh=MWdpOTd3cGlkcXM4YQ==" target={"_blank"} className="text-white hover:text-pink-500 hover:bg-white hover:rounded-xl">
                                <FaInstagram size={32} />
                            </a> */}
                            <Link
                                href='/pages/test'
                                className="px-4 py-2 font-semibold bg-white text-petroleumGreen rounded hover:bg-petroleumGreen hover:text-white transition flex items-center justify-center"
                            >
                                Botão Importante
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="w-full mt-4 text-gray-500 pt-4">
                    <p className="text-coalGray">&copy; {new Date().getFullYear()} Site Nutrição. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
