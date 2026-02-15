function toneClass(tone) {
  if (tone === "emerald") return "border-emerald-200/20 bg-emerald-500/10";
  if (tone === "rose") return "border-rose-200/20 bg-rose-500/10";
  if (tone === "amber") return "border-amber-200/20 bg-amber-500/10";
  return "border-sky-200/20 bg-sky-500/10";
}

export default function SummaryCard({ title, value, tone = "sky", icon: Icon }) {
  return (
    <div className={`rounded-2xl border p-4 ${toneClass(tone)}`}>
      {Icon ? (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-5 w-5 text-white/75" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/55">{title}</div>
            <div className="mt-0.5 text-xl font-extrabold text-white">{value}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-xs font-semibold text-white/60">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-white">{value}</div>
        </>
      )}
    </div>
  );
}
