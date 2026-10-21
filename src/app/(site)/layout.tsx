import { seoConfig } from '@/client/config/seo.config'
export const dynamic = 'force-dynamic'
// src/app/(site)/layout.tsx
import type { Metadata, Viewport } from "next";
import "@/app/globals.css";

import { CartProvider } from "@/core/context/CartContext";

import { JsonLd } from "@/core/components/seo/JsonLd";

import { siteConfig } from "@/client/config/site.config";
import { isModuleEnabled } from '@/core/lib/modules'
import PwaProvider from '@/core/pwa/PwaProvider'
import { JsonLd } from '@/core/components/JsonLd'
import { organizationSchema, websiteSchema, localBusinessSchema } from '@/core/lib/seo'
import Header from "@/client/components/Header";
import Footer from "@/client/components/Footer";

export const metadata: Metadata = {
  manifest: isModuleEnabled('pwa') ? '/manifest.webmanifest' : undefined,
  metadataBase: new URL(siteConfig.seo.url),
  title: siteConfig.seo.titulo,               
  description: siteConfig.seo.descricao,       
  authors: [{ name: siteConfig.nome }],        
  keywords: siteConfig.seo.keywords,           
  openGraph: {
    title: siteConfig.seo.titulo,
    description: siteConfig.seo.descricao,
    url: siteConfig.seo.url,                   
    siteName: siteConfig.nome,
    locale: "pt_BR",
    type: "website",
    images: [{
      url: siteConfig.seo.ogImage,            
      width: 1200,
      height: 630,
      alt: siteConfig.seo.titulo,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.nome,
    description: siteConfig.seo.descricao,
    images: [siteConfig.seo.ogImage],
  },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function buildCssVariables(theme: typeof siteConfig.theme): string {
  return `
    :root {
      --color-bg-primary: ${theme.bgPrimary};
      --color-bg-secondary: ${theme.bgSecondary};
      --color-bg-tertiary: ${theme.bgTertiary};
      --color-bg-card: ${theme.bgCard};
      --color-bg-hover: ${theme.bgHover};
      --color-overlay: ${theme.overlay};

      --color-text-primary: ${theme.textPrimary};
      --color-text-secondary: ${theme.textSecondary};
      --color-text-tertiary: ${theme.textTertiary};
      --color-text-muted: ${theme.textMuted};
      --color-text-light: ${theme.textLight};
      --color-text-hero-muted: ${theme.textHeroMuted};

      --color-accent: ${theme.accent};
      --color-accent-hover: ${theme.accentHover};
      --color-accent-light: ${theme.accentLight};

      --color-error: ${theme.error};
      --color-success: ${theme.success};
      --color-info: ${theme.info};

      --color-border: ${theme.border};
      --color-border-light: ${theme.borderLight};

      --color-admin-bg: ${theme.adminBg};
      --color-admin-text: ${theme.adminText};
      --color-admin-border: ${theme.adminBorder};
    }
  `;
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  return (
    <html lang="pt-BR">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: buildCssVariables(siteConfig.theme),
          }}
        />

        <JsonLd data={createOrganizationSchema()} />
        <JsonLd data={createWebsiteSchema()} />
        <JsonLd data={createBusinessSchema()} />
      </head>

      <body
        className="overflow-x-hidden antialiased"
        style={{
          backgroundColor: "var(--color-bg-primary)",
          color: "var(--color-text-primary)",
        }}
      >
        <JsonLd data={organizationSchema()} /><JsonLd data={websiteSchema()} /><JsonLd data={localBusinessSchema()} />
        <PwaProvider enabled={isModuleEnabled('pwa')} />
        <Toaster position="top-right" reverseOrder={false} />

        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />

            <main
              className="w-full flex-1 pt-20"
              style={{
                backgroundColor: "var(--color-bg-primary)",
              }}
            >
              {children}
            </main>
            <Footer businessAddress={seoConfig.identity.verified && seoConfig.identity.address ? [seoConfig.identity.address.streetAddress, seoConfig.identity.address.addressLocality, seoConfig.identity.address.addressRegion, seoConfig.identity.address.postalCode, seoConfig.identity.address.addressCountry].filter(Boolean).join(', ') : null} />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}