import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: { template: "%s | Fundación Dibujando Sonrisas", default: "Fundación Dibujando Sonrisas" },
  description:
    "Fundación Dibujando Sonrisas — Brigadas médico-odontológicas en Honduras. Llevando salud, amor y esperanza a las comunidades más vulnerables.",
  icons: {
    icon: [
      { url: "/DS-LOGO.png", type: "image/png" }
    ],
    shortcut: "/DS-LOGO.png",
    apple: "/DS-LOGO.png",
  },
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
