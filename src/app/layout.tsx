import type { Metadata } from "next";
import Script from "next/script";
import "./site.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Miguel Ángel Jamonería · Jamones Ibéricos en Salamanca desde 1988",
  description:
    "Jamones ibéricos de bellota, paletas, lomo, chorizo, salchichón y quesos. Jamonería tradicional del Mercado de Abastos de Salamanca desde 1988. Envío en 24-48 h a la península.",
  openGraph: {
    title: "Miguel Ángel Jamonería · El auténtico sabor de la tradición ibérica",
    description:
      "Jamones ibéricos de bellota y embutidos de Guijuelo. Desde 1988 en el Mercado de Abastos de Salamanca.",
    images: ["/assets/img/jamon-whole.jpg"],
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Script src="/assets/js/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
