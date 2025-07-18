import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@cloudscape-design/global-styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nova Sonic - Aplicación Web",
  description: "Aplicación web completa con chat, seguimiento de pedidos y calendario de citas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
