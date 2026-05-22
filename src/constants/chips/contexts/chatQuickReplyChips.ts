import type { ChipGroup } from "../../../types/chips";

export const chatQuickReplyChipGroups: ChipGroup[] = [
  {
    id: "general",
    label: "Nopeat vastaukset",
    options: [
      { id: "sounds_good", label: "Sopii hyvin", value: "sounds_good" },
      { id: "nice", label: "Kuulostaa hyvältä", value: "nice" },
      { id: "need_more_info", label: "Tarvitsen lisätietoja", value: "need_more_info" },
      { id: "reply_soon", label: "Palaan pian", value: "reply_soon" },
      { id: "thanks", label: "Kiitos", value: "thanks" },
    ],
  },
  {
    id: "time",
    label: "Aika",
    options: [
      { id: "evening_ok", label: "Käykö ilta?", value: "evening_ok" },
      { id: "reschedule", label: "Voidaanko siirtää?", value: "reschedule" },
      { id: "running_late", label: "Olen hieman myöhässä", value: "running_late" },
      { id: "i_am_here", label: "Olen paikalla", value: "i_am_here" },
    ],
  },
  {
    id: "place",
    label: "Paikka",
    options: [
      { id: "where_meet", label: "Missä tavataan?", value: "where_meet" },
      { id: "public_place_ok", label: "Julkinen paikka sopii", value: "public_place_ok" },
      { id: "send_location", label: "Lähetän sijainnin", value: "send_location" },
      { id: "nearby", label: "Olen lähellä", value: "nearby" },
    ],
  },
];