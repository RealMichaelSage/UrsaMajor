import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ursa-major.ru"),
  title: "АПУВИР 'Большая Медведица' — Ассоциация профессиональных участников венчурного и инвестиционного рынка",
  description:
    "Равный доступ к лучшим инвестиционным проектам и сделкам. Вместе создаем и поддерживаем общие стандарты инвестиционного рынка России.",
  keywords: [
    "венчурные инвестиции",
    "бизнес-ангелы",
    "Большая Медведица",
    "СОБА",
    "стартапы",
    "инвестиционные клубы",
    "синдикаты",
  ],
  authors: [{ name: "АПУВИР Большая Медведица" }],
  icons: {
    icon: "/assets/ursa-major-logo.svg",
    apple: "/assets/ursa-major-logo.svg",
  },
  openGraph: {
    title: "АПУВИР 'Большая Медведица' — Ассоциация венчурного рынка",
    description: "Равный доступ к лучшим инвестиционным проектам и сделкам.",
    url: "https://ursa-major.ru",
    siteName: "Большая Медведица",
    images: [
      {
        url: "/assets/ursa-major-logo.svg",
        width: 800,
        height: 600,
      },
    ],
    locale: "ru_RU",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="scroll-smooth">
      <body className="bg-white text-[#111111] antialiased selection:bg-[#f8173f] selection:text-white">
        {children}
      </body>
    </html>
  );
}
