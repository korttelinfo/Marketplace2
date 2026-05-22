import type { ChipGroup } from "../../../types/chips";

export const profileChipGroups: ChipGroup[] = [
  {
    id: "can_help_with",
    label: "Voin auttaa näissä",
    options: [
      { id: "profile_everyday_help", label: "Apua arkeen", value: "everyday_help" },
      { id: "profile_lend_items", label: "Tavarat lainaan", value: "items_to_borrow" },
      { id: "profile_digital_help", label: "Digiapu", value: "digital_help" },
      { id: "profile_guidance", label: "Neuvoja ja opastusta", value: "guidance" },
      { id: "profile_pets", label: "Lemmikit", value: "pets" },
      { id: "profile_together", label: "Yhdessä tekeminen", value: "together" },
    ],
  },
  {
    id: "availability",
    label: "Saatavuus",
    options: [
      { id: "weekdays", label: "Arkisin", value: "weekdays" },
      { id: "weekends", label: "Viikonloppuisin", value: "weekends" },
      { id: "evenings", label: "Iltaisin", value: "evenings" },
      { id: "occasionally", label: "Satunnaisesti", value: "occasionally" },
      { id: "short_notice", label: "Lyhyellä varoitusajalla", value: "short_notice" },
    ],
  },
];