import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Header from "@/core/components/Header";
import { CartProvider } from '@/core/context/CartContext';
import { Toaster } from "react-hot-toast";
import Footer from "@/core/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Geicy Crochê | Crochê com Estilo e Elegância",
  description:
    "Peças em crochê feitas à mão com qualidade e sofisticação. Roupas, acessórios e itens para casa sob encomenda. Atendimento para todo o Brasil.",
  authors: [
    {
      name: "Geicy Crochê",
    },
  ],
  keywords: [
    "crochê artesanal",
    "crochê sob encomenda",
    "roupas de crochê",
    "acessórios de crochê",
    "jogo de banheiro crochê",
    "crochê para casa",
    "artesanato em crochê",
    "crochê personalizado",
    "crochê Brasil",
  ],
  openGraph: {
    title: "Geicy Crochê | Crochê com Estilo e Elegância",
    description:
      "Peças exclusivas feitas à mão. Crochê artesanal com elegância e qualidade para todo o Brasil.",
    url: "https://seudominio.com",
    siteName: "Geicy Crochê",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/bg-gc-croche-com-elegancia-e-estilo.png",
        width: 1200,
        height: 630,
        alt: "Crochê artesanal elegante Geicy Crochê",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Geicy Crochê",
    description:
      "Crochê artesanal com estilo e elegância. Peças sob encomenda.",
    images: ["/bg-gc-croche-com-elegancia-e-estilo.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0B0B] text-[#EADCC6] overflow-x-hidden`}
      >
        <Toaster position="top-right" reverseOrder={false} />

        <CartProvider>
          <div className="flex flex-col min-h-screen">

            {/* HEADER */}
            <Header />

            {/* CONTEÚDO */}
            <main className="flex-1 w-full pt-20 bg-black">
              {children}
            </main>

            {/* FOOTER */}
            <Footer />

          </div>
        </CartProvider>
      </body>
    </html>
  );
}