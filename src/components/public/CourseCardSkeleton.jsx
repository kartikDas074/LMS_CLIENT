export default function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="h-48 w-full bg-slate-950 animate-pulse" />
      <div className="flex flex-1 flex-col p-5 space-y-3">
        <div className="h-4 w-3/4 rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-full rounded bg-slate-800 animate-pulse" />
        <div className="h-3 w-1/2 rounded bg-slate-800 animate-pulse" />
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800">
          <div className="h-5 w-16 rounded bg-slate-800 animate-pulse" />
          <div className="h-9 w-24 rounded-lg bg-slate-800 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
