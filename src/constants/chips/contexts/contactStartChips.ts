import type { ChipGroup } from "../../../types/chips";
import { logisticsChips } from "../common/logisticsChips";
import { timeChips, timeOfDayChips } from "../common/timeChips";
import { compensationChips } from "../common/compensationChips";

export const contactStartChipGroups: ChipGroup[] = [
  {
    id: "logistics",
    label: "Miten järjestetään?",
    maxSelections: 1,
    options: logisticsChips,
  },
  {
    id: "time",
    label: "Milloin sopisi?",
    maxSelections: 1,
    options: timeChips,
  },
  {
    id: "time_of_day",
    label: "Tarkennus",
    maxSelections: 1,
    options: timeOfDayChips,
  },
  {
    id: "compensation",
    label: "Miten hyvitetään?",
    maxSelections: 1,
    options: compensationChips,
  },
];