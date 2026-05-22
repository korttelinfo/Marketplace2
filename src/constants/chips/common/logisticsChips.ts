import type { ChipOption } from "../../../types/chips";

export const logisticsChips: ChipOption[] = [
  { id: "pickup_from_me", label: "Haetaan minulta", value: "pickup_from_me", contexts: ["contact", "agreement"] },
  { id: "i_bring_to_you", label: "Tuon sinulle", value: "i_bring_to_you", contexts: ["contact", "agreement"] },
  { id: "i_come_there", label: "Tulen paikan päälle", value: "i_come_there", contexts: ["contact", "agreement"] },
  { id: "public_place", label: "Tavataan julkisella paikalla", value: "public_place", contexts: ["contact", "agreement", "chat"] },
  { id: "remote", label: "Etänä", value: "remote", contexts: ["contact", "agreement"] },
  { id: "agree_together", label: "Sovitaan yhdessä", value: "agree_together", contexts: ["contact", "agreement"] },
];

export const itemInvolvementChips: ChipOption[] = [
  { id: "item_only", label: "Vain tavara", value: "item_only", contexts: ["listing", "contact", "agreement"] },
  { id: "item_and_help", label: "Tavara + apu mukana", value: "item_and_help", contexts: ["listing", "contact", "agreement"] },
  { id: "need_help_with_item", label: "Tarvitsen apua tavaran kanssa", value: "need_help_with_item", contexts: ["listing", "contact", "agreement"] },
];