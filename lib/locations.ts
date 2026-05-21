export const cities = ['Helsinki', 'Espoo', 'Vantaa', 'Tampere', 'Turku', 'Oulu'] as const;
export type City = (typeof cities)[number];

export const neighborhoodsByCity: Record<City, string[]> = {
  Helsinki: ['Kallio', 'Punavuori', 'Keskusta', 'Töölö', 'Vuosaari'],
  Espoo: ['Leppävaara', 'Espoonlahti', 'Matinkylä', 'Kivenlahti', 'Otaranta'],
  Vantaa: ['Tikkurila', 'Myyrmäki', 'Korso', 'Hakuna', 'Kivistö'],
  Tampere: ['Keskusta', 'Tammela', 'Kaleva', 'Pispala', 'Tesoma'],
  Turku: ['Keskusta', 'Kupittaa', 'Halis', 'Varissuo', 'Runeberginkatu'],
  Oulu: ['Keskusta', 'Hiirola', 'Raksila', 'Toppila', 'Kaijonharju'],
};

export function getNeighborhoods(city: City | string) {
  return neighborhoodsByCity[city as City] ?? [];
}

export function formatLocation(city: string, neighborhood: string) {
  return neighborhood ? `${city}, ${neighborhood}` : city;
}

export function parseLocation(location: string) {
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean);
  const city = (parts[0] as City) ?? 'Helsinki';
  const neighborhoods = getNeighborhoods(city);
  const neighborhood = parts[1] && neighborhoods.includes(parts[1]) ? parts[1] : neighborhoods[0] ?? '';

  if (!cities.includes(city as City)) {
    return { city: 'Helsinki' as City, neighborhood: neighborhoodsByCity.Helsinki[0] };
  }

  return { city, neighborhood };
}
