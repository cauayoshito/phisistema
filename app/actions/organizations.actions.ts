"use server";

import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "@/lib/supabase/server";

function enc(v: string) {
  return encodeURIComponent(v);
}

function createAuthedDbClient(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

type PostgrestErr = {
  code?: string;
  message: string;
  details?: string | null;
  hint?: string | null;
};

function logDbError(tag: string, err: PostgrestErr) {
  console.log(tag, {
    code: err.code ?? null,
    message: err.message,
    details: err.details ?? null,
    hint: err.hint ?? null,
  });
}

export async function createOrganizationAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect(
      `/dashboard/organizations?error=${enc(
        "Nome da organização é obrigatório."
      )}`
    );
  }

  const supabase = createClient();

  // ✅ user real (valida no server)
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    redirect(`/login?error=${enc("Sessão expirada. Faça login novamente.")}`);
  }

  // ✅ session/jwt
  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();

  console.log("debug_session:", {
    sessionErr: sessionErr?.message ?? null,
    hasSession: !!session,
    accessTokenLen: session?.access_token?.length ?? 0,
    userId: user.id,
    email: user.email ?? null,
  });

  if (!session?.access_token) {
    redirect(
      `/dashboard/organizations?error=${enc(
        "Sessão sem access_token. Refaça login."
      )}`
    );
  }

  const db = createAuthedDbClient(session.access_token);

  // 🔎 log antes do insert (o que você pediu)
  console.log("debug_auth(app):", {
    uid: user.id,
    role: "authenticated",
  });

  // ✅ gera ID no app (evita depender de RETURNING/SELECT)
  const orgId = crypto.randomUUID();

  // 1) cria org
  const { error: orgError } = await db.from("organizations").insert({
    id: orgId,
    name,
  });

  if (orgError) {
    logDbError("create_org_error:", orgError as any);
    redirect(`/dashboard/organizations?error=${enc(orgError.message)}`);
  }

  // 2) cria membership (idempotente)
  // - se o POST rodar 2x ou se já existir, não explode
  const { error: memberError } = await db
    .from("organization_memberships")
    .upsert(
      {
        organization_id: orgId,
        user_id: user.id,
        role: "ORG_ADMIN",
      } as any,
      {
        onConflict: "organization_id,user_id",
        ignoreDuplicates: true,
      }
    );

  if (memberError) {
    logDbError("create_membership_error:", memberError as any);

    // Se for duplicado (já tinha), ignora e segue
    if ((memberError as any)?.code === "23505") {
      redirect(
        `/dashboard/organizations/${orgId}?success=${enc(
          "Organização criada."
        )}`
      );
    }

    redirect(`/dashboard/organizations?error=${enc(memberError.message)}`);
  }

  redirect(
    `/dashboard/organizations/${orgId}?success=${enc("Organização criada.")}`
  );
}

export async function updateOrganizationAction(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "").trim();
  if (!orgId)
    redirect(`/dashboard/organizations?error=${enc("OrgId inválido.")}`);

  const supabase = createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) redirect(`/login?error=${enc("Sessão expirada.")}`);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect(
      `/dashboard/organizations/${orgId}?error=${enc(
        "Sessão sem access_token. Refaça login."
      )}`
    );
  }

  const db = createAuthedDbClient(session.access_token);

  const payload = {
    name: String(formData.get("name") ?? "").trim() || null,
    responsible_user_id:
      String(formData.get("responsible_user_id") ?? "").trim() || null,
    tax_id_type: String(formData.get("tax_id_type") ?? "").trim() || null,
    document: String(formData.get("tax_id") ?? "").trim() || null,
    legal_name: String(formData.get("legal_name") ?? "").trim() || null,
    foundation_date:
      String(formData.get("foundation_date") ?? "").trim() || null,
    profile_type: String(formData.get("profile_type") ?? "").trim() || null,
    profile_other: String(formData.get("profile_other") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    facebook: String(formData.get("facebook") ?? "").trim() || null,
    instagram: String(formData.get("instagram") ?? "").trim() || null,
    site: String(formData.get("site") ?? "").trim() || null,
    linkedin: String(formData.get("linkedin") ?? "").trim() || null,
    bank_name: String(formData.get("bank_name") ?? "").trim() || null,
    bank_agency: String(formData.get("bank_agency") ?? "").trim() || null,
    bank_account: String(formData.get("bank_account") ?? "").trim() || null,
    pix_key: String(formData.get("pix_key") ?? "").trim() || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await db
    .from("organizations")
    .update(payload)
    .eq("id", orgId);

  if (error) {
    redirect(`/dashboard/organizations/${orgId}?error=${enc(error.message)}`);
  }

  redirect(
    `/dashboard/organizations/${orgId}?success=${enc("Organização salva.")}`
  );
}
