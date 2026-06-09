"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

const ACCESS_SESSION_KEY = "deporte-cdmx-private-access";

type GateStatus = "checking" | "locked" | "unlocked" | "misconfigured";

const hashPassword = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
};

export default function AccessGate({ children }: { children: ReactNode }) {
  const configuredHash = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD_HASH ?? "";
  const authDisabled = process.env.NEXT_PUBLIC_AUTH_DISABLED === "true";

  const resolveInitialStatus = (): GateStatus => {
    if (process.env.NODE_ENV === "development") {
      return "unlocked";
    }

    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        return "unlocked";
      }
    }

    if (authDisabled || !configuredHash) {
      return "misconfigured";
    }

    return "checking";
  };

  const [status, setStatus] = useState<GateStatus>(resolveInitialStatus);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setStatus("unlocked");
      return;
    }

    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      setStatus("unlocked");
      return;
    }

    if (authDisabled || !configuredHash) {
      setStatus("misconfigured");
      return;
    }

    const savedHash = window.sessionStorage.getItem(ACCESS_SESSION_KEY);
    setStatus(savedHash === configuredHash ? "unlocked" : "locked");
  }, [authDisabled, configuredHash]);

  const helperText = useMemo(() => {
    if (status === "misconfigured") {
      return "Configura DASHBOARD_PASSWORD antes de publicar el sitio para habilitar el acceso privado.";
    }
    return "El acceso se mantiene durante la sesión actual del navegador.";
  }, [status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!configuredHash) {
      setStatus("misconfigured");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const attemptedHash = hashPassword(password.trim());
      if (attemptedHash === configuredHash) {
        window.sessionStorage.setItem(ACCESS_SESSION_KEY, configuredHash);
        setStatus("unlocked");
        setPassword("");
        return;
      }
      setError("La contraseña es incorrecta.");
    } catch (submitError) {
      console.error("[access-gate] no se pudo validar la contraseña", submitError);
      setError("No se pudo validar la contraseña en este navegador.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "unlocked") {
    return <>{children}</>;
  }

  if (status === "checking") {
    return (
      <main className="min-h-screen bg-atmosphere px-6 py-10">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
          <section className="card w-full max-w-2xl p-8 md:p-10">
            <div className="space-y-4">
              <div className="badge">Acceso institucional</div>
              <h1 className="text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">Validando acceso</h1>
              <p className="max-w-xl text-sm leading-7 text-ink-600">
                Comprobando la sesión actual antes de abrir el dashboard.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-atmosphere px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <section className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.15fr_0.85fr]">
          <div className="card flex flex-col justify-between p-8 md:p-10">
            <div className="space-y-5">
              <div className="badge">Acceso institucional</div>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold tracking-tight text-ink-900 md:text-4xl">Acceso privado</h1>
                <p className="max-w-2xl text-sm leading-7 text-ink-600">
                  Este dashboard contiene información territorial y operativa preparada para seguimiento institucional.
                  El acceso está restringido para revisión interna.
                </p>
              </div>
            </div>
            <div className="mt-8 rounded-3xl border border-mist-200 bg-mist-100/70 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Modo de acceso</div>
              <p className="mt-3 text-sm leading-6 text-ink-700">
                {helperText}
              </p>
            </div>
          </div>

          <div className="card p-8 md:p-10">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">Entrada protegida</div>
                <h2 className="mt-3 text-2xl font-semibold text-ink-900">Abrir dashboard</h2>
              </div>

              {status === "misconfigured" ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  La protección privada no está configurada. Define <code>DASHBOARD_PASSWORD</code> y vuelve a ejecutar el
                  build o el servidor local.
                </div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink-800">Contraseña</span>
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Ingresa la contraseña de acceso"
                      autoComplete="current-password"
                      required
                    />
                  </label>

                  {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                  ) : null}

                  <button className="btn-primary w-full" type="submit" disabled={submitting}>
                    {submitting ? "Validando acceso..." : "Entrar"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
