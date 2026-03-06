import type { ReactNode } from "react";
import NavLink from "./NavLink";

type Props = {
  footer?: ReactNode;
};

export default function Sidebar({ footer }: Props) {
  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full flex-shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="bg-gradient-to-tr from-blue-600 to-blue-400 aspect-square rounded-lg w-10 h-10 grid place-items-center shadow-lg text-white font-bold text-xl">
          P
        </div>
        <div className="min-w-0">
          <h1 className="text-white text-lg font-bold leading-tight tracking-wide">
            PHI
          </h1>
          <p className="text-slate-400 text-xs font-medium truncate">
            Administração Filantrópica
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Menu
        </p>

        <NavLink href="/dashboard" icon={<span>📊</span>} label="Dashboard" />
        <NavLink
          href="/dashboard/projects"
          icon={<span>🗂️</span>}
          label="Projetos"
        />
        <NavLink
          href="/dashboard/reports"
          icon={<span>📄</span>}
          label="Relatórios"
        />
        <NavLink
          href="/dashboard/organizations"
          icon={<span>👥</span>}
          label="Organizações"
        />

        <div className="my-4 border-t border-slate-700/50" />

        <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Sistema
        </p>
        <NavLink href="/dashboard/help" icon={<span>❓</span>} label="Ajuda" />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">{footer}</div>
    </aside>
  );
}
