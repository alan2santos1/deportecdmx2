"use client";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export default function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-full border border-mist-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700"
      onClick={() => onChange(!checked)}
    >
      <span className={`h-4 w-8 rounded-full transition ${checked ? "bg-accent-600" : "bg-mist-200"}`}>
        <span
          className={`block h-4 w-4 rounded-full bg-white shadow transition ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
