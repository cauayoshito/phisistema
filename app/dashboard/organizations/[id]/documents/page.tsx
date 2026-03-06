import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  listOrgDocuments,
  createSignedUrl,
} from "@/services/organization_documents.service";
import {
  uploadOrganizationDocumentAction,
  deleteOrganizationDocumentAction,
} from "@/app/actions/organization-documents.actions";

export const dynamic = "force-dynamic";

// Lista inicial do print (01..10). Você completa depois com o print final da tabela.
const ORG_DOC_TYPES = [
  { code: "01", name: "Estatuto Social em vigor registrado em cartório" },
  { code: "02", name: "Ata da última assembleia de eleição de diretoria" },
  { code: "03", name: "Cartão do CNPJ" },
  { code: "04", name: "RG e CPF do responsável legal" },
  { code: "05", name: "Comprovante de residência do responsável legal" },
  {
    code: "06",
    name: "Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa da União",
  },
  { code: "07", name: "Certificado de regularidade do FGTS" },
  { code: "08", name: "Certidão Negativa de Débitos Trabalhistas" },
  { code: "09", name: "Certidão Negativa de Tributos Estaduais" },
  { code: "10", name: "Certidão Negativa de Tributos Municipais" },
];

function msg(v?: string | string[]) {
  return typeof v === "string" ? decodeURIComponent(v) : null;
}

export default async function OrgDocumentsPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string | string[]; success?: string | string[] };
}) {
  const orgId = params.id;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <p>Sem sessão. Faça login.</p>
        <Link className="underline" href="/login">
          Ir para login
        </Link>
      </div>
    );
  }

  const rows = await listOrgDocuments(orgId);
  const byCode = new Map(rows.map((r) => [r.doc_type_code, r]));

  const error = msg(searchParams?.error);
  const success = msg(searchParams?.success);

  // monta tabela 1:1: sempre mostra linhas fixas (mesmo sem upload)
  const table = await Promise.all(
    ORG_DOC_TYPES.map(async (t) => {
      const r = byCode.get(t.code);
      let viewUrl: string | null = null;
      if (r?.file_path) {
        viewUrl = await createSignedUrl(
          "organization-documents",
          r.file_path,
          300
        ).catch(() => null);
      }
      return { type: t, row: r ?? null, viewUrl };
    })
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Documentos da Organização</h1>
          <p className="text-sm text-slate-600">
            Envie um documento por vez. Selecione o arquivo e clique em enviar.
            Repita para cada documento.
          </p>
        </div>

        <Link
          className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
          href={`/dashboard/organizations/${orgId}`}
        >
          ← Voltar para organização
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">Status da Documentação</div>
            <div className="text-sm text-slate-600">Aberto</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-3 text-left">Documento</th>
                <th className="p-3 text-left">Dt. Envio</th>
                <th className="p-3 text-left">Dt. Validade</th>
                <th className="p-3 text-left">Escolha o Arquivo</th>
                <th className="p-3 text-left">Enviado?</th>
                <th className="p-3 text-left">Visualizar</th>
                <th className="p-3 text-left">Enviar / Salvar</th>
                <th className="p-3 text-left">Excluir</th>
              </tr>
            </thead>

            <tbody>
              {table.map(({ type, row, viewUrl }) => (
                <tr key={type.code} className="border-b">
                  <td className="p-3">
                    <div className="font-semibold">
                      {type.code}. {type.name}
                    </div>
                  </td>

                  <td className="p-3">
                    {row?.sent_at
                      ? new Date(row.sent_at).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>

                  <td className="p-3">
                    <form
                      action={uploadOrganizationDocumentAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="orgId" value={orgId} />
                      <input
                        type="hidden"
                        name="doc_type_code"
                        value={type.code}
                      />
                      <input type="hidden" name="doc_name" value={type.name} />

                      <input
                        name="valid_until"
                        type="date"
                        defaultValue={row?.valid_until ?? ""}
                        className="rounded-lg border px-2 py-1"
                      />
                      {/* file + submit ficam nas colunas ao lado */}
                    </form>
                  </td>

                  <td className="p-3">
                    <form
                      action={uploadOrganizationDocumentAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="orgId" value={orgId} />
                      <input
                        type="hidden"
                        name="doc_type_code"
                        value={type.code}
                      />
                      <input type="hidden" name="doc_name" value={type.name} />
                      <input
                        name="valid_until"
                        type="hidden"
                        value={row?.valid_until ?? ""}
                      />

                      <input name="file" type="file" className="text-xs" />
                      <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-white font-semibold">
                        ✓
                      </button>
                    </form>
                  </td>

                  <td className="p-3">{row?.is_sent ? "SIM" : "NÃO"}</td>

                  <td className="p-3">
                    {viewUrl ? (
                      <a
                        className="underline"
                        href={viewUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        🔎
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3">
                    <span className="text-slate-500">✓</span>
                  </td>

                  <td className="p-3">
                    {row?.id ? (
                      <form action={deleteOrganizationDocumentAction}>
                        <input type="hidden" name="orgId" value={orgId} />
                        <input type="hidden" name="docId" value={row.id} />
                        <button className="rounded-lg border px-2 py-1 hover:bg-slate-50">
                          ✕
                        </button>
                      </form>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 text-xs text-slate-500">
          Obs: a lista de documentos aqui está com 01–10 (do print). Quando você
          mandar o print do final, eu fecho 1:1 com todos os tipos.
        </div>
      </div>
    </div>
  );
}
