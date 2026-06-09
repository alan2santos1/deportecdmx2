"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Badge from "./ui/Badge";

const navigationItems = [
  { href: "/operacion", label: "Panorama" },
  { href: "/operacion/profesor", label: "Profesor" },
  { href: "/operacion/asistencia", label: "Asistencia" },
  { href: "/operacion/clases", label: "Clases" },
  { href: "/operacion/admin", label: "Admin" }
];

export default function OperacionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-atmosphere px-6 py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Operación y asistencia</Badge>
            <Badge>Separado del dashboard territorial</Badge>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">Operación</h1>
            <p className="max-w-4xl text-sm leading-7 text-ink-600">
              Módulo operativo para personal, clases, matrícula, asistencia y trazabilidad diaria. Esta capa no altera la
              lógica territorial ni los indicadores institucionales del dashboard principal.
            </p>
          </div>
          <nav className="flex flex-wrap gap-3">
            {navigationItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "tab tab-active" : "tab tab-inactive border border-mist-200"}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
