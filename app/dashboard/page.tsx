import { requireUser } from "@/services/auth.service";
import { getUserContext } from "@/services/membership.service";
import { getPrimaryRole } from "@/lib/roles";
import { nomeDoEmail } from "@/lib/dashboard-helpers";
import { listProjectsForUser } from "@/services/projects.service";
import { listReportsForUser } from "@/services/reports.service";
import DashboardInvestor from "@/components/dashboard/DashboardInvestor";
import DashboardOrg from "@/components/dashboard/DashboardOrg";
import DashboardConsultor from "@/components/dashboard/DashboardConsultor";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const nome = nomeDoEmail(user.email);

  // Resolve perfil (fallback ORG se falhar)
  let role: ReturnType<typeof getPrimaryRole> = "ORG";
  try {
    const ctx = await getUserContext(user.id);
    role = getPrimaryRole(ctx);
  } catch {
    // mantém ORG como fallback
  }

  // Busca dados (compartilhado entre os 3 painéis)
  let projetos: any[] = [];
  let relatorios: any[] = [];

  try {
    projetos = await listProjectsForUser(user.id);
  } catch {
    projetos = [];
  }

  try {
    relatorios = await listReportsForUser(user.id);
  } catch {
    relatorios = [];
  }

  // Renderiza o dashboard correto por perfil
  switch (role) {
    case "INVESTOR":
      return (
        <DashboardInvestor
          nome={nome}
          projetos={projetos}
          relatorios={relatorios}
        />
      );

    case "CONSULTANT":
      return (
        <DashboardConsultor
          nome={nome}
          projetos={projetos}
          relatorios={relatorios}
        />
      );

    case "ORG":
    default:
      return (
        <DashboardOrg
          nome={nome}
          projetos={projetos}
          relatorios={relatorios}
        />
      );
  }
}
