'use client'

import { FaInstagram, FaGlobe } from "react-icons/fa";
import Link from 'next/link';
import Image from "next/image";
import Logo from "@/public/logo.png";

export default function Footer() {

    return (
        <footer className="bg-mintGreen text-center py-6 w-full">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mx-auto justify-center items-center py-3">
                    <div className="w-full text-center mb-4 md:mb-0">
                        <Link href="/" className="no-underline">
                            <Image
                                src={Logo}
                                alt="Logo"
                                className="mx-auto w-40"
                            />
                        </Link>
                    </div>
                    <div className="w-full items-center py-6">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/"
                                className="text-xl font-semibold text-petroleumGreen hover:underline"
                            >
                                Home
                            </Link>
                            <Link
                                href='/pages/frequentlyAsked'
                                className="text-xl font-semibold text-petroleumGreen hover:underline"
                            >
                                Perguntas Frequentes
                            </Link>
                            <Link
                                href='/pages/dashboard'
                                className="text-xl font-semibold text-petroleumGreen hover:underline"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href='/pages/blog'
                                className="text-xl font-semibold text-petroleumGreen hover:underline"
                            >
                                Blog
                            </Link>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center">
                        <div className="flex gap-8">
                            <Link
                                href="https://www.instagram.com/nutriunasete?igsh=MWkwMjJzNnh4aHdrcA=="
                                target="_blank"
                                className="px-4 py-2 font-semibold bg-petroleumGreen text-white rounded hover:bg-white hover:text-petroleumGreen transition flex items-center justify-center"
                            >
                                <FaInstagram size={32} />
                                &nbsp; NutriUnaSete
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="w-full mt-4 text-gray-500 pt-4">
                    <p className="text-petroleumGreen font-bold">&copy; {new Date().getFullYear()} NutriPlan Una. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
}
