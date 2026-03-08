import type { ReactNode } from "react";
import Image from "next/image";
import NavLink from "./NavLink";

type Props = {
  footer?: ReactNode;
};

export default function Sidebar({ footer }: Props) {
  return (
    <aside className="flex h-full min-h-0 w-72 max-w-full flex-shrink-0 flex-col bg-[#0f172a] text-slate-300">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b border-slate-700/50 p-4 sm:p-5 lg:p-6">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white/95 p-1 shadow-lg">
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
          <h1 className="truncate text-base font-bold leading-tight tracking-wide text-white sm:text-lg">
            Transparência Social
          </h1>
          <p className="truncate text-xs font-medium text-slate-400">
            Administração institucional
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 sm:py-6">
        <div className="flex min-h-0 flex-col gap-1">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
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

          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Sistema
          </p>

          <NavLink href="/dashboard/help" icon={<span>❓</span>} label="Ajuda" />
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-4">{footer}</div>
    </aside>
  );
}