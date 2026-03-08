import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { signOutAction } from "@/app/actions/auth.actions";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen lg:h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex lg:w-72 lg:shrink-0">
          <Sidebar
            footer={
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="truncate text-sm font-semibold text-white">
                  Transparência Social
                </div>
                <div className="truncate text-xs text-slate-400">
                  Ambiente autenticado
                </div>

                <form action={signOutAction} className="mt-3">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-white/10 py-2 text-sm text-white transition hover:bg-white/15"
                  >
                    Sair
                  </button>
                </form>

                <div className="mt-3 text-[10px] text-slate-500">
                  © {new Date().getFullYear()} Transparência Social
                </div>
              </div>
            }
          />
        </aside>

        {/* Conteúdo */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}