import type { ChipOption } from "../../../types/chips";

export const intentChips: ChipOption[] = [
  {
    id: "need_help",
    label: "Tarvitsen apua",
    value: "need_help",
    contexts: ["listing", "browse"],
  },
  {
    id: "can_help",
    label: "Voin auttaa",
    value: "can_help",
    contexts: ["listing", "browse"],
  },
  {
    id: "need_to_borrow",
    label: "Tarvitsen lainaksi",
    value: "need_to_borrow",
    contexts: ["listing", "browse"],
  },
  {
    id: "can_lend",
    label: "Voin lainata",
    value: "can_lend",
    contexts: ["listing", "browse"],
  },
  {
    id: "do_together",
    label: "Tehdään yhdessä",
    value: "do_together",
    contexts: ["listing", "browse"],
  },
];