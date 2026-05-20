/* =============================================
   NAAYA Room Acoustic Simulator — Material Library
   Absorption coefficients (α) at 125/250/500/1k/2k/4k Hz
   Sources: industry-standard published values, simplified for v1.
   Each material declares `surfaces`: which surfaces it can be applied to.
   ============================================= */

const MATERIALS = [
  {
    id: 'concrete',
    name: 'Painted Concrete / Plaster',
    category: 'Hard surface (default)',
    surfaces: ['ceiling', 'wall', 'floor'],
    alpha: { 125: 0.02, 250: 0.02, 500: 0.03, 1000: 0.04, 2000: 0.05, 4000: 0.05 },
    swatch: 'assets/materials/concrete.svg',
    isDefault: true
  },
  {
    id: 'fabric-wrapped',
    name: 'Fabric-Wrapped Panel',
    category: 'Wall absorber',
    surfaces: ['wall'],
    alpha: { 125: 0.15, 250: 0.45, 500: 0.85, 1000: 0.95, 2000: 0.90, 4000: 0.85 },
    swatch: 'assets/materials/fabric-wrapped.svg'
  },
  {
    id: 'polyester-fiber',
    name: 'Polyester Fiber Panel',
    category: 'Wall / Ceiling absorber',
    surfaces: ['wall', 'ceiling'],
    alpha: { 125: 0.10, 250: 0.30, 500: 0.70, 1000: 0.85, 2000: 0.85, 4000: 0.80 },
    swatch: 'assets/materials/polyester-fiber.svg'
  },
  {
    id: 'wood-acoustic',
    name: 'Wood Acoustic Panel (grooved/perforated)',
    category: 'Wall / Ceiling absorber',
    surfaces: ['wall', 'ceiling'],
    alpha: { 125: 0.20, 250: 0.55, 500: 0.75, 1000: 0.85, 2000: 0.70, 4000: 0.55 },
    swatch: 'assets/materials/wood-acoustic.svg'
  },
  {
    id: 'mineral-wool',
    name: 'Mineral Wool Ceiling Board',
    category: 'Ceiling absorber',
    surfaces: ['ceiling'],
    alpha: { 125: 0.40, 250: 0.55, 500: 0.70, 1000: 0.85, 2000: 0.85, 4000: 0.80 },
    swatch: 'assets/materials/mineral-wool.svg'
  },
  {
    id: 'aluminum-honeycomb',
    name: 'Aluminum Honeycomb Composite',
    category: 'Ceiling / Wall',
    surfaces: ['ceiling', 'wall'],
    alpha: { 125: 0.30, 250: 0.50, 500: 0.65, 1000: 0.70, 2000: 0.65, 4000: 0.60 },
    swatch: 'assets/materials/aluminum-honeycomb.svg'
  },
  {
    id: 'nylon-carpet',
    name: 'Nylon Carpet',
    category: 'Floor absorber',
    surfaces: ['floor'],
    alpha: { 125: 0.05, 250: 0.10, 500: 0.25, 1000: 0.45, 2000: 0.65, 4000: 0.70 },
    swatch: 'assets/materials/nylon-carpet.svg'
  },
  {
    id: 'auditorium-seating',
    name: 'Auditorium Seating (upholstered, occupied)',
    category: 'Furniture absorber',
    surfaces: ['furniture'],
    alpha: { 125: 0.55, 250: 0.75, 500: 0.85, 1000: 0.90, 2000: 0.90, 4000: 0.85 },
    swatch: 'assets/materials/auditorium-seating.svg'
  }
];

/* Recommended RT60 targets per space function (mid-frequency, 500-1kHz avg).
   Some functions scale with log10(V) per ISO/auditorium standards. */
const SPACE_FUNCTIONS = [
  { id: 'auditorium',   name: 'Multi-purpose Auditorium', rtTarget: (V) => 0.32 * Math.log10(V) + 0.17,  rtRange: [1.4, 1.8], video: 'assets/sim-videos/theatre.mp4' },
  { id: 'conference',   name: 'Conference Room',          rtTarget: () => 0.7,                          rtRange: [0.6, 0.8], video: 'assets/sim-videos/conference.mp4' },
  { id: 'theatre',      name: 'Theatre / Performance',    rtTarget: (V) => 0.30 * Math.log10(V) - 0.05, rtRange: [1.0, 1.4], video: 'assets/sim-videos/theatre.mp4' },
  { id: 'sports',       name: 'Sports Hall',              rtTarget: (V) => 0.35 * Math.log10(V) + 0.30, rtRange: [1.5, 2.0], video: 'assets/sim-videos/sports.mp4' },
  { id: 'school',       name: 'School / Classroom',       rtTarget: () => 0.5,                          rtRange: [0.4, 0.6], video: 'assets/sim-videos/school.mp4' },
  { id: 'banquet',      name: 'Banquet Hall',             rtTarget: (V) => 0.28 * Math.log10(V) + 0.05, rtRange: [1.0, 1.3], video: 'assets/sim-videos/banquet.mp4' },
  { id: 'office',       name: 'Office',                   rtTarget: () => 0.6,                          rtRange: [0.5, 0.7], video: 'assets/sim-videos/office.mp4' },
  { id: 'studio',       name: 'Recording Studio',         rtTarget: () => 0.4,                          rtRange: [0.3, 0.5], video: 'assets/sim-videos/studio.mp4' }
];

const FREQUENCY_BANDS = [125, 250, 500, 1000, 2000, 4000];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MATERIALS, SPACE_FUNCTIONS, FREQUENCY_BANDS };
}
