"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_ROUTE = "/dashboard";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(DEFAULT_ROUTE);
  }, [router]);

  return (
    <main className="min-h-screen bg-atmosphere px-6 py-16">
      <div className="mx-auto w-full max-w-3xl text-ink-700">
        <div className="text-base font-semibold text-ink-900">Redirigiendo al dashboard...</div>
      </div>
    </main>
  );
}
