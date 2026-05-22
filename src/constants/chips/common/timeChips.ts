import type { ChipOption } from "../../../types/chips";

export const timeChips: ChipOption[] = [
  { id: "today", label: "Tänään", value: "today", contexts: ["listing", "contact", "agreement", "filter"] },
  { id: "tomorrow", label: "Huomenna", value: "tomorrow", contexts: ["listing", "contact", "agreement", "filter"] },
  { id: "coming_days", label: "Lähipäivinä", value: "coming_days", contexts: ["listing", "contact", "agreement", "filter"] },
  { id: "weekend", label: "Viikonloppuna", value: "weekend", contexts: ["listing", "contact", "agreement", "filter"] },
  { id: "agree_later", label: "Sovitaan myöhemmin", value: "agree_later", contexts: ["listing", "contact", "agreement"] },
];

export const timeOfDayChips: ChipOption[] = [
  { id: "morning", label: "Aamupäivä", value: "morning", contexts: ["contact", "agreement"] },
  { id: "afternoon", label: "Iltapäivä", value: "afternoon", contexts: ["contact", "agreement"] },
  { id: "evening", label: "Ilta", value: "evening", contexts: ["contact", "agreement"] },
];

export const recurrenceChips: ChipOption[] = [
  { id: "one_time", label: "Kertaluonteinen", value: "one_time", contexts: ["agreement", "listing"] },
  { id: "recurring", label: "Toistuva", value: "recurring", contexts: ["agreement", "listing"] },
  { id: "occasional", label: "Satunnainen", value: "occasional", contexts: ["agreement", "listing"] },
  { id: "recurrence_agree", label: "Sovitaan", value: "recurrence_agree", contexts: ["agreement", "listing"] },
];