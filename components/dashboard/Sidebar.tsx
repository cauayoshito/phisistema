import type { ReactNode } from "react";
import Image from "next/image";
import NavLink from "./NavLink";

type Props = {
  footer?: ReactNode;
};

export default function Sidebar({ footer }: Props) {
  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-full flex-shrink-0">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="relative w-10 h-10 rounded-lg bg-white/95 p-1 shadow-lg overflow-hidden">
          <Image
            src="/branding/TransparenciaSocial.png"
            alt="Logo Transparência Social"
            fill
            sizes="40px"
            className="object-contain"
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-white text-lg font-bold leading-tight tracking-wide">
            Transparência Social
          </h1>
          <p className="text-slate-400 text-xs font-medium truncate">
            Administração institucional
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
