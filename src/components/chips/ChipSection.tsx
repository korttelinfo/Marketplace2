"use client";

import type { ChipGroup as ChipGroupType, ChipOption } from "../../types/chips";
import ChipGroup from "./ChipGroup";

type ChipSectionValue = Record<string, string[]>;

type ChipSectionProps = {
  title?: string;
  description?: string;
  groups: ChipGroupType[];
  value?: ChipSectionValue;
  onChange?: (
    nextValue: ChipSectionValue,
    meta: {
      groupId: string;
      selectedValues: string[];
      selectedChips: ChipOption[];
    }
  ) => void;
};

export default function ChipSection({
  title,
  description,
  groups,
  value = {},
  onChange,
}: ChipSectionProps) {
  const handleGroupChange = (
    groupId: string,
    selectedValues: string[],
    selectedChips: ChipOption[]
  ) => {
    const nextValue = {
      ...value,
      [groupId]: selectedValues,
    };

    onChange?.(nextValue, {
      groupId,
      selectedValues,
      selectedChips,
    });
  };

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          )}
          {description && (
            <p className="text-sm leading-relaxed text-slate-500">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {groups.map((group) => (
          <ChipGroup
            key={group.id}
            group={group}
            selectedValues={value[group.id] ?? []}
            onChange={(selectedValues, selectedChips) =>
              handleGroupChange(group.id, selectedValues, selectedChips)
            }
          />
        ))}
      </div>
    </div>
  );
}