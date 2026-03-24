"use client";

import type { MetricMetadata } from "../lib/dashboard-types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatNumber, formatPercent } from "../lib/utils";

type DistributionDatum = {
  name: string;
  value: number;
  percent: number;
  denominator: number;
};

type TooltipPayload = {
  value: number;
  payload: DistributionDatum;
};

const ChartTooltip = ({ payload, label, filtersNote }: { payload?: TooltipPayload[]; label?: string; filtersNote?: string }) => {
  if (!payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs text-ink-700 shadow">
      <div className="font-semibold text-ink-900">{label}</div>
      <div>
        {formatNumber(data.value)} ({formatPercent(data.percent)})
      </div>
      <div>Base n={formatNumber(data.denominator)}</div>
      {filtersNote ? <div className="mt-1 text-ink-600">{filtersNote}</div> : null}
    </div>
  );
};

const StackedTooltip = ({
  payload,
  label,
  filtersNote
}: {
  payload?: Array<{ name: string; value: number }>;
  label?: string;
  filtersNote?: string;
}) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-mist-200 bg-white px-3 py-2 text-xs text-ink-700 shadow">
      <div className="font-semibold text-ink-900">{label}</div>
      {payload.map((item) => (
        <div key={item.name}>
          {item.name}: {formatNumber(item.value)}
        </div>
      ))}
      {filtersNote ? <div className="mt-1 text-ink-600">{filtersNote}</div> : null}
    </div>
  );
};

type ChartCardProps = {
  title: string;
  helper?: string;
  tooltip: MetricMetadata;
  children: React.ReactNode;
};

export function ChartCard({ title, helper, tooltip, children }: ChartCardProps) {
  const tooltipText = `Fuente: ${tooltip.source}\nTipo: ${tooltip.dataType.replace("_", " ")}\nNota: ${tooltip.note}`;
  return (
    <div className="card space-y-5 p-5">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-base font-semibold text-ink-900">{title}</div>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-mist-200 text-[11px] font-semibold text-ink-500"
            title={tooltipText}
          >
            i
          </span>
        </div>
        {helper ? <div className="text-xs text-ink-600">{helper}</div> : null}
      </div>
      <div className="h-64">{children}</div>
      <div className="meta-panel">
        <div className="meta-grid">
          <div>
            <div className="meta-label">Fuente</div>
            <div className="meta-value">{tooltip.source}</div>
          </div>
          <div>
            <div className="meta-label">Tipo de dato</div>
            <div className="meta-value">{tooltip.dataType.replace("_", " ")}</div>
          </div>
          <div>
            <div className="meta-label">Nota metodológica</div>
            <div className="meta-value">{tooltip.note}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DistributionBar({ data, filtersNote }: { data: DistributionDatum[]; filtersNote?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={70} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip content={<ChartTooltip filtersNote={filtersNote} />} />
        <Bar dataKey="value" fill="#0ea5a4" radius={[8, 8, 0, 0]}>
          <LabelList
            dataKey="value"
            position="top"
            content={(props: any) => {
              if (!props || !props.payload) return null;
              const payload = props.payload as DistributionDatum;
              return (
                <text
                  x={props.x}
                  y={(props.y || 0) - 6}
                  textAnchor="middle"
                  className="fill-ink-700 text-[10px]"
                >
                  {data.length <= 6 ? `${formatNumber(payload.value)} (${formatPercent(payload.percent)})` : formatNumber(payload.value)}
                </text>
              );
            }}
          />
          {data.map((entry) => (
            <Cell key={entry.name} fill="#0ea5a4" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DistributionPie({ data, filtersNote }: { data: DistributionDatum[]; filtersNote?: string }) {
  const colors = ["#0ea5a4", "#f59e0b", "#38bdf8", "#10b981", "#f97316", "#f43f5e"];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<ChartTooltip filtersNote={filtersNote} />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          label={(props) => {
            const payload = props.payload as DistributionDatum;
            if (data.length > 6 && payload.name !== "Otros") return "";
            return `${payload.name}: ${formatPercent(payload.percent)}`;
          }}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StackedBar({
  data,
  categories,
  filtersNote
}: {
  data: Array<Record<string, string | number>>;
  categories: string[];
  filtersNote?: string;
}) {
  const colors = ["#0ea5a4", "#f59e0b", "#38bdf8", "#10b981", "#f97316", "#f43f5e"];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 12 }} />
        <Legend />
        <Tooltip content={<StackedTooltip filtersNote={filtersNote} />} />
        {categories.map((category, index) => (
          <Bar key={category} dataKey={category} stackId="a" fill={colors[index % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
