"use client";

import { toPng } from "html-to-image";
import { useRef } from "react";
import Card from "./Card";

export default function ChartWrapper({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleExport = async () => {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { cacheBust: true });
    const link = document.createElement("a");
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-base font-semibold text-ink-900">{title}</div>
          {helper ? <div className="text-xs text-ink-600">{helper}</div> : null}
        </div>
        <button className="btn-ghost" type="button" onClick={handleExport}>
          Download PNG
        </button>
      </div>
      <div ref={ref} className="h-64">
        {children}
      </div>
    </Card>
  );
}
