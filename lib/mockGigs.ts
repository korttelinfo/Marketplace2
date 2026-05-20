export type BrowseGig = {
  id: string;
  title: string;
  category: string;
  price: string;
  location: string;
  date: string;
  description: string;
  status: string;
};

export type LandingCategory = {
  title: string;
  description: string;
};

export type LandingGig = {
  title: string;
  details: string;
  meta: string;
};

export const browseCategories = ['Kaikki', 'Kodin apu', 'Lemmikit', 'Piha & puutarha', 'Tekninen apu'] as const;

export const formCategories = ['Kodin apu', 'Lemmikit', 'Piha & puutarha', 'Tekninen apu'] as const;

export const landingCategories: LandingCategory[] = [
  { title: 'Kodin apu', description: 'Siivous, keräys ja pikkuhuollot' },
  { title: 'Lemmikit', description: 'Koiran ulkoilutus ja hoito' },
  { title: 'Piha & puutarha', description: 'Leikkaus, istutus ja siirto' },
  { title: 'Tekninen apu', description: 'Asennus, kantaminen, kasaus' },
];

export const landingGigs: LandingGig[] = [
  {
    title: 'Koiran iltalenkki',
    details: '30 min ulkoilua Puistolassa',
    meta: '15 € · Helsinki · Tänään',
  },
  {
    title: 'Paketin nouto',
    details: 'Nouda ja tuo kotiovelle Malmilta',
    meta: '10 € · Helsinki · Huomenna',
  },
  {
    title: 'Kirjahyllyn kokoaminen',
    details: 'Ikea-hylly työkalujen kanssa',
    meta: '25 € · Helsinki · 2 pv',
  },
];

export const browseGigs: BrowseGig[] = [
  {
    id: 'ikkunanpesu-kerrostalossa',
    title: 'Ikkunanpesu kerrostalossa',
    category: 'Kodin apu',
    price: '18 €',
    location: 'Kallio',
    date: 'Huomenna',
    description: 'Sisä- ja ulkopintojen kevyt pesu nopeasti.',
    status: 'Uusi',
  },
  {
    id: 'koiran-iltalenkki',
    title: 'Koiran iltalenkki',
    category: 'Lemmikit',
    price: '15 €',
    location: 'Helsinki',
    date: 'Tänään',
    description: '30 minuutin lenkki ja pieni leikkihetki.',
    status: 'Vapaa',
  },
  {
    id: 'pihan-kitkenta',
    title: 'Pihan kitkentä',
    category: 'Piha & puutarha',
    price: '22 €',
    location: 'Lahti',
    date: '2 pv',
    description: 'Rikotaan rikkaruohot ja siistitään kukkapenkki.',
    status: 'Suosittu',
  },
  {
    id: 'kirjahyllyn-kokoaminen',
    title: 'Kirjahyllyn kasaus',
    category: 'Tekninen apu',
    price: '25 €',
    location: 'Helsinki',
    date: '3 pv',
    description: 'Ikean hylly paikalleen ja kiinnitys seinään.',
    status: 'Vapaa',
  },
  {
    id: 'paketin-nouto-ja-toimitus',
    title: 'Paketin nouto ja toimitus',
    category: 'Kodin apu',
    price: '10 €',
    location: 'Espoo',
    date: 'Huomenna',
    description: 'Nouda paketti lähikaupasta ja tuo kotiovelle.',
    status: 'Uusi',
  },
  {
    id: 'pieni-tietokoneapu',
    title: 'Pieni tietokoneapu',
    category: 'Tekninen apu',
    price: '30 €',
    location: 'Tapiola',
    date: '4 pv',
    description: 'Avaa asetukset, asenna ohjelma ja tarkista yhteys.',
    status: 'Suosittu',
  },
];
