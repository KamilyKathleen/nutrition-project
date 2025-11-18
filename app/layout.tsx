'use client'

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "./head";
import Header from "@/app/components/header";
import Footer from "@/app/components/footer";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "NutriPlan",
//   description: "Projeto A3 - Una Sete Lagoas",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathName = usePathname();
  const noHeaderFooterRoutes = ["/pages/login"];
  const showHeaderFooter = !noHeaderFooterRoutes.includes(pathName);

  return (
    <html lang="pt-br">
      <Head/>
      <body>
        {showHeaderFooter && <Header/>}
        {children}
        {showHeaderFooter && <Footer/>}
      </body>
    </html>
  );
}
