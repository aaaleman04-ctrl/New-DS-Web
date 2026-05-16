import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: {template:"%s | Dibujando Sonrisas", default:"Dibujando Sonrisas"},
  description:
    "Dibujando Sonrisas — Brigadas médico-odontológicas en Honduras. Llevando salud, amor y esperanza a las comunidades más vulnerables.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
