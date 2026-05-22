import type { ChipGroup } from "../../../types/chips";
import { intentChips } from "../common/intentChips";
import { categoryTree } from "../taxonomy/categoryTree";
import { timeChips } from "../common/timeChips";
import { compensationChips } from "../common/compensationChips";

export const listingFormChipGroups: ChipGroup[] = [
  {
    id: "intent",
    label: "Mitä haluat tehdä?",
    maxSelections: 1,
    required: true,
    options: intentChips,
  },
  {
    id: "category",
    label: "Mihin tämä liittyy?",
    maxSelections: 1,
    required: true,
    options: categoryTree,
  },
  {
    id: "time",
    label: "Milloin?",
    maxSelections: 1,
    options: timeChips,
  },
  {
    id: "compensation",
    label: "Miten hyvitetään?",
    maxSelections: 1,
    options: compensationChips,
  },
];