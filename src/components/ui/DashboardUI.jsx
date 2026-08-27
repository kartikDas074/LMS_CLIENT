import Icon from "@/components/dashboard/Icon";

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 ${className}`}>{children}</div>;
}

export function StatusBadge({ status }) {
  const active = status === "Published" || status === "Active";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${active ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-amber-400/20 bg-amber-400/10 text-amber-300"}`}>{status}</span>;
}

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="flex flex-col gap-5 border-b border-slate-800/80 pb-7 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-400">{eyebrow}</p><h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p></div>
    {action && (typeof action === "string" ? <button type="button" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/10 transition hover:brightness-110"><Icon name="plus" size={16} />{action}</button> : action)}
  </div>;
}

export function SearchInput({ placeholder = "Search...", value, onChange }) {
  return <label className="relative block"><Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input value={value} onChange={onChange} className="w-full rounded-xl border border-slate-800 bg-slate-950/70 py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/10" placeholder={placeholder} /></label>;
}

export function EmptyState({ title = "Nothing here yet", description = "Connect your content source to populate this view." }) {
  return <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-14 text-center"><div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400"><Icon name="grid" /></div><h2 className="text-sm font-semibold text-slate-200">{title}</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">{description}</p></div>;
}
