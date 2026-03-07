import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type AcceptInviteBody = {
  token?: string;
};

type AcceptOrgInviteRow = {
  organization_id?: string;
  organizationId?: string;
  role?: string;
};

function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}

export async function POST(request: Request) {
  try {
    let body: AcceptInviteBody;

    try {
      body = (await request.json()) as AcceptInviteBody;
    } catch (error) {
      return NextResponse.json(
        { error: "Body JSON inválido.", details: error },
        { status: 400 }
      );
    }

    const token = String(body.token ?? "").trim();

    if (!token) {
      return NextResponse.json(
        { error: "Campo obrigatório: token." },
        { status: 400 }
      );
    }

    if (!isUuid(token)) {
      return NextResponse.json(
        { error: "Token inválido (UUID esperado)." },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient<Database>({ cookies });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const rpcResponse = await supabase.rpc(
      "accept_org_invite" as never,
      {
        p_token: token,
      } as never
    );

    const error = rpcResponse.error;
    const data = rpcResponse.data as
      | AcceptOrgInviteRow
      | AcceptOrgInviteRow[]
      | null;

    if (error) {
      const message = error.message ?? "Erro desconhecido";
      const lower = message.toLowerCase();

      if (lower.includes("not authenticated")) {
        return NextResponse.json(
          { error: "Não autenticado.", details: message },
          { status: 401 }
        );
      }

      if (
        lower.includes("invite email does not match") ||
        lower.includes("invalid invite token") ||
        lower.includes("invite expired") ||
        lower.includes("invite already accepted") ||
        lower.includes("token")
      ) {
        return NextResponse.json(
          { error: "Convite inválido.", details: message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Falha ao aceitar convite.", details: message },
        { status: 500 }
      );
    }

    const payload = Array.isArray(data) ? data[0] : data;

    if (!payload) {
      return NextResponse.json(
        { error: "RPC accept_org_invite retornou vazio." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        organizationId:
          payload.organization_id ?? payload.organizationId ?? null,
        role: payload.role ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[accept-invite] route error:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao aceitar convite.",
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : error,
      },
      { status: 500 }
    );
  }
}
