"use client";

import type { ChipOption } from "../../types/chips";

type SelectableChipProps = {
  chip: ChipOption;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (chip: ChipOption) => void;
};

export default function SelectableChip({
  chip,
  selected = false,
  disabled = false,
  onClick,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick?.(chip)}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all",
        "focus:outline-none focus:ring-2 focus:ring-emerald-200",
        selected
          ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/60",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      {chip.icon && <span className="text-base">{chip.icon}</span>}
      <span>{chip.label}</span>
    </button>
  );
}