import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Axison Bayala — Développeur Full Stack & Designer",
  description: "Miguel Axison Bayala, développeur full stack à Ouagadougou. Applications web et mobiles, design d’interfaces, systèmes et réseaux. Découvrez mes projets et mon parcours.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  // Browser extensions can add attributes to <html> before React hydrates.
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
