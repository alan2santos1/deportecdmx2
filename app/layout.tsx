import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deporte CDMX",
  description: "Dashboard de inteligencia deportiva para actividad física, infraestructura y salud en la Ciudad de México."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
