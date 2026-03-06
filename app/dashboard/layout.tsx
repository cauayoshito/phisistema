import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { signOutAction } from "@/app/actions/auth.actions";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-slate-50">
      <Sidebar
        footer={
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="text-white font-semibold text-sm truncate">
              PHI Admin
            </div>
            <div className="text-slate-400 text-xs truncate">
              Ambiente autenticado
            </div>

            <form action={signOutAction} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm py-2 transition"
              >
                Sair
              </button>
            </form>

            <div className="mt-3 text-[10px] text-slate-500">
              © {new Date().getFullYear()} PHI Systems
            </div>
          </div>
        }
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
