import type { WorkbookMeta } from "../../lib/types";

export default function StatusPill({ meta, label }: { meta: WorkbookMeta | null; label?: string }) {
  if (!meta) return null;
  return (
    <div className="rounded-full border border-mist-200 bg-white px-4 py-2 text-xs font-semibold text-ink-700">
      {label ?? meta.fileName} · Generated {meta.loadedAt}
    </div>
  );
}
