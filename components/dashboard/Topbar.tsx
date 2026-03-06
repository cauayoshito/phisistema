type Props = {
  title?: string;
  subtitle?: string;
};

export default function Topbar({
  title = "Visão Geral",
  subtitle = "Acompanhe rapidamente seus dados e atalhos.",
}: Props) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
      <div className="min-w-0">
        <h2 className="text-lg font-bold text-slate-900 truncate">{title}</h2>
        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-[320px]">
          <input
            placeholder="Buscar projetos..."
            className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        <button className="h-10 w-10 rounded-full hover:bg-slate-100 grid place-items-center">
          🔔
        </button>
        <button className="h-10 w-10 rounded-full hover:bg-slate-100 grid place-items-center">
          💬
        </button>
      </div>
    </header>
  );
}
