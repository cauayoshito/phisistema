"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20e%20senha%20sao%20obrigatorios.");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/signup?error=Email%20e%20senha%20sao%20obrigatorios.");
  }
  if (password.length < 6) {
    redirect(
      "/signup?error=Senha%20deve%20ter%20pelo%20menos%206%20caracteres."
    );
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  // MVP: volta para login com aviso
  redirect("/login?success=Cadastro%20criado.%20Faca%20login.");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/forgot-password?error=Informe%20o%20email.");

  const supabase = createClient();
  const origin = headers().get("origin") ?? "";

  // IMPORTANTE: precisa do /auth/callback para trocar o code por sessão cookie
  const redirectTo = `${origin}/auth/callback?next=/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error)
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);

  // Não vaza se o e-mail existe
  redirect(
    "/forgot-password?success=Se%20o%20email%20existir,%20enviamos%20o%20link%20de%20redefinicao."
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!password || password.length < 6) {
    redirect(
      "/reset-password?error=Senha%20deve%20ter%20pelo%20menos%206%20caracteres."
    );
  }
  if (password !== confirm) {
    redirect("/reset-password?error=As%20senhas%20nao%20conferem.");
  }

  const supabase = createClient();

  // garante que a sessão veio do callback
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    redirect(
      "/login?error=Sessao%20invalida.%20Solicite%20a%20redefinicao%20novamente."
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);

  redirect("/login?success=Senha%20atualizada.%20Faca%20login.");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
