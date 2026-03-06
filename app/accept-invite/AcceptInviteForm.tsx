"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialToken?: string;
};

type AcceptResponse = {
  organizationId?: string;
  role?: string;
  error?: string;
  details?: unknown;
};

export default function AcceptInviteForm({ initialToken = "" }: Props) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const text = await response.text();

      let json: AcceptResponse = {};
      try {
        json = text ? (JSON.parse(text) as AcceptResponse) : {};
      } catch {
        json = {
          error: "Falha ao aceitar convite.",
          details: text,
        };
      }

      if (!response.ok) {
        setError(json.error ?? "Falha ao aceitar convite.");
        return;
      }

      setSuccess("Convite aceito com sucesso. Redirecionando...");
      const organizationId = json.organizationId;
      const url = organizationId ? `/dashboard?org=${encodeURIComponent(organizationId)}` : "/dashboard";
      router.replace(url);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Aceitar convite</h1>
      <p className="mt-1 text-sm text-slate-600">Cole o token do convite para entrar na organizacao.</p>

      <label htmlFor="token" className="mt-4 block text-sm font-medium">
        Token
      </label>
      <input
        id="token"
        name="token"
        type="text"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        className="mt-2 w-full rounded-lg border px-3 py-2"
        placeholder="UUID do convite"
        required
      />

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-emerald-600">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-blue-600 py-2 font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Aceitando..." : "Aceitar convite"}
      </button>
    </form>
  );
}
