export default function NotFound() {
  return (
    <main className="min-h-screen bg-atmosphere px-6 py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 text-ink-700">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Deporte CDMX</div>
        <h1 className="text-3xl font-semibold text-ink-900 md:text-4xl">Página no encontrada</h1>
        <p className="text-sm text-ink-600">
          La ruta solicitada no existe. Verifica la URL o regresa al dashboard desde la navegación principal.
        </p>
      </div>
    </main>
  );
}
