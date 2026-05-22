"use client";

import type { ChipGroup as ChipGroupType, ChipOption } from "../../types/chips";
import SelectableChip from "./SelectableChip";

type ChipGroupProps = {
  group: ChipGroupType;
  selectedValues?: string[];
  onChange?: (selectedValues: string[], selectedChips: ChipOption[]) => void;
};

export default function ChipGroup({
  group,
  selectedValues = [],
  onChange,
}: ChipGroupProps) {
  const maxSelections = group.maxSelections ?? Infinity;

  const handleChipClick = (chip: ChipOption) => {
    const isSelected = selectedValues.includes(chip.value);

    let nextValues: string[];

    if (isSelected) {
      nextValues = selectedValues.filter((value) => value !== chip.value);
    } else if (maxSelections === 1) {
      nextValues = [chip.value];
    } else if (selectedValues.length < maxSelections) {
      nextValues = [...selectedValues, chip.value];
    } else {
      nextValues = selectedValues;
    }

    const selectedChips = group.options.filter((option) =>
      nextValues.includes(option.value)
    );

    onChange?.(nextValues, selectedChips);
  };

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900">
            {group.label}
          </h3>

          {group.required && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              Pakollinen
            </span>
          )}
        </div>

        {group.description && (
          <p className="text-sm text-slate-500">{group.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {group.options.map((chip) => (
          <SelectableChip
            key={chip.id}
            chip={chip}
            selected={selectedValues.includes(chip.value)}
            onClick={handleChipClick}
          />
        ))}
      </div>
    </section>
  );
}