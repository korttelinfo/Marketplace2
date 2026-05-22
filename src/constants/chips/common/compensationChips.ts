import type { ChipOption } from "../../../types/chips";

export const compensationChips: ChipOption[] = [
  { id: "neighbor_help", label: "Naapuriapuna", value: "neighbor_help", contexts: ["listing", "contact", "agreement"] },
  { id: "coffee_thanks", label: "Kahvipalkalla ☕", value: "coffee_thanks", contexts: ["listing", "contact", "agreement"] },
  { id: "small_thanks", label: "Pienellä hyvityksellä", value: "small_thanks", contexts: ["listing", "contact", "agreement"] },
  { id: "agree_compensation", label: "Sovitaan yhdessä", value: "agree_compensation", contexts: ["listing", "contact", "agreement"] },
];