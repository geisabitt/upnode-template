import type { Viewport } from "next";

import "@/app/globals.css";

import { CartProvider } from "@/core/context/CartContext";

import { JsonLd } from "@/core/components/seo/JsonLd";

import { siteConfig } from "@/client/config/site.config";
import Header from "@/client/components/Header";
import Footer from "@/client/components/Footer";

import { Toaster } from "react-hot-toast";
import { generatePageMetadata } from "@/core/lib/seo/generate-metadata";
import { createOrganizationSchema, createWebsiteSchema, createBusinessSchema } from "@/core/components/seo/schema";

export const metadata = generatePageMetadata({
  pathname: "/",
});

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

            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}