import type { ChipOption } from "../../../types/chips";

export const safetyChips: ChipOption[] = [
  { id: "meet_outside", label: "Tavataan ulkona", value: "meet_outside", contexts: ["chat", "agreement"] },
  { id: "public_place_ok", label: "Julkinen paikka sopii", value: "public_place_ok", contexts: ["chat", "agreement"] },
  { id: "agree_return", label: "Sovitaan palautus", value: "agree_return", contexts: ["chat", "agreement"] },
  { id: "show_profile", label: "Voin näyttää profiilini", value: "show_profile", contexts: ["chat", "agreement"] },
];