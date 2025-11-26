"use client";

import { useState, useEffect } from "react";
import { FaBars, FaTimes, FaInstagram, FaGlobe } from "react-icons/fa";
import Image from "next/image";
import Logo from "@/public/logo.png";
import Link from "next/link";

export default function Header() {

    const [isLargeScreen, setIsLargeScreen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [color, setColor] = useState(false);

    // Checks if the screen is large or small 
    useEffect(() => {
        const checkScreenSize = () => {
            setIsLargeScreen(window.innerWidth > 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => window.removeEventListener("resize", checkScreenSize);
    }, []);

    // Opens and closes the hamburguer menu on small screens
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Changes header color depending on y axis of the screen
    const changeColor = () => {
        if (window.scrollY >= 150) {
            setColor(true);
        } else {
            setColor(false);
        }
    }

    // Checks the user's scrolling of the window
    useEffect(() => {
        window.addEventListener('scroll', changeColor);
        return () => window.removeEventListener('scroll', changeColor);
    }, []);

    // Large screen's header
    const HeaderLarge = () => (
        <nav className={color ? 'fixed z-20 w-full text-coalGray bg-iceWhite shadow-md' : 'fixed z-20 w-full text-white'}>
            <div className="mx-auto flex items-center justify-between py-4 w-[90%]">
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="flex flex-col items-center"
                    >
                        <Image
                            src={Logo}
                            className="w-20"
                            alt="Logo"
                        />
                    </Link>
                </div>
                <ul className="flex gap-4 mx-auto font-bold text-xl">
                    <li className="hover:border-b-2 hover:border-mintGreen">
                        <Link
                            href="/"
                            className="px-3 py-2"
                        >
                            Home
                        </Link>
                    </li>
                    <li className="hover:border-b-2 hover:border-mintGreen">
                        <Link
                            href='/pages/frequentlyAsked'
                            className="px-3 py-2"
                        >
                            Perguntas Frequentes
                        </Link>
                    </li>
                    <li className="hover:border-b-2 hover:border-mintGreen">
                        <Link
                            href='/pages/dashboard'
                            className="px-3 py-2"
                        >
                            Dashboard
                        </Link>
                    </li>
                    <li className="hover:border-b-2 hover:border-mintGreen">
                        <Link
                            href='/pages/blog'
                            className="px-3 py-2"
                        >
                            Blog
                        </Link>
                    </li>
                </ul>
                <div className="flex items-center gap-2">
                    <Link
                        href='/pages/login'
                        className="px-4 py-2 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex items-center justify-center"
                    >
                        Entrar
                    </Link>
                </div>
            </div>
        </nav>
    );

    // Small screen's header
    const HeaderSmall = () => (
        <nav className={`fixed z-20 w-full ${menuOpen ? 'bg-iceWhite' : color ? 'bg-iceWhite shadow-md' : 'text-white'}`}>
            <div className="container mx-auto flex items-center justify-between py-4 w-[90%]">
                <div className="flex items-center">
                    <Link
                        href="/"
                        className="flex flex-col items-center"
                    >
                        <Image
                            src={Logo}
                            className="w-24"
                            alt="Logo"
                        />
                    </Link>
                </div>
                <button onClick={toggleMenu} className="text-2xl hover:bg-mintGreen rounded-full p-2">
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>
            {menuOpen && (
                <div className="bg-iceWhite flex flex-col w-full h-screen mt-10">
                    <ul className="flex flex-col space-y-8 font-bold text-xl text-center">
                        <li>
                            <Link
                                href="/"
                                className="px-3 py-2 text-coalGray hover:border-b-2 hover:border-mintGreen"
                                onClick={toggleMenu}
                            >
                                Home
                            </Link>
                        </li>
                        <hr className="w-[60%] mx-auto text-mintGreen" />
                        <li>
                            <Link
                                href='/pages/frequentlyAsked'
                                className="px-3 py-2 text-coalGray hover:border-b-2 hover:border-mintGreen"
                                onClick={toggleMenu}
                            >
                                Perguntas Frequentes
                            </Link>
                        </li>
                        <hr className="w-[60%] mx-auto text-mintGreen" />
                        <li>
                            <Link
                                href='/pages/dashboard'
                                className="px-3 py-2 text-coalGray hover:border-b-2 hover:border-mintGreen"
                                onClick={toggleMenu}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <hr className="w-[60%] mx-auto text-mintGreen" />
                        <li>
                            <Link
                                href='/pages/blog'
                                className="px-3 py-2 text-coalGray hover:border-b-2 hover:border-mintGreen"
                                onClick={toggleMenu}
                            >
                                Blog
                            </Link>
                        </li>
                        <hr className="w-[60%] mx-auto text-mintGreen" />
                    </ul>
                    <div className="flex items-center gap-2 justify-center mt-8 mr-2">
                        <Link
                            href='/pages/login'
                            className="px-4 py-2 font-semibold bg-mintGreen text-coalGray rounded hover:bg-petroleumGreen hover:text-white transition flex items-center justify-center"
                            onClick={toggleMenu}
                        >
                            Entrar
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );

    // Returns correct header depending on screen size
    return (
        <>
            {isLargeScreen ? <HeaderLarge /> : <HeaderSmall />}
        </>
    );
}
