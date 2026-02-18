"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import MaterialIcon from "@/components/icons/MaterialIcon";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

const missingSupabaseConfig = !isSupabaseConfigured;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    missingSupabaseConfig
      ? "Configuracao do Supabase ausente. Defina .env.local."
      : null
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError("Configuracao do Supabase ausente. Defina .env.local.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/dashboard");
    } catch (caughtError) {
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Nao foi possivel fazer login.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background-light px-4 py-12 text-text-main dark:bg-background-dark dark:text-white">
      <div className="mx-auto flex w-full max-w-[440px] flex-col gap-4">
        <section className="rounded-xl border border-slate-200 bg-surface-light p-8 shadow-sm dark:border-slate-700/70 dark:bg-surface-dark">
          <header className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MaterialIcon name="dataset" className="text-[28px]" />
            </div>
            <div>
              <p className="text-lg font-semibold leading-tight">
                PHI - Sistema
              </p>
              <p className="text-sm text-text-secondary dark:text-slate-300">
                Entre para acessar sua conta
              </p>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@organizacao.com"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900/30"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Senha
                </label>
                <Link
                  href="#"
                  className="text-sm text-primary hover:text-primary-hover"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Caua2612"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text-main dark:text-slate-300 dark:hover:text-white"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  <MaterialIcon
                    name={showPassword ? "visibility_off" : "visibility"}
                    className="text-[20px]"
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="remember"
                className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary dark:text-slate-300"
              >
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-400 text-primary focus:ring-primary"
                />
                Lembrar-me neste dispositivo
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || missingSupabaseConfig}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MaterialIcon name="login" className="text-[20px]" />
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <footer className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-text-secondary dark:border-slate-700 dark:text-slate-300">
            Precisa de ajuda?{" "}
            <Link href="#" className="text-primary hover:text-primary-hover">
              Fale com o suporte
            </Link>
          </footer>
        </section>

        <p className="text-center text-xs text-text-secondary dark:text-slate-400">
          PHI - Sistema (c) 2026. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
