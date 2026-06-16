import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Corps de texte : Montserrat
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-sans" });

// Titres : FF Providence Sans (police perso)
const providence = localFont({
  src: "./fonts/ProvidenceSans-Bold.ttf",
  variable: "--font-hand",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trovabello",
  description:
    "Trouvez le domaine idéal pour votre mariage, en France comme en Italie : tarifs, capacité, traiteur et disponibilités, comparés en un coup d’œil.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${montserrat.variable} ${providence.variable} h-full`}
    >
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
