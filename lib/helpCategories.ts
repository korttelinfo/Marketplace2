export const LISTING_TYPES = ['Tarvitsen apua', 'Tarjoan apua'] as const;
export type ListingType = typeof LISTING_TYPES[number];

export const COMPENSATION_TYPES = ['Ilmainen', 'Sovitaan yhdessä', 'Kiinteä summa'] as const;
export type CompensationType = typeof COMPENSATION_TYPES[number];

export const URGENCY_OPTIONS = ['Tänään', 'Tällä viikolla', 'Ei kiirettä'] as const;
export type Urgency = typeof URGENCY_OPTIONS[number];

export const helpCategories: Record<string, string[]> = {
  'Koti ja kodin apu': [
    'Siivousapu',
    'Kaupassakäynti',
    'Pyykinpesu',
    'Ruoanlaitto',
    'Ompeluapu',
  ],
  'Lemmikit ja eläimet': [
    'Koiran ulkoilutus',
    'Kissan hoito',
    'Lemmikkien passitus',
    'Eläinlääkärille vienti',
  ],
  'Piha ja puutarha': [
    'Pihan kitkentä',
    'Lumityöt',
    'Lehtien raapaisu',
    'Pensaiden leikkaus',
    'Istutusapu',
  ],
  'Muutto ja kuljetus': [
    'Muuttoapu',
    'Paketin nouto',
    'Raskaan tavaran kantaminen',
    'Järjestely ja pakkaus',
  ],
  'Tekninen apu': [
    'Tietokoneapu',
    'Puhelinapu',
    'Kasaus ja asennus',
    'Sähköiset laitteet',
  ],
  'Ulkoilu ja seura': [
    'Ulkoiluseura',
    'Kävelykaveri',
    'Kulttuurin nauttiminen',
    'Leikkiseurustelu',
  ],
  'Opetus ja oppiminen': [
    'Huolimaton apu',
    'Harrastusapu',
    'Kielen opetus',
    'Muusikkoapu',
  ],
  'Muuta': [
    'Työkalun laina',
    'Kuva ja video',
    'Muu apu',
  ],
};

export function getAllCategories(): string[] {
  return Object.values(helpCategories).flat();
}

export function getCategoryGroup(category: string): string | null {
  for (const [group, cats] of Object.entries(helpCategories)) {
    if (cats.includes(category)) {
      return group;
    }
  }
  return null;
}

export function getUrgencyEmoji(urgency: Urgency): string {
  switch (urgency) {
    case 'Tänään':
      return '🔴';
    case 'Tällä viikolla':
      return '🟡';
    case 'Ei kiirettä':
      return '🟢';
    default:
      return '⚪';
  }
}

export function getUrgencyLabel(urgency: Urgency): string {
  switch (urgency) {
    case 'Tänään':
      return 'Kiireellinen';
    case 'Tällä viikolla':
      return 'Pian';
    case 'Ei kiirettä':
      return 'Ei kiirettä';
    default:
      return '';
  }
}

export function formatCompensation(type: CompensationType, amount?: string): string {
  switch (type) {
    case 'Ilmainen':
      return 'Ilmainen';
    case 'Sovitaan yhdessä':
      return 'Sovitaan yhdessä';
    case 'Kiinteä summa':
      return amount ? `${amount} €` : 'Kiinteä summa';
    default:
      return '';
  }
}
