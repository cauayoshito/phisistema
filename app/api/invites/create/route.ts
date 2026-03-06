import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CreateInviteBody = {
  organizationId?: string;
  email?: string;
  role?: "ORG_ADMIN" | "ORG_MEMBER";
  expiresInDays?: number;
};

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

function isEmail(value: string): boolean {
  // validação leve (sem exagero)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  try {
    let body: CreateInviteBody;
    try {
      body = (await request.json()) as CreateInviteBody;
    } catch (error) {
      return NextResponse.json(
        { error: "Body JSON invalido.", details: error },
        { status: 400 }
      );
    }

    const organizationId = String(body.organizationId ?? "").trim();
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const role = body.role ?? "ORG_MEMBER";
    const expiresInDays = Number.isFinite(body.expiresInDays)
      ? Number(body.expiresInDays)
      : 7;

    if (!organizationId || !email) {
      return NextResponse.json(
        { error: "Campos obrigatorios: organizationId, email." },
        { status: 400 }
      );
    }

    if (!isUuid(organizationId)) {
      return NextResponse.json(
        { error: "organizationId invalido (UUID esperado)." },
        { status: 400 }
      );
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: "Email invalido." }, { status: 400 });
    }

    if (role !== "ORG_ADMIN" && role !== "ORG_MEMBER") {
      return NextResponse.json(
        { error: "role invalido. Use ORG_ADMIN ou ORG_MEMBER." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(expiresInDays) ||
      expiresInDays < 1 ||
      expiresInDays > 90
    ) {
      return NextResponse.json(
        { error: "expiresInDays invalido. Use inteiro entre 1 e 90." },
        { status: 400 }
      );
    }

    // IMPORTANT: route handler client deve persistir cookies (refresh de sessão)
    const supabase = createRouteHandlerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
    }

    // Não faz SELECT em organization_memberships (pode falhar por RLS).
    // A permissão é validada dentro da RPC create_org_invite (phi_is_org_admin).
    const { data, error } = await supabase.rpc(
      "create_org_invite" as never,
      {
        p_organization_id: organizationId,
        p_email: email,
        p_role: role,
        p_expires_in_days: expiresInDays,
      } as never
    );

    if (error) {
      const message = error.message ?? "Erro desconhecido";
      const lower = message.toLowerCase();

      if (lower.includes("not authenticated")) {
        return NextResponse.json(
          { error: "Nao autenticado.", details: message },
          { status: 401 }
        );
      }

      if (lower.includes("not allowed")) {
        return NextResponse.json(
          { error: "Sem permissao para criar convite.", details: message },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Falha ao criar convite.", details: message },
        { status: 500 }
      );
    }

    const payload = Array.isArray(data) ? data[0] : data;
    if (!payload) {
      return NextResponse.json(
        { error: "RPC create_org_invite retornou vazio." },
        { status: 500 }
      );
    }

    const token = String(payload.token);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "")
      .trim()
      .replace(/\/$/, "");
    const acceptUrl = appUrl
      ? `${appUrl}/accept-invite?token=${encodeURIComponent(token)}`
      : `/accept-invite?token=${encodeURIComponent(token)}`;

    return NextResponse.json(
      {
        inviteId: payload.invite_id,
        token,
        expiresAt: payload.expires_at,
        acceptUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro interno ao criar convite.",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
