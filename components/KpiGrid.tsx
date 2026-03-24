"use client";

type KpiCard = {
  label: string;
  value: string;
  helper?: string;
};

type KpiGridProps = {
  items: KpiCard[];
};

export default function KpiGrid({ items }: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="card p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ink-600">{item.label}</div>
          <div className="mt-2 text-2xl font-semibold text-ink-900">{item.value}</div>
          {item.helper ? <div className="mt-1 text-xs text-ink-600">{item.helper}</div> : null}
        </div>
      ))}
    </div>
  );
}
