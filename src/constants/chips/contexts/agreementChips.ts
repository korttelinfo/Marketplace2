import type { ChipGroup } from "../../../types/chips";
import { logisticsChips, itemInvolvementChips } from "../common/logisticsChips";
import { timeChips, timeOfDayChips, recurrenceChips } from "../common/timeChips";
import { compensationChips } from "../common/compensationChips";
import { safetyChips } from "../common/safetyChips";

export const agreementChipGroups: ChipGroup[] = [
  {
    id: "logistics",
    label: "Logistiikka",
    maxSelections: 1,
    options: logisticsChips,
  },
  {
    id: "time",
    label: "Aika",
    maxSelections: 1,
    options: timeChips,
  },
  {
    id: "time_of_day",
    label: "Ajankohta",
    maxSelections: 1,
    options: timeOfDayChips,
  },
  {
    id: "compensation",
    label: "Hyvitys",
    maxSelections: 1,
    options: compensationChips,
  },
  {
    id: "recurrence",
    label: "Toistuvuus",
    maxSelections: 1,
    options: recurrenceChips,
  },
  {
    id: "item_involvement",
    label: "Tavara vai apu mukana?",
    maxSelections: 1,
    options: itemInvolvementChips,
  },
  {
    id: "safety",
    label: "Turvallisuus",
    maxSelections: 2,
    options: safetyChips,
  },
];