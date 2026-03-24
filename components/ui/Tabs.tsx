"use client";

import { motion } from "framer-motion";

type TabsProps<T extends string> = {
  tabs: readonly T[];
  active: T;
  onChange: (value: T) => void;
};

export default function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`tab ${active === tab ? "tab-active" : "tab-inactive"}`}
        >
          <span className="relative">
            {tab}
            {active === tab ? (
              <motion.span
                layoutId="active-tab"
                className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-sun-400"
              />
            ) : null}
          </span>
        </button>
      ))}
    </div>
  );
}
