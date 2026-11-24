import { formatRupiah } from "@/lib/utils";

export interface BarDatum {
  label: string;
  value: number;
  secondaryValue?: number;
}

export function SimpleBarChart({
  data,
  primaryLabel = "Pemasukan",
  secondaryLabel = "Pengeluaran",
  showSecondary = true,
  height = 160,
}: {
  data: BarDatum[];
  primaryLabel?: string;
  secondaryLabel?: string;
  showSecondary?: boolean;
  height?: number;
}) {
  const max = Math.max(
    1,
    ...data.flatMap((item) => [item.value, showSecondary ? (item.secondaryValue ?? 0) : 0])
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" aria-hidden /> {primaryLabel}
        </span>
        {showSecondary && (
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" aria-hidden /> {secondaryLabel}
          </span>
        )}
      </div>
      <div className="flex items-end justify-around gap-3" style={{ height }}>
        {data.map((item) => (
          <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <div className="flex h-full w-full items-end justify-center gap-1">
              <div
                className="w-full max-w-6 rounded-t-md bg-brand-500 transition-all"
                style={{ height: `${Math.max(4, (item.value / max) * 100)}%` }}
                title={`${primaryLabel} ${item.label}: ${formatRupiah(item.value)}`}
                aria-label={`${primaryLabel} ${item.label}: ${formatRupiah(item.value)}`}
                role="img"
              />
              {showSecondary && (
                <div
                  className="w-full max-w-6 rounded-t-md bg-slate-400 transition-all"
                  style={{ height: `${Math.max(4, ((item.secondaryValue ?? 0) / max) * 100)}%` }}
                  title={`${secondaryLabel} ${item.label}: ${formatRupiah(item.secondaryValue ?? 0)}`}
                  aria-label={`${secondaryLabel} ${item.label}: ${formatRupiah(item.secondaryValue ?? 0)}`}
                  role="img"
                />
              )}
            </div>
            <span className="w-full truncate text-center text-[11px] text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
