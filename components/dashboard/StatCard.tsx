import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  tag?: string;
  tone?: "blue" | "orange" | "red" | "green";
};

const toneMap = {
  blue: "bg-blue-50 text-blue-700",
  orange: "bg-orange-50 text-orange-700",
  red: "bg-red-50 text-red-700",
  green: "bg-green-50 text-green-700",
};

export default function StatCard({
  title,
  value,
  icon,
  tag,
  tone = "blue",
}: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className={["rounded-lg px-3 py-2", toneMap[tone]].join(" ")}>
          {icon}
        </div>
        {tag ? (
          <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {tag}
          </span>
        ) : (
          <span />
        )}
      </div>

      <div className="text-sm text-slate-600">{title}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
