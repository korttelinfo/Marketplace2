export const LISTING_TYPES = ['Tarvitsen apua', 'Tarjoan apua'] as const;

export type ListingType = (typeof LISTING_TYPES)[number];

export const COMPENSATION_TYPES = [
  'Sovitaan yhdessä',
  'Kiinteä summa',
  'Ilmainen',
  'Vaihto käy',
] as const;

export type CompensationType = (typeof COMPENSATION_TYPES)[number];

export const URGENCY_OPTIONS = [
  'Heti',
  'Tänään',
  'Lähipäivinä',
  'Viikon tai kahden kuluessa',
  'Ei kiirettä',
] as const;

export type Urgency = (typeof URGENCY_OPTIONS)[number];

export const SITUATION_OPTIONS = [
  'Nopea juttu',
  'Muutama tunti',
  'Päivä tai viikonloppu',
  'Toistuva tai pidempi',
] as const;

export type SituationType = (typeof SITUATION_OPTIONS)[number];

export const helpCategories: Record<string, string[]> = {
  'Koti & arki': [
    'Siivous',
    'Kantoapu',
    'Pienet korjaukset',
    'Huonekalujen kokoaminen',
    'Muuttoapu',
    'Kauppa-apu',
  ],
  'Tavarat & lainaaminen': [
    'Työkalut',
    'Tikkaat',
    'Porakone',
    'Pakettiauto',
    'Retki- ja juhlavälineet',
    'Muut lainatavarat',
  ],
  'Digiapu & tekniikka': [
    'Tietokoneapu',
    'Puhelinapu',
    'Excel-apu',
    'Tulostus',
    'Verkko ja laitteet',
    'Muu digiapu',
  ],
  Lemmikit: [
    'Kissanhoito',
    'Koiran ulkoilutus',
    'Ruokinta',
    'Viikonloppuhoito',
    'Lemmikin seurana oleminen',
  ],
  'Osaaminen & opetus': [
    'Kieliapu',
    'Opiskeluapu',
    'Mentorointi',
    'CV ja työnhaku',
    'Musiikki',
    'Käden taidot',
  ],
  'Kyydit & kuljetus': [
    'Tavaran kuljetus',
    'Kimppakyyti',
    'Nouto tai haku',
    'Lentokenttäkyyti',
    'Muut kuljetukset',
  ],
  'Hyvinvointi & seura': [
    'Lenkkiseura',
    'Treenikaveri',
    'Juttuseura',
    'Harrastusseura',
    'Kevyt ulkoilu',
  ],
  'Muu lähialueen apu': [
    'Muu tarve',
    'Muu tarjonta',
  ],
};

export function getAllCategories() {
  return Object.values(helpCategories).flat();
}

export function getCategoryGroup(category: string) {
  return (
    Object.entries(helpCategories).find(([, categories]) =>
      categories.includes(category),
    )?.[0] ?? 'Muu lähialueen apu'
  );
}

export function getUrgencyEmoji(urgency: Urgency | string) {
  switch (urgency) {
    case 'Heti':
      return '⚡';
    case 'Tänään':
      return '🌤️';
    case 'Lähipäivinä':
      return '📅';
    case 'Viikon tai kahden kuluessa':
      return '🗓️';
    case 'Ei kiirettä':
      return '🌱';
    default:
      return '📍';
  }
}

export function getUrgencyLabel(urgency: Urgency | string) {
  return urgency;
}

export function getSituationEmoji(situation: SituationType | string) {
  switch (situation) {
    case 'Nopea juttu':
      return '⚡';
    case 'Muutama tunti':
      return '🕒';
    case 'Päivä tai viikonloppu':
      return '🌙';
    case 'Toistuva tai pidempi':
      return '🔁';
    default:
      return '📌';
  }
}

export function getSituationDescription(situation: SituationType | string) {
  switch (situation) {
    case 'Nopea juttu':
      return 'Sopii pieniin, nopeasti hoidettaviin arjen tarpeisiin.';
    case 'Muutama tunti':
      return 'Sopii esimerkiksi siivoukseen, muuttoapuun tai digiapuun.';
    case 'Päivä tai viikonloppu':
      return 'Sopii lemmikeille, lainaamiselle tai pidemmälle avulle.';
    case 'Toistuva tai pidempi':
      return 'Sopii säännölliseen apuun, harrastuksiin tai mentorointiin.';
    default:
      return 'Lisää tarvittaessa kontekstia tilanteesta.';
  }
}