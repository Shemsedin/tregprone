/**
 * Database seed — data-driven generator.
 * Edit LISTING_SPECS to control which listings are created.
 * All other fields (title, description, price, images…) are derived
 * programmatically from the spec via the helper functions below.
 */

import { PrismaClient } from '../generated/client/index.js';

const prisma = new PrismaClient();

// ── Deterministic seeded RNG (Mulberry32) ─────────────────────────────────────

function seededRng(seed: number) {
  let s = seed >>> 0;
  const next = (): number => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1)),
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)]!,
    sample: <T>(arr: readonly T[], n: number): T[] => {
      const copy = [...arr];
      const result: T[] = [];
      for (let i = 0; i < Math.min(n, copy.length); i++) {
        const j = Math.floor(next() * (copy.length - i)) + i;
        [copy[i], copy[j]] = [copy[j]!, copy[i]!];
        result.push(copy[i]!);
      }
      return result;
    },
  };
}

// ── Unsplash photo pools per property type ────────────────────────────────────

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&auto=format`;

const PHOTO_POOLS: Record<string, readonly string[]> = {
  APARTMENT: [
    u('1502672260266-1c1ef2d93688'),
    u('1560448204-e02f11c3d0e2'),
    u('1522708323590-d24dbb6b0267'),
    u('1484154218962-a197022b5858'),
    u('1493809842364-78817add7ffb'),
    u('1556909114-f6e7ad7d3136'),
  ],
  HOUSE: [
    u('1568605114967-8130f3a36994'),
    u('1570129477492-45c003edd2be'),
    u('1580587771525-78b9dba3b914'),
    u('1449844908441-8d1a1503f9c9'),
    u('1512917774080-9991f1c4c750'),
  ],
  VILLA: [
    u('1600596542815-ffad4c1539a9'),
    u('1613977257592-4871e5fcd7c4'),
    u('1600585154340-be6161a56a0c'),
    u('1416331108676-a22ccb276e35'),
    u('1599809275671-b5942cabc7a2'),
  ],
  STUDIO: [
    u('1536376072261-38c75010e6c9'),
    u('1555636222-cae831e670b3'),
    u('1631049307264-da0ec9d70304'),
  ],
  OFFICE: [
    u('1497366216548-37526070297c'),
    u('1497366811353-6870744d04b2'),
    u('1504384308090-c894fdcc538d'),
    u('1524758631624-e2822e304c36'),
  ],
  COMMERCIAL: [
    u('1556742049-0cfed4f6a45d'),
    u('1441986300917-64674bd600d8'),
    u('1567958575943-c45d8aea65e0'),
  ],
  LAND: [
    u('1500534314209-a25ddb2bd429'),
    u('1569336786975-0c6bf2da8d13'),
    u('1414235077428-338989a2e8c0'),
  ],
  GARAGE: [u('1558618047-3c8c76ca7d13'), u('1541899481282-d53bffe3c35d')],
};

// ── Region data ───────────────────────────────────────────────────────────────

const REGION_DATA = [
  {
    slug: 'tirane',
    label: 'Tiranë',
    priceMultiplier: 1.3,
    neighborhoods: [
      'Bllok',
      'Sauk',
      'Don Bosko',
      'Komuna e Parisit',
      '21 Dhjetori',
      'Myslym Shyri',
      'Kombinat',
      'Kodra e Diellit',
    ],
    streets: [
      'Rruga Ismail Qemali',
      'Bulevardi Zogu I',
      'Rruga e Kavajës',
      'Rruga Myslym Shyri',
      'Rruga Sami Frashëri',
    ],
    centroidLat: 41.3275,
    centroidLng: 19.8189,
  },
  {
    slug: 'durres',
    label: 'Durrës',
    priceMultiplier: 1.1,
    neighborhoods: ['Plazh', '13 Shtatori', 'Currila', 'Qendër', 'Iliria', 'Shkëmbi i Kavajës'],
    streets: ['Rruga e Plazhit', 'Bulevardi Epidamn', 'Rruga Tregtare', 'Rruga Nacionale'],
    centroidLat: 41.3233,
    centroidLng: 19.4415,
  },
  {
    slug: 'vlore',
    label: 'Vlorë',
    priceMultiplier: 1.05,
    neighborhoods: ['Lungomare', 'Uji i Ftohtë', 'Skelë', 'Muradie', 'Qendër', 'Orikum'],
    streets: ['Shëtitorja Lungomare', 'Rruga Skënderbej', 'Rruga Sadik Stavileci'],
    centroidLat: 40.4671,
    centroidLng: 19.4883,
  },
  {
    slug: 'shkoder',
    label: 'Shkodër',
    priceMultiplier: 0.85,
    neighborhoods: ['Gjuhadol', 'Vasil Shanto', 'Rus', 'Qendër', 'Ana e Malit', 'Bahçallek'],
    streets: [
      'Sheshi 2 Prilli',
      'Bulevardi Skënderbeu',
      'Rruga 13 Dhjetori',
      'Rruga Kolë Idromeno',
    ],
    centroidLat: 42.0688,
    centroidLng: 19.5129,
  },
  {
    slug: 'elbasan',
    label: 'Elbasan',
    priceMultiplier: 0.8,
    neighborhoods: ['Qemal Stafa', 'Tre Deshmorët', 'Lulishtja', 'Qendër', 'Fusha e Aviacionit'],
    streets: ['Bulevardi Qemal Stafa', 'Rruga Rinia', 'Rruga 5 Maji'],
    centroidLat: 41.1125,
    centroidLng: 20.0822,
  },
  {
    slug: 'korce',
    label: 'Korçë',
    priceMultiplier: 0.8,
    neighborhoods: ['Republika', '7 Marsi', 'Mihal Grameno', 'Qendër', 'Gjergj Fishta'],
    streets: ['Bulevardi Republika', 'Rruga Miq Grameno', 'Rruga Gjin Bue Shpata'],
    centroidLat: 40.6186,
    centroidLng: 20.7808,
  },
  {
    slug: 'prishtine',
    label: 'Prishtinë',
    priceMultiplier: 1.2,
    neighborhoods: ['Qendër', 'Matiqan', 'Dardania', 'Pejton', 'Breg i Diellit', 'Kalabria'],
    streets: ['Rruga UCK', 'Rruga Fehmi Agani', 'Bulevardi Bill Clinton', 'Sheshi Nënë Tereza'],
    centroidLat: 42.6629,
    centroidLng: 21.1655,
  },
  {
    slug: 'prizren',
    label: 'Prizren',
    priceMultiplier: 0.9,
    neighborhoods: ['Lagja e Vjetër', 'Shadervan', 'Remzi Ademi', 'Qendër', 'Terzia'],
    streets: ['Bulevardi Shaban Polluzha', 'Rruga Shadervan', 'Rruga Orhan Salihi'],
    centroidLat: 42.2139,
    centroidLng: 20.7397,
  },
  {
    slug: 'peje',
    label: 'Pejë',
    priceMultiplier: 0.85,
    neighborhoods: ['Çabrat', 'Rugova', 'Isa Boletini', 'Qendër', 'Brekoc'],
    streets: ['Rruga e Çabratit', 'Rruga e Rugovës', 'Bulevardi OAK'],
    centroidLat: 42.6593,
    centroidLng: 20.2876,
  },
  {
    slug: 'mitrovice',
    label: 'Mitrovicë',
    priceMultiplier: 0.75,
    neighborhoods: ['Suhadoll', 'Minatorët', 'Qendër', 'Ibri i Ri', 'Ura'],
    streets: ['Sheshi Adem Jashari', 'Bulevardi Nëna Tereze', 'Rruga Afrim Zhitia'],
    centroidLat: 42.8908,
    centroidLng: 20.8657,
  },
  {
    slug: 'shkup',
    label: 'Shkup',
    priceMultiplier: 1.15,
    neighborhoods: ['Qendër', 'Karpoš', 'Aerodrom', 'Bunjakovec', 'Kozle', 'Čair'],
    streets: ['Bulevardi Ilinden', 'Bulevardi Partizanski Odredi', 'Rruga Orce Nikolov'],
    centroidLat: 41.9981,
    centroidLng: 21.4254,
  },
  {
    slug: 'tetove',
    label: 'Tetovë',
    priceMultiplier: 0.8,
    neighborhoods: ['Hamzali', 'Qendër', 'Pazari i Vjetër', 'Lesok', 'Kamenjane'],
    streets: ['Rruga Ilindenska', 'Rruga Boro-Ramiz', 'Bulevardi i Shkupit'],
    centroidLat: 42.0104,
    centroidLng: 20.9719,
  },
] as const;

type RegionSlug = (typeof REGION_DATA)[number]['slug'];

// ── Property type metadata ─────────────────────────────────────────────────────

type PropMeta = {
  titleFn: (region: string, beds: number, area: number, listingType: 'SALE' | 'RENT') => string;
  descFns: Array<(region: string, beds: number, area: number) => string>;
  areaRange: [number, number];
  bedroomOptions: number[];
  bathroomOptions: number[];
  featurePool: string[];
  numImages: [number, number];
  basePriceEurSale: number;
  basePriceEurRent: number;
  pricePerM2Sale: number;
};

const PROP_META: Record<string, PropMeta> = {
  APARTMENT: {
    titleFn: (r, beds, _a, t) =>
      t === 'SALE' ? `Apartament ${beds}+1 shitje, ${r}` : `Apartament ${beds}+1 me qira, ${r}`,
    descFns: [
      (r, beds, area) =>
        `Apartament ${beds}+1 me sipërfaqe ${area}m² në zonën e ${r}. I ndriçuar mirë, me ballkon dhe pamje të hapur. Kuzhinë e re, dysheme parket, kondicionier. Afër shkollave, dyqaneve dhe transportit publik.`,
      (r, beds, area) =>
        `Apartament modern ${beds}+1 me ${area}m² në ${r}. Ndërtesë e re me ashensor dhe parking. Mobilim i plotë sipas kërkesës. Pozicion i shkëlqyer, afër çdo shërbimi.`,
      (r, beds, area) =>
        `Ofrohet apartament ${beds}+1, ${area}m² në ${r}. Kati i mesëm, ambient i qetë. Të gjitha rregullimet e brendshme janë cilësi e lartë. Disponueshëm menjëherë.`,
    ],
    areaRange: [45, 130],
    bedroomOptions: [1, 2, 3],
    bathroomOptions: [1, 2],
    featurePool: [
      'feature.balcony',
      'feature.elevator',
      'feature.ac',
      'feature.parking',
      'feature.heating_central',
      'feature.furnished',
      'feature.semi_furnished',
      'feature.fiber_internet',
    ],
    numImages: [3, 5],
    basePriceEurSale: 65000,
    basePriceEurRent: 380,
    pricePerM2Sale: 900,
  },
  HOUSE: {
    titleFn: (r, beds, _a, t) =>
      t === 'SALE' ? `Shtëpi private ${beds}+1, ${r}` : `Shtëpi ${beds}+1 me qira, ${r}`,
    descFns: [
      (r, beds, area) =>
        `Shtëpi ${beds}+1 me sipërfaqe ${area}m² në ${r}. Oborr i madh, garazh dhe kopsht. Ideal për familje të madhe. Zonë e qetë rezidenciale, afër çerdheve dhe shkollave.`,
      (r, beds, area) =>
        `Shtëpi dy katëshe ${beds}+1, ${area}m² bruto. Kuzhinë e hapur, dhomë ndeje e gjerë, ${beds} dhoma gjumi. Parkim i siguruar. Pozicion shumë i mirë në ${r}.`,
    ],
    areaRange: [130, 280],
    bedroomOptions: [3, 4, 5],
    bathroomOptions: [2, 3],
    featurePool: [
      'feature.garden',
      'feature.parking',
      'feature.heating_gas',
      'feature.security',
      'feature.fireplace',
      'feature.basement',
      'feature.solar_panels',
    ],
    numImages: [3, 5],
    basePriceEurSale: 120000,
    basePriceEurRent: 550,
    pricePerM2Sale: 700,
  },
  VILLA: {
    titleFn: (r, beds, _a, t) =>
      t === 'SALE' ? `Vilë luksoze ${beds}+1, ${r}` : `Vilë me qira, ${r}`,
    descFns: [
      (r, beds, area) =>
        `Vilë e re ${beds}+1, ${area}m² me pishinë private dhe kopsht të madh. Materiale cilësi të lartë, sistem ngrohjeje qendror, sistem sigurie 24/7. ${r}.`,
      (r, beds, area) =>
        `Vilë luksoze ${area}m², ${beds} dhoma gjumi. Pishinë private, garazh dy-vendësor dhe kopsht 500m². Lokalizim elitar në ${r}.`,
    ],
    areaRange: [200, 400],
    bedroomOptions: [4, 5, 6],
    bathroomOptions: [3, 4],
    featurePool: [
      'feature.pool',
      'feature.garden',
      'feature.security',
      'feature.parking',
      'feature.ac',
      'feature.furnished',
      'feature.solar_panels',
      'feature.fireplace',
    ],
    numImages: [4, 5],
    basePriceEurSale: 280000,
    basePriceEurRent: 1500,
    pricePerM2Sale: 1400,
  },
  STUDIO: {
    titleFn: (r, _b, _a, t) => (t === 'SALE' ? `Studio shitje, ${r}` : `Studio me qira, ${r}`),
    descFns: [
      (r, _b, area) =>
        `Studio kompakte ${area}m² e mobiluar plotësisht. Ideal për profesionist ose student. Ndërtesë e re me ashensor. Qendër e ${r}, afër gjithçkaje.`,
      (r, _b, area) =>
        `Studio moderne ${area}m² me pamje të mirë. Kuzhinë e integruar, banjë e re. ${r}.`,
    ],
    areaRange: [28, 45],
    bedroomOptions: [0],
    bathroomOptions: [1],
    featurePool: [
      'feature.elevator',
      'feature.ac',
      'feature.furnished',
      'feature.fiber_internet',
      'feature.heating_central',
    ],
    numImages: [2, 4],
    basePriceEurSale: 40000,
    basePriceEurRent: 280,
    pricePerM2Sale: 1100,
  },
  OFFICE: {
    titleFn: (r, _b, area, t) =>
      t === 'SALE' ? `Zyrë ${area}m² shitje, ${r}` : `Zyrë ${area}m² me qira, ${r}`,
    descFns: [
      (r, _b, area) =>
        `Zyrë ${area}m² me hapësirë të hapur. Ndërtesë moderne, parking i siguruar, recepsion i përbashkët. Pozicion strategjik në ${r}.`,
      (r, _b, area) =>
        `Zyrë ${area}m² me ambiente të ndara. Tavan i lartë, dritare panoramike, akses 24/7. ${r}, zonë biznesi.`,
    ],
    areaRange: [50, 250],
    bedroomOptions: [],
    bathroomOptions: [1],
    featurePool: [
      'feature.elevator',
      'feature.ac',
      'feature.parking',
      'feature.security',
      'feature.fiber_internet',
      'feature.disability_access',
    ],
    numImages: [2, 4],
    basePriceEurSale: 80000,
    basePriceEurRent: 600,
    pricePerM2Sale: 1200,
  },
  COMMERCIAL: {
    titleFn: (r, _b, area, t) =>
      t === 'SALE' ? `Lokal tregtar ${area}m², ${r}` : `Lokal tregtar ${area}m² me qira, ${r}`,
    descFns: [
      (r, _b, area) =>
        `Lokal komercial ${area}m² me vitrinë të gjerë. Pozicion me trafik të lartë këmbësorësh. Ideal për dyqan, restorant ose kafe. ${r}.`,
      (r, _b, area) =>
        `Lokal ${area}m² në katin përdhes. Akses i lehtë, parkingo afër. ${r}, rrugë me xhiro të madhe.`,
    ],
    areaRange: [35, 200],
    bedroomOptions: [],
    bathroomOptions: [1],
    featurePool: ['feature.parking', 'feature.security', 'feature.disability_access'],
    numImages: [2, 3],
    basePriceEurSale: 60000,
    basePriceEurRent: 500,
    pricePerM2Sale: 1500,
  },
  LAND: {
    titleFn: (r, _b, area, t) =>
      t === 'SALE' ? `Tokë ${area}m² shitje, ${r}` : `Tokë ${area}m² me qira, ${r}`,
    descFns: [
      (r, _b, area) =>
        `Tokë ${area}m² me leje ndërtimi. Akses i mirë, infrastrukturë e plotë (ujë, kanalizime, rrymë). Zonë në zhvillim të shpejtë. ${r}.`,
      (r, _b, area) =>
        `Tokë ndërtimore ${area}m² në ${r}. Terren i rrafshët, kufi i qartë. I përshtatshëm për rezidencë private ose kompleks të vogël.`,
    ],
    areaRange: [500, 5000],
    bedroomOptions: [],
    bathroomOptions: [],
    featurePool: [],
    numImages: [1, 3],
    basePriceEurSale: 50000,
    basePriceEurRent: 200,
    pricePerM2Sale: 60,
  },
  GARAGE: {
    titleFn: (r, _b, area, t) =>
      t === 'SALE' ? `Garazh ${area}m² shitje, ${r}` : `Garazh ${area}m² me qira, ${r}`,
    descFns: [
      (r, _b, area) =>
        `Garazh ${area}m² i siguruar me kamera CCTV. Akses 24/7. ${r}, afër qendrës.`,
    ],
    areaRange: [15, 30],
    bedroomOptions: [],
    bathroomOptions: [],
    featurePool: ['feature.security'],
    numImages: [1, 2],
    basePriceEurSale: 15000,
    basePriceEurRent: 80,
    pricePerM2Sale: 800,
  },
};

// ── Listing specs matrix ───────────────────────────────────────────────────────
// Each entry creates one listing.  Add/remove rows freely to adjust test data.

const LISTING_SPECS: Array<{
  regionSlug: RegionSlug;
  propertyType: keyof typeof PROP_META;
  listingType: 'SALE' | 'RENT';
  currency?: 'EUR' | 'ALL';
}> = [
  // Tiranë (8)
  { regionSlug: 'tirane', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'tirane', propertyType: 'APARTMENT', listingType: 'SALE', currency: 'ALL' },
  { regionSlug: 'tirane', propertyType: 'APARTMENT', listingType: 'RENT' },
  { regionSlug: 'tirane', propertyType: 'STUDIO', listingType: 'RENT' },
  { regionSlug: 'tirane', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'tirane', propertyType: 'OFFICE', listingType: 'RENT' },
  { regionSlug: 'tirane', propertyType: 'COMMERCIAL', listingType: 'RENT' },
  { regionSlug: 'tirane', propertyType: 'GARAGE', listingType: 'SALE' },
  // Durrës (5)
  { regionSlug: 'durres', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'durres', propertyType: 'APARTMENT', listingType: 'RENT' },
  { regionSlug: 'durres', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'durres', propertyType: 'VILLA', listingType: 'SALE' },
  { regionSlug: 'durres', propertyType: 'LAND', listingType: 'SALE' },
  // Vlorë (4)
  { regionSlug: 'vlore', propertyType: 'VILLA', listingType: 'SALE' },
  { regionSlug: 'vlore', propertyType: 'APARTMENT', listingType: 'RENT' },
  { regionSlug: 'vlore', propertyType: 'STUDIO', listingType: 'SALE' },
  { regionSlug: 'vlore', propertyType: 'LAND', listingType: 'SALE' },
  // Shkodër (3)
  { regionSlug: 'shkoder', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'shkoder', propertyType: 'APARTMENT', listingType: 'RENT', currency: 'ALL' },
  { regionSlug: 'shkoder', propertyType: 'OFFICE', listingType: 'RENT' },
  // Elbasan (3)
  { regionSlug: 'elbasan', propertyType: 'APARTMENT', listingType: 'SALE', currency: 'ALL' },
  { regionSlug: 'elbasan', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'elbasan', propertyType: 'COMMERCIAL', listingType: 'RENT' },
  // Korçë (3)
  { regionSlug: 'korce', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'korce', propertyType: 'HOUSE', listingType: 'RENT' },
  { regionSlug: 'korce', propertyType: 'LAND', listingType: 'SALE' },
  // Prishtinë (6)
  { regionSlug: 'prishtine', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'prishtine', propertyType: 'APARTMENT', listingType: 'RENT' },
  { regionSlug: 'prishtine', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'prishtine', propertyType: 'VILLA', listingType: 'SALE' },
  { regionSlug: 'prishtine', propertyType: 'OFFICE', listingType: 'RENT' },
  { regionSlug: 'prishtine', propertyType: 'STUDIO', listingType: 'RENT' },
  // Prizren (3)
  { regionSlug: 'prizren', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'prizren', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'prizren', propertyType: 'COMMERCIAL', listingType: 'RENT' },
  // Pejë (3)
  { regionSlug: 'peje', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'peje', propertyType: 'HOUSE', listingType: 'RENT' },
  { regionSlug: 'peje', propertyType: 'LAND', listingType: 'SALE' },
  // Mitrovicë (3)
  { regionSlug: 'mitrovice', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'mitrovice', propertyType: 'HOUSE', listingType: 'RENT' },
  { regionSlug: 'mitrovice', propertyType: 'OFFICE', listingType: 'SALE' },
  // Shkup (6)
  { regionSlug: 'shkup', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'shkup', propertyType: 'APARTMENT', listingType: 'RENT' },
  { regionSlug: 'shkup', propertyType: 'HOUSE', listingType: 'SALE' },
  { regionSlug: 'shkup', propertyType: 'VILLA', listingType: 'SALE' },
  { regionSlug: 'shkup', propertyType: 'OFFICE', listingType: 'RENT' },
  { regionSlug: 'shkup', propertyType: 'LAND', listingType: 'SALE' },
  // Tetovë (3)
  { regionSlug: 'tetove', propertyType: 'APARTMENT', listingType: 'SALE' },
  { regionSlug: 'tetove', propertyType: 'HOUSE', listingType: 'RENT' },
  { regionSlug: 'tetove', propertyType: 'COMMERCIAL', listingType: 'RENT' },
  // Extra diversity (3)
  { regionSlug: 'tirane', propertyType: 'VILLA', listingType: 'SALE' },
  { regionSlug: 'prishtine', propertyType: 'GARAGE', listingType: 'SALE' },
  { regionSlug: 'vlore', propertyType: 'COMMERCIAL', listingType: 'SALE' },
];

// ── Slug helper ────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ── DB constants ───────────────────────────────────────────────────────────────

const REGIONS = [
  {
    id: 'r-al-tirana',
    country: 'AL',
    name: 'Tiranë',
    slug: 'tirane',
    centroidLat: 41.3275,
    centroidLng: 19.8189,
  },
  {
    id: 'r-al-durres',
    country: 'AL',
    name: 'Durrës',
    slug: 'durres',
    centroidLat: 41.3233,
    centroidLng: 19.4415,
  },
  {
    id: 'r-al-vlore',
    country: 'AL',
    name: 'Vlorë',
    slug: 'vlore',
    centroidLat: 40.4671,
    centroidLng: 19.4883,
  },
  {
    id: 'r-al-shkoder',
    country: 'AL',
    name: 'Shkodër',
    slug: 'shkoder',
    centroidLat: 42.0688,
    centroidLng: 19.5129,
  },
  {
    id: 'r-al-elbasan',
    country: 'AL',
    name: 'Elbasan',
    slug: 'elbasan',
    centroidLat: 41.1125,
    centroidLng: 20.0822,
  },
  {
    id: 'r-al-korce',
    country: 'AL',
    name: 'Korçë',
    slug: 'korce',
    centroidLat: 40.6186,
    centroidLng: 20.7808,
  },
  {
    id: 'r-xk-pristina',
    country: 'XK',
    name: 'Prishtinë',
    slug: 'prishtine',
    centroidLat: 42.6629,
    centroidLng: 21.1655,
  },
  {
    id: 'r-xk-prizren',
    country: 'XK',
    name: 'Prizren',
    slug: 'prizren',
    centroidLat: 42.2139,
    centroidLng: 20.7397,
  },
  {
    id: 'r-xk-peje',
    country: 'XK',
    name: 'Pejë',
    slug: 'peje',
    centroidLat: 42.6593,
    centroidLng: 20.2876,
  },
  {
    id: 'r-xk-mitrovice',
    country: 'XK',
    name: 'Mitrovicë',
    slug: 'mitrovice',
    centroidLat: 42.8908,
    centroidLng: 20.8657,
  },
  {
    id: 'r-mk-shkup',
    country: 'MK',
    name: 'Shkup',
    slug: 'shkup',
    centroidLat: 41.9981,
    centroidLng: 21.4254,
  },
  {
    id: 'r-mk-tetove',
    country: 'MK',
    name: 'Tetovë',
    slug: 'tetove',
    centroidLat: 42.0104,
    centroidLng: 20.9719,
  },
];

const FEATURES = [
  'feature.balcony',
  'feature.parking',
  'feature.elevator',
  'feature.ac',
  'feature.heating_central',
  'feature.heating_gas',
  'feature.furnished',
  'feature.semi_furnished',
  'feature.garden',
  'feature.pool',
  'feature.security',
  'feature.storage',
  'feature.sea_view',
  'feature.mountain_view',
  'feature.basement',
  'feature.solar_panels',
  'feature.fireplace',
  'feature.disability_access',
  'feature.fiber_internet',
];

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database…');

  for (const region of REGIONS) {
    await prisma.region.upsert({ where: { slug: region.slug }, update: {}, create: region });
  }
  console.log(`✔ ${REGIONS.length} regions`);

  for (const key of FEATURES) {
    await prisma.feature.upsert({ where: { key }, update: {}, create: { key } });
  }
  console.log(`✔ ${FEATURES.length} features`);

  const { hash } = await import('argon2');

  const adminHash = await hash('Admin1234!', { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tregprone.dev' },
    update: {},
    create: {
      email: 'admin@tregprone.dev',
      name: 'Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  });
  console.log(`✔ admin: ${admin.email}`);

  const agentHash = await hash('Agent1234!', { memoryCost: 19456, timeCost: 2, parallelism: 1 });
  const agent = await prisma.user.upsert({
    where: { email: 'agent@tregprone.dev' },
    update: {},
    create: {
      email: 'agent@tregprone.dev',
      name: 'Artan Hoxha',
      passwordHash: agentHash,
      role: 'AGENT',
      emailVerified: new Date(),
      phone: '+355691234567',
    },
  });
  console.log(`✔ agent: ${agent.email}`);

  const regionMap = new Map(
    (await prisma.region.findMany({ select: { id: true, slug: true } })).map((r) => [r.slug, r.id]),
  );
  const featureMap = new Map(
    (await prisma.feature.findMany({ select: { id: true, key: true } })).map((f) => [f.key, f.id]),
  );

  let count = 0;

  for (let idx = 0; idx < LISTING_SPECS.length; idx++) {
    const spec = LISTING_SPECS[idx]!;
    const rng = seededRng(idx * 31337 + 1);

    const regionDef = REGION_DATA.find((r) => r.slug === spec.regionSlug)!;
    const meta = PROP_META[spec.propertyType]!;
    const currency = spec.currency ?? 'EUR';

    const area = rng.int(...meta.areaRange);
    const beds = meta.bedroomOptions.length ? rng.pick(meta.bedroomOptions) : 0;
    const baths = meta.bathroomOptions.length ? rng.pick(meta.bathroomOptions) : 0;
    const floor = ['LAND', 'GARAGE'].includes(spec.propertyType) ? 0 : rng.int(0, 10);
    const floors = floor + rng.int(1, 4);
    const yearBuilt = rng.int(1990, 2024);

    const neighborhood = rng.pick(regionDef.neighborhoods);
    const street = rng.pick(regionDef.streets);
    const addressLine = `${street}, ${neighborhood}`;

    const lat = regionDef.centroidLat + (rng.next() - 0.5) * 0.04;
    const lng = regionDef.centroidLng + (rng.next() - 0.5) * 0.05;

    // Price in EUR, then convert to ALL if needed (1 EUR ≈ 120 ALL)
    const rawEur =
      spec.listingType === 'SALE'
        ? Math.round(
            ((meta.basePriceEurSale + area * meta.pricePerM2Sale) *
              regionDef.priceMultiplier *
              (0.85 + rng.next() * 0.3)) /
              1000,
          ) * 1000
        : Math.round(
            (meta.basePriceEurRent * regionDef.priceMultiplier * (0.85 + rng.next() * 0.3)) / 10,
          ) * 10;
    const priceMinor =
      currency === 'ALL' ? BigInt(Math.round(rawEur * 120) * 100) : BigInt(rawEur * 100);

    const title = meta.titleFn(regionDef.label, beds, area, spec.listingType);
    const description = rng.pick(meta.descFns)(regionDef.label, beds, area);
    const slug = toSlug(title) + '-' + String(idx).padStart(3, '0');

    const featureKeys = rng.sample(
      meta.featurePool,
      rng.int(2, Math.min(5, meta.featurePool.length)),
    );

    const photoPool = PHOTO_POOLS[spec.propertyType] ?? PHOTO_POOLS['APARTMENT']!;
    const numImages = rng.int(...meta.numImages);
    const photos = rng.sample([...photoPool], numImages);

    const listing = await prisma.listing.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        ownerId: agent.id,
        status: 'PUBLISHED',
        listingType: spec.listingType,
        propertyType: spec.propertyType as any,
        title,
        description,
        priceMinor,
        currency,
        rentPeriod: spec.listingType === 'RENT' ? 'MONTH' : null,
        areaM2: area,
        bedrooms: beds || null,
        bathrooms: baths || null,
        floor,
        floorsTotal: floors,
        yearBuilt: ['LAND', 'GARAGE'].includes(spec.propertyType) ? null : yearBuilt,
        regionId: regionMap.get(spec.regionSlug)!,
        addressLine,
        lat,
        lng,
        publishedAt: new Date(Date.now() - rng.int(0, 60) * 24 * 60 * 60 * 1000),
      },
    });

    const existingImages = await prisma.listingImage.count({ where: { listingId: listing.id } });
    if (existingImages === 0) {
      await prisma.listingImage.createMany({
        data: photos.map((url, pos) => ({
          listingId: listing.id,
          url,
          width: 1200,
          height: 800,
          position: pos,
          alt: title,
        })),
      });
    }

    if (featureKeys.length > 0) {
      await prisma.listingFeature.createMany({
        skipDuplicates: true,
        data: featureKeys
          .map((k) => featureMap.get(k))
          .filter(Boolean)
          .map((fid) => ({ listingId: listing.id, featureId: fid! })),
      });
    }

    count++;
  }

  console.log(`✔ ${count} listings with images`);
  console.log('✅ Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
