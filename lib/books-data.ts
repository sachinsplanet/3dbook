export type RightsStatus =
  | 'Public Domain'
  | 'Original Work'
  | 'CC BY-SA 4.0'
  | 'Licensed Permission';

export type BookVisibility = 'published' | 'draft' | 'removed';

export interface BookPageContent {
  pageNumber: number;
  chapterTitle?: string;
  heading: string;
  subHeading?: string;
  bodyParagraphs: string[];
  pullQuote?: string;
  figureCaption?: string;
  diagramType?:
    | 'arch-vault'
    | 'botanical-stem'
    | 'orbital-ellipse'
    | 'swiss-grid'
    | 'bathymetric-chart'
    | 'escapement-gear';
  footnote?: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  description: string;
  category:
    | 'Architecture'
    | 'Natural History'
    | 'Science'
    | 'Typography'
    | 'Cartography'
    | 'Horology'
    | 'Custom Embed';
  language: string;
  rights_status: RightsStatus;
  visibility: BookVisibility;
  page_count: number;
  created_at: string;
  published_at: string | null;
  accession_number: string;
  cover_palette: {
    bg: string;
    surface: string;
    ink: string;
    accent: string;
    motif:
      | 'arch'
      | 'botanical'
      | 'celestial'
      | 'swiss'
      | 'nautical'
      | 'horology'
      | 'embed';
  };
  /** Optional external 3D flipbook iframe URL (e.g., Heyzine, FlipHTML5, Issuu, AnyFlip, or self-hosted embed) */
  embed_url?: string;
  /** Optional IndexedDB key or data URL for an uploaded PDF document */
  pdf_storage_key?: string;
  pdf_filename?: string;
  /** Structured archival pages for immediate zero-404 rendering */
  pages: BookPageContent[];
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: 'reader' | 'admin';
  created_at: string;
}

export interface ReadingProgress {
  user_id: string;
  book_id: string;
  book_slug: string;
  current_page: number;
  total_pages: number;
  updated_at: string;
}

export interface BookmarkRecord {
  user_id: string;
  book_id: string;
  created_at: string;
}

export interface BookRequest {
  id: string;
  title: string;
  author: string;
  category: string;
  requester_name: string;
  requester_email: string;
  reference_url?: string;
  notes?: string;
  status: 'pending' | 'reviewed';
  created_at: string;
}

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'bk-arch-01',
    slug: 'the-architecture-of-light',
    title: 'The Architecture of Light',
    author: 'Clara Vance',
    description:
      'A monograph examining how travertine mass, ocular apertures, and seasonal solar angles shape contemplative civic interiors.',
    category: 'Architecture',
    language: 'English',
    rights_status: 'Original Work',
    visibility: 'published',
    page_count: 10,
    created_at: '2026-02-14T10:00:00Z',
    published_at: '2026-02-15T09:00:00Z',
    accession_number: 'ACC. 2026.01.A',
    cover_palette: {
      bg: '#EBE5DC',
      surface: '#DFD7CA',
      ink: '#1C1917',
      accent: '#9A3412',
      motif: 'arch',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'MONOGRAPH I · ARCHITECTURAL OPTICS',
        heading: 'The Architecture of Light',
        subHeading: 'Dialogues Between Travertine Mass and Solar Geometry',
        bodyParagraphs: [
          'During the mid-century transition, natural light ceased to be treated merely as an illuminant applied after structural completion. Instead, aperture geometry became the primary generative instrument of spatial boundary.',
          'When a masonry wall is incised at a calibrated oblique angle, the entering beam acts as a tangible tectonic column—registering the rotation of the earth across rough-hewn stone surfaces.',
        ],
        figureCaption: 'Fig. 1.1 — Meridional section of the Zurich Ocular Pavilion (1:50 scale).',
        diagramType: 'arch-vault',
        footnote: '1. Vance, C. Notes on Civic Luminance, ETH Archival Press, 2026.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'CHAPTER I · APERTURE & MASS',
        heading: '01. The Calibrated Reveal',
        bodyParagraphs: [
          'A window cut perpendicular to a facade produces harsh glare, flattening visual perception. By splaying the limestone reveal inward at 32 degrees, the masonry itself becomes a secondary diffuser.',
          'Light bounces twice across honed travertine crystals before reaching the reader’s eye, reducing contrast ratios from 1:400 to a tranquil 1:18 suitable for prolonged study.',
        ],
        pullQuote:
          '“Stone does not obstruct light; rather, it slows light down until the human eye can inhabit its gradient.”',
        figureCaption: 'Fig. 1.2 — Photometric decay curve across a 600mm splayed limestone reveal.',
      },
      {
        pageNumber: 3,
        chapterTitle: 'CHAPTER I · APERTURE & MASS',
        heading: '02. Vaulted Clerestory Reflection',
        bodyParagraphs: [
          'In the northern reading rooms, parabolic barrel vaults act as overhead reflectors. Direct solar radiation is intercepted by exterior bronze baffles and redirected upward onto lime-plastered shells.',
          'The resulting illumination is shadowless at desk height while preserving a sense of atmospheric altitude above.',
        ],
        diagramType: 'arch-vault',
        figureCaption: 'Fig. 1.3 — Cross-vault ray tracing at 47° North latitude, winter solstice.',
      },
      {
        pageNumber: 4,
        chapterTitle: 'CHAPTER II · MATERIAL ALBEDO',
        heading: '03. Honed vs. Riven Surfaces',
        bodyParagraphs: [
          'Surface roughness governs the emotional temperature of an interior. Polished marble produces specular mirror highlights that unsettle peripheral vision, whereas bush-hammered limestone scatters photons isotropically.',
          'By alternating honed bands with riven recesses, a wall records subtle barometric shifts in sky overcast throughout the afternoon.',
        ],
        footnote: '2. Measured reflectance values: Roman Travertine (0.62), Valser Quartzite (0.28).',
      },
      {
        pageNumber: 5,
        chapterTitle: 'CHAPTER II · MATERIAL ALBEDO',
        heading: '04. The Cloister Threshold',
        bodyParagraphs: [
          'Transitioning from an open courtyard into a sanctuary requires at least four seconds of pupillary adaptation. The colonnade serves not merely as rain shelter, but as a stepped optical chamber.',
          'Each bay reduces foot-candle intensity by half, preparing the visitor for the quiet luminosity of the inner library.',
        ],
        pullQuote:
          '“Every threshold is an instrument of optical decompression between street and page.”',
        diagramType: 'arch-vault',
      },
      {
        pageNumber: 6,
        chapterTitle: 'CHAPTER III · TEMPORAL CADENCE',
        heading: '05. Equinox Alignment',
        bodyParagraphs: [
          'At solar noon on the vernal equinox, the west oculus casts a 140-millimeter disc of light directly onto the brass meridian line inlaid into the basalt floor.',
          'Rather than static monumentality, the building operates as an inhabited sundial—anchoring daily reading habits within astronomical time.',
        ],
        figureCaption: 'Fig. 3.1 — Meridian brass bar displacement across 365 solar days.',
      },
      {
        pageNumber: 7,
        chapterTitle: 'CHAPTER III · TEMPORAL CADENCE',
        heading: '06. Acoustic & Optical Quietude',
        bodyParagraphs: [
          'Remarkably, the geometric baffles required to diffuse zenithal daylight also break up standing acoustic waves between parallel masonry walls.',
          'Deep coffered skylights trap high-frequency reverberation, binding visual serenity and acoustic stillness into a single structural assembly.',
        ],
        diagramType: 'arch-vault',
      },
      {
        pageNumber: 8,
        chapterTitle: 'CHAPTER IV · CASE STUDIES',
        heading: '07. The Basel Reading Room',
        bodyParagraphs: [
          'Constructed in 2024 from reclaimed Jura limestone, the Basel Reading Room houses forty oak carrels arranged around a sunken courtyard well.',
          'No artificial fixtures are installed in the ceiling plane; evening illumination rises solely from low-voltage brass task lamps integrated into each desk spine.',
        ],
        pullQuote:
          '“When the ceiling remains dark at dusk, the room expands into the night sky.”',
      },
      {
        pageNumber: 9,
        chapterTitle: 'CHAPTER IV · CASE STUDIES',
        heading: '08. Structural Proportions & Section Math',
        bodyParagraphs: [
          'The sectional ratio of the reading hall follows a 3:5:8 harmonic progression. Sill height sits at 900mm, lintel height at 4,500mm, and vault crown at 7,200mm.',
          'These proportions ensure that a seated reader at the center of the hall always perceives at least 18 degrees of unobstructed sky dome.',
        ],
        diagramType: 'arch-vault',
        figureCaption: 'Fig. 4.2 — Sectional harmonic grid (900mm module).',
      },
      {
        pageNumber: 10,
        chapterTitle: 'COLOPHON & ARCHIVAL NOTES',
        heading: '09. Summary of Photometric Principles',
        bodyParagraphs: [
          'First: Never admit direct sunlight onto a reading surface without at least one intermediary mineral reflection. Second: Frame views of foliage or sky separately from zenithal illumination apertures.',
          'Set in Cormorant Garamond and Plus Jakarta Sans. Published under Original Work authorization for the 3DBook Digital Archive.',
        ],
        footnote: 'Colophon: Verified 10-page monograph edition. Rights cleared for digital distribution.',
      },
    ],
  },
  {
    id: 'bk-bot-02',
    slug: 'illustrations-of-the-alpine-flora',
    title: 'Illustrations of the Alpine Flora',
    author: 'Heinrich von Meyer',
    description:
      'Public-domain botanical plates and morphological field notes documenting high-altitude vascular plants of the Graubünden Alps.',
    category: 'Natural History',
    language: 'English',
    rights_status: 'Public Domain',
    visibility: 'published',
    page_count: 8,
    created_at: '2026-02-18T14:20:00Z',
    published_at: '2026-02-19T08:00:00Z',
    accession_number: 'ACC. 1894.12.B',
    cover_palette: {
      bg: '#EAE8E0',
      surface: '#DCE0D5',
      ink: '#1B241E',
      accent: '#14532D',
      motif: 'botanical',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'FLORA HELVETICA · FOLIO IV',
        heading: 'Illustrations of the Alpine Flora',
        subHeading: 'Specimens Collected Above 2,200 Meters Elevation',
        bodyParagraphs: [
          'High above the coniferous timberline, vascular plants confront intense ultraviolet radiation, desiccating winds, and a growing season compressed into seven brief weeks.',
          'Rather than vertical stature, alpine species invest in dense cushion rosettes, silver trichome pubescence, and saturated anthocyanin pigments.',
        ],
        diagramType: 'botanical-stem',
        figureCaption: 'Plate I — Gentiana acaulis (Stemless Gentian), Engadine Valley, 2,410m.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'SECTION I · GENTIANACEAE',
        heading: '01. Gentiana verna (Spring Gentian)',
        bodyParagraphs: [
          'Immediately following snowmelt in late May, Gentiana verna unfurls a five-lobed corolla of extraordinary cobalt intensity. The petals close rapidly when cloud shadows pass across the scree slope.',
          'Root systems extend up to forty times the height of the aerial stem, anchoring the plant within shifting dolomitic gravel.',
        ],
        pullQuote:
          '“The smaller the leaf above the frost, the deeper the taproot beneath the stone.”',
      },
      {
        pageNumber: 3,
        chapterTitle: 'SECTION I · GENTIANACEAE',
        heading: '02. Leontopodium nivale (Alpine Edelweiss)',
        bodyParagraphs: [
          'The star-shaped bracts of Leontopodium nivale are covered in thousands of air-filled woolly hairs that scatter harmful ultraviolet wavelengths while trapping warm boundary air around the florets.',
          'Under microscopic inspection, each fiber exhibits striated ridges that refract moisture droplets during morning fog.',
        ],
        diagramType: 'botanical-stem',
        figureCaption: 'Plate II — Bract trichome cross-section (120x magnification).',
      },
      {
        pageNumber: 4,
        chapterTitle: 'SECTION II · SAXIFRAGACEAE',
        heading: '03. Saxifraga oppositifolia (Purple Saxifrage)',
        bodyParagraphs: [
          'Recorded at elevations exceeding 3,800 meters on the Dom massif, Saxifraga oppositifolia is among the highest-dwelling angiosperms in Europe.',
          'Its imbricate leaves secrete tiny crusts of calcium carbonate at their margins, literally binding the plant to limestone crevices.',
        ],
        footnote: 'Field Note 14: Collected on north-west gneiss ledges, July 18, 1893.',
      },
      {
        pageNumber: 5,
        chapterTitle: 'SECTION II · SAXIFRAGACEAE',
        heading: '04. Soldanella alpina (Alpine Snowbell)',
        bodyParagraphs: [
          'Through respiration of stored starches in its leathery evergreen leaves, Soldanella alpina generates sufficient metabolic warmth to melt a cylindrical chimney through frozen spring snow.',
          'Its fringed violet bell emerges into sunlight while its roots remain encased in ice.',
        ],
        diagramType: 'botanical-stem',
      },
      {
        pageNumber: 6,
        chapterTitle: 'SECTION III · RANUNCULACEAE',
        heading: '05. Ranunculus glacialis (Glacier Crowfoot)',
        bodyParagraphs: [
          'Unlike lowland buttercups with yellow petals, the Glacier Crowfoot opens pure white and flushes deep carmine rose after pollination—signaling to high-altitude Diptera which blossoms still hold nectar.',
          'Succulent leaf tissues contain cryoprotective sugars that prevent intracellular ice crystal formation at minus ten degrees Celsius.',
        ],
        pullQuote:
          '“Color in the high scree is never decorative; it is a thermodynamic and ecological ledger.”',
      },
      {
        pageNumber: 7,
        chapterTitle: 'SECTION IV · ALTITUDINAL ZONATION',
        heading: '06. Hypsometric Distribution Table',
        bodyParagraphs: [
          'Between 1,800m (Subalpine Krummholz) and 3,200m (Nival Zone), species richness declines linearly while endemism rises sharply.',
          'Isolated mountain peaks function as terrestrial archipelagos, preserving glacial relict populations since the Pleistocene retreat.',
        ],
        diagramType: 'botanical-stem',
        figureCaption: 'Plate III — Zonation profile from Chur (595m) to Piz Bernina (4,049m).',
      },
      {
        pageNumber: 8,
        chapterTitle: 'INDEX & HERBARIUM PROVENANCE',
        heading: '07. Archival Preservation Notes',
        bodyParagraphs: [
          'Digitized from the 1894 Basel Lithographic Folio. All copperplate engravings and botanical descriptions are in the global Public Domain.',
          'Prepared for 3DBook interactive spread inspection.',
        ],
        footnote: 'Public Domain Status verified under Berne & US pre-1929 statutes.',
      },
    ],
  },
  {
    id: 'bk-sci-03',
    slug: 'treatise-on-celestial-mechanics',
    title: 'Treatise on Celestial Mechanics',
    author: 'Pierre-Simon Laplace',
    description:
      'Analytical exposition of planetary perturbations, orbital resonance, and gravitational equilibrium across the solar system.',
    category: 'Science',
    language: 'English',
    rights_status: 'Public Domain',
    visibility: 'published',
    page_count: 8,
    created_at: '2026-02-22T11:00:00Z',
    published_at: '2026-02-23T09:00:00Z',
    accession_number: 'ACC. 1825.09.S',
    cover_palette: {
      bg: '#E8EBF0',
      surface: '#D8DFEA',
      ink: '#0F172A',
      accent: '#1E3A8A',
      motif: 'celestial',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'MÉCANIQUE CÉLESTE · BOOK II',
        heading: 'Treatise on Celestial Mechanics',
        subHeading: 'On the Law of Universal Gravitation and the Motion of the Centers of Gravity',
        bodyParagraphs: [
          'The phenomena of the planetary movements present to geometers the grandest problem of analytical mechanics: to determine the trajectory of each body when acted upon simultaneously by the Sun and by every neighboring planet.',
          'Although elliptical elements vary slowly across centuries, the mean distances from the primary focus remain invariant to the first and second orders of perturbing masses.',
        ],
        diagramType: 'orbital-ellipse',
        figureCaption: 'Fig. 1 — Osculating ellipse and radius vector sweep in equal intervals of time.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'CHAPTER I · ORBITAL ELEMENTS',
        heading: '01. Conservation of Vis Viva',
        bodyParagraphs: [
          'When a system of bodies is subject only to mutual gravitational attraction inversely proportional to the square of distance, the sum of products of each mass by the square of its velocity depends solely on the coordinates of position.',
          'From this integral arises the stability of the major axes of the planetary orbits.',
        ],
        pullQuote:
          '“Amidst the secular oscillations of eccentricity and inclination, the mean motions of the planets preserve a perpetual harmony.”',
      },
      {
        pageNumber: 3,
        chapterTitle: 'CHAPTER II · SECULAR INEQUALITIES',
        heading: '02. The Great Inequality of Jupiter and Saturn',
        bodyParagraphs: [
          'For two centuries astronomers were perplexed by an apparent acceleration in the motion of Jupiter accompanied by a retardation in Saturn. Five times the mean motion of Saturn very nearly equals twice that of Jupiter.',
          'This near-commensurability introduces a long-period inequality completing its cycle in 918 years, restoring both orbits without external intervention.',
        ],
        diagramType: 'orbital-ellipse',
        figureCaption: 'Fig. 2 — 5:2 Conjunction resonance geometry of Jupiter and Saturn.',
      },
      {
        pageNumber: 4,
        chapterTitle: 'CHAPTER III · LAPLACE RESONANCE',
        heading: '03. The Three Inner Satellites of Jupiter',
        bodyParagraphs: [
          'The mean longitude of Io minus three times that of Europa, plus twice that of Ganymede, is rigorously equal to 180 degrees.',
          'Consequently, the three satellites can never experience a simultaneous triple eclipse—a geometric lock maintained by mutual tidal and gravitational coupling.',
        ],
        footnote: 'Theorem IV: n₁ - 3n₂ + 2n₃ = 0, verified by Delambre’s eclipse tables.',
      },
      {
        pageNumber: 5,
        chapterTitle: 'CHAPTER IV · SPHEROIDAL FIGURES',
        heading: '04. Equilibrium of Rotating Fluid Masses',
        bodyParagraphs: [
          'A homogeneous fluid mass rotating about a fixed axis assumes the figure of an oblate ellipsoid of revolution. The ratio of polar flattening to centrifugal force at the equator is bounded by precise potential integrals.',
          'Hence the oblateness of Jupiter is immediately discernible through telescopic micrometers.',
        ],
        diagramType: 'orbital-ellipse',
      },
      {
        pageNumber: 6,
        chapterTitle: 'CHAPTER V · LUNAR THEORY',
        heading: '05. Secular Acceleration of the Moon',
        bodyParagraphs: [
          'Halley first remarked that ancient Chaldean eclipses indicated a slower lunar motion than that observed in modern centuries. This acceleration arises from the slow diminution of the eccentricity of the Earth’s own orbit.',
          'When the Earth’s eccentricity begins to increase again in future millennia, the lunar acceleration will reverse into a gentle retardation.',
        ],
        pullQuote:
          '“Nature links the minutest variations of the lunar perigee to the grand secular cycles of the terrestrial ecliptic.”',
      },
      {
        pageNumber: 7,
        chapterTitle: 'CHAPTER VI · TIDAL OSCILLATIONS',
        heading: '06. Dynamic Theory of the Tides',
        bodyParagraphs: [
          'Unlike a static equilibrium tide, the ocean responds as a forced spherical shell oscillating under semi-diurnal solar and lunar potentials.',
          'Coastal depth and basin resonance govern the phase lag between lunar transit and high water at Brest.',
        ],
        diagramType: 'orbital-ellipse',
      },
      {
        pageNumber: 8,
        chapterTitle: 'ARCHIVE COLOPHON',
        heading: '07. Notes on the English Translation',
        bodyParagraphs: [
          'Adapted from the public-domain Bowditch translation of Traité de Mécanique Céleste. Mathematical diagrams reconstructed in vector form for high-DPI page flipping.',
          'Authorized for open scholarly access on 3DBook.',
        ],
        footnote: 'Public Domain Archival Edition · Verified 8-page spread.',
      },
    ],
  },
  {
    id: 'bk-typ-04',
    slug: 'principles-of-swiss-typographic-systems',
    title: 'Principles of Swiss Typographic Systems',
    author: 'Lukas Herzog',
    description:
      'A constructive manual on modular grids, asymmetric balance, tabular numeral alignment, and objective typographic hierarchy.',
    category: 'Typography',
    language: 'English',
    rights_status: 'CC BY-SA 4.0',
    visibility: 'published',
    page_count: 8,
    created_at: '2026-03-01T09:30:00Z',
    published_at: '2026-03-02T12:00:00Z',
    accession_number: 'ACC. 2026.04.T',
    cover_palette: {
      bg: '#F4F1EA',
      surface: '#E6E1D6',
      ink: '#111111',
      accent: '#B91C1C',
      motif: 'swiss',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'SYSTEMATIC TYPOGRAPHY · MANUAL 04',
        heading: 'Principles of Swiss Typographic Systems',
        subHeading: 'Mathematical Proportions in Editorial Grid Architecture',
        bodyParagraphs: [
          'The typographic grid is an organizational regulator, not a mechanical cage. By dividing the page surface into modular fields separated by constant baseline intervals, the designer achieves clarity across diverse content types.',
          'Objective typography subordinates personal ornament to the immediate legibility of the author’s thought.',
        ],
        diagramType: 'swiss-grid',
        figureCaption: 'Fig. 1 — 12-column asymmetric spread with 4-unit vertical hangline.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'PART I · THE MODULAR FIELD',
        heading: '01. Calculating Margin Proportions',
        bodyParagraphs: [
          'When two pages meet at a central binding gutter, the inner margin experiences optical foreshortening due to page curvature. Therefore, the outer and bottom margins must provide generous breathing space for the reader’s thumbs.',
          'A progressive margin ratio of 2 : 3 : 4 : 6 (inner : top : outer : bottom) anchors the text block harmoniously within the trim size.',
        ],
        pullQuote:
          '“Whitespace is not passive background; it is the active structural tension that holds type in place.”',
      },
      {
        pageNumber: 3,
        chapterTitle: 'PART I · THE MODULAR FIELD',
        heading: '02. Measure, Leading, and Rhythm',
        bodyParagraphs: [
          'An optimal reading column contains between 60 and 72 characters per line. Shorter measures induce choppy eye saccades, while excessively wide lines cause the eye to lose its horizontal return anchor.',
          'Baseline increments must lock body text, captions, and folios to a shared vertical harmonic.',
        ],
        diagramType: 'swiss-grid',
        figureCaption: 'Fig. 2 — Baseline lock between 11/15pt body prose and 8.5/10pt marginalia.',
      },
      {
        pageNumber: 4,
        chapterTitle: 'PART II · ASYMMETRIC HIERARCHY',
        heading: '03. Contrast of Scale vs. Weight',
        bodyParagraphs: [
          'Beginner layouts rely on five or six competing type sizes. Masterful Swiss typography restricts a spread to three strict tiers: display headline, reading prose, and subdued archival metadata.',
          'Position and left-aligned hanglines communicate hierarchy more quietly and powerfully than boldface shouting.',
        ],
        footnote: 'Rule 4: Never wrap static metadata in decorative pill enclosures.',
      },
      {
        pageNumber: 5,
        chapterTitle: 'PART II · ASYMMETRIC HIERARCHY',
        heading: '04. Tabular Numerals in Technical Matter',
        bodyParagraphs: [
          'In schedules, catalogues, and scientific tables, proportional numerals destroy vertical scanning because the digit 1 occupies less width than the digit 8.',
          'Enforcing monospaced or tabular-numeral OpenType features aligns decimal points and column totals with architectural rigor.',
        ],
        diagramType: 'swiss-grid',
      },
      {
        pageNumber: 6,
        chapterTitle: 'PART III · PHOTOGRAPHY & CAPTIONS',
        heading: '05. Integrating Halftones and Diagrams',
        bodyParagraphs: [
          'Images should align decisively with grid module boundaries or bleed intentionally to the trim edge—never float timidly with arbitrary margins.',
          'Figure captions sit flush left beneath or beside the plate, separated by a quiet typographic dash.',
        ],
        pullQuote:
          '“Grid discipline liberates the eye to focus on content rather than decoding layout novelty.”',
      },
      {
        pageNumber: 7,
        chapterTitle: 'PART IV · DIGITAL SPREADS',
        heading: '06. Translating Print Grids to Screen Viewports',
        bodyParagraphs: [
          'On responsive screens, fixed millimeter dimensions become fluid viewport ratios. Yet the core relationship between column width, gutter, and outer padding remains unchanged.',
          'In 3DBook, preserving the page aspect ratio ensures that the designer’s original spread geometry survives across phones and studio monitors.',
        ],
        diagramType: 'swiss-grid',
      },
      {
        pageNumber: 8,
        chapterTitle: 'LICENSE & COLOPHON',
        heading: '07. Creative Commons Attribution',
        bodyParagraphs: [
          'Published under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) by Lukas Herzog, Zurich School of Design.',
          'Formatted for 3DBook interactive page-flip inspection.',
        ],
        footnote: 'CC BY-SA 4.0 · Freely redistributable with attribution.',
      },
    ],
  },
  {
    id: 'bk-map-05',
    slug: 'the-pelagic-atlas-charts-of-the-north-sea',
    title: 'The Pelagic Atlas: Charts of the North Sea',
    author: 'Søren Lindqvist',
    description:
      'Bathymetric soundings, tidal stream vectors, and historical lighthouse triangulations across the Skagerrak and Norwegian Trench.',
    category: 'Cartography',
    language: 'English',
    rights_status: 'Public Domain',
    visibility: 'published',
    page_count: 8,
    created_at: '2026-03-08T16:00:00Z',
    published_at: '2026-03-09T10:00:00Z',
    accession_number: 'ACC. 1908.03.C',
    cover_palette: {
      bg: '#ECE9E2',
      surface: '#DDD8CD',
      ink: '#18222B',
      accent: '#1D4ED8',
      motif: 'nautical',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'HYDROGRAPHIC FOLIO · SKAGERRAK',
        heading: 'The Pelagic Atlas',
        subHeading: 'Bathymetric Contours and Lighthouse Sectors of the Northern Seas',
        bodyParagraphs: [
          'Beneath the shallow continental shelf of the Dogger Bank, the seabed plunges abruptly into the Norwegian Trench—a submarine fjord reaching depths of 700 meters off Arendal.',
          'Lead-line soundings and dredge samples reveal a landscape of submerged glacial moraines, shell banks, and cold deep-water currents.',
        ],
        diagramType: 'bathymetric-chart',
        figureCaption: 'Chart I — Isobars of depth (in fathoms) across the Skagerrak Sill.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'SECTION I · BATHYMETRY',
        heading: '01. The Dogger Littoral Shoal',
        bodyParagraphs: [
          'Rising to within fifteen meters of the surface, the Dogger Bank marks an ancient post-glacial island bridge. Swells arriving from the North Atlantic steepen dramatically as they feel the rising sandbars.',
          'Mariners navigating in fog can identify the bank’s western edge solely by the sudden transition from fine grey mud to coarse speckled quartz sand on the tallow-armed lead.',
        ],
        pullQuote:
          '“To the hydrographer, the sea surface is merely a shifting veil over an enduring submarine topography.”',
      },
      {
        pageNumber: 3,
        chapterTitle: 'SECTION II · PHAROLOGY',
        heading: '02. First-Order Fresnel Optics at Lindesnes',
        bodyParagraphs: [
          'Rotating on a frictionless bath of liquid mercury, the dioptric glass prisms of the Lindesnes lantern concentrate the light of a single paraffin vapor burner into four sweeping beams visible at twenty-two nautical miles.',
          'By timing the eclipse interval with a deck watch, the navigator obtains an immediate line of position.',
        ],
        diagramType: 'bathymetric-chart',
        figureCaption: 'Chart II — Occulting white and red sector bearings off Cape Lindesnes.',
      },
      {
        pageNumber: 4,
        chapterTitle: 'SECTION III · TIDAL STREAMS',
        heading: '03. The Baltic Outflow & Kattegat Wedge',
        bodyParagraphs: [
          'Brackish surface water flowing northward from the Baltic Sea rides atop a dense, saline counter-current entering from the Atlantic.',
          'Where these two water masses shear against one another around Skagen Grenen, standing rip waves form even in calm weather.',
        ],
        footnote: 'Hydrographic Station 42: Surface salinity 21‰; 40m depth salinity 34.8‰.',
      },
      {
        pageNumber: 5,
        chapterTitle: 'SECTION IV · COMPASS DEVIATION',
        heading: '04. Secular Magnetic Variation',
        bodyParagraphs: [
          'Every engraved compass rose on these charts carries two concentric rings: the outer oriented to True North, and the inner tilted to Magnetic North for the epoch 1908.0.',
          'Local iron-ore deposits along the Telemark coast require careful cross-bearing verification.',
        ],
        diagramType: 'bathymetric-chart',
      },
      {
        pageNumber: 6,
        chapterTitle: 'SECTION V · METEOROLOGY',
        heading: '05. Barometric Gradients and Storm Tracks',
        bodyParagraphs: [
          'When the mercury falls more than four millimeters within three hours while the wind backs from southwest to south-southeast, a deep cyclonic depression is entering the Fair Isle passage.',
          'Harbor storm-warning masts hoist the black cone point-downward upon telegraph notice from Bergen.',
        ],
        pullQuote:
          '“A reliable chart and a disciplined barometer have saved more hulls than heavy anchors.”',
      },
      {
        pageNumber: 7,
        chapterTitle: 'SECTION VI · TRIGONOMETRIC SURVEY',
        heading: '06. Coastal Triangulation Network',
        bodyParagraphs: [
          'Before a single sounding is plotted offshore, primary granite cairns along the headlands are linked by precision theodolite triangles.',
          'Each hydrographic launch fixes its position by simultaneous sextant angles between three shore beacons.',
        ],
        diagramType: 'bathymetric-chart',
      },
      {
        pageNumber: 8,
        chapterTitle: 'ARCHIVAL PROVENANCE',
        heading: '07. Royal Hydrographic Archive Note',
        bodyParagraphs: [
          'Reproduced from the 1908 Christiania Maritime Survey sheets. Released into the Public Domain for educational and cartographic study.',
          'Digitally curated for 3DBook.',
        ],
        footnote: 'Public Domain · Survey Epoch 1908.',
      },
    ],
  },
  {
    id: 'bk-hor-06',
    slug: 'escapements-and-chronometry',
    title: 'Escapements & Chronometry',
    author: 'Henri Breguet',
    description:
      'Treatise on constant-force escapements, hairspring terminal curves, bimetallic temperature compensation, and tourbillon cages.',
    category: 'Horology',
    language: 'English',
    rights_status: 'Public Domain',
    visibility: 'published',
    page_count: 8,
    created_at: '2026-03-12T10:00:00Z',
    published_at: '2026-03-14T09:00:00Z',
    accession_number: 'ACC. 1888.07.H',
    cover_palette: {
      bg: '#E6E2DC',
      surface: '#D8D1C7',
      ink: '#1C1917',
      accent: '#78350F',
      motif: 'horology',
    },
    pages: [
      {
        pageNumber: 1,
        chapterTitle: 'HOROLOGICAL TREATISE · VOLUME II',
        heading: 'Escapements & Chronometry',
        subHeading: 'On Isochronism and the Distribution of Impulse in Portable Timekeepers',
        bodyParagraphs: [
          'A mechanical timekeeper is an energy-metering instrument in which the unwinding of a coiled mainspring is arrested and released five times each second by an oscillating balance wheel.',
          'True chronometric precision demands that the balance complete its arc in the exact same duration whether the amplitude is wide or narrow.',
        ],
        diagramType: 'escapement-gear',
        figureCaption: 'Plate I — Swiss lever escapement showing draw angle and ruby pallet stones.',
      },
      {
        pageNumber: 2,
        chapterTitle: 'CHAPTER I · THE ESCAPEMENT',
        heading: '01. Detached vs. Frictional Rest',
        bodyParagraphs: [
          'In cylinder and verge escapements, the escape wheel tooth presses continuously against the balance staff throughout its swing, introducing viscous oil friction that alters the period of oscillation.',
          'The detached lever and marine detent escapements leave the balance completely free except during the brief ten-degree arc of unlocking and impulse.',
        ],
        pullQuote:
          '“The ideal escapement touches the oscillator as briefly as a finger plucking a harp string.”',
      },
      {
        pageNumber: 3,
        chapterTitle: 'CHAPTER II · THE BALANCE SPRING',
        heading: '02. The Overcoil Terminal Curve',
        bodyParagraphs: [
          'A flat spiral hairspring does not expand and contract concentrically; its center of gravity shifts toward the pinning point with every beat, causing positional rate errors.',
          'By raising the outermost coil to a parallel plane and bending it inward according to mathematically derived terminal curves, the spring breathes concentrically around the balance staff.',
        ],
        diagramType: 'escapement-gear',
        figureCaption: 'Plate II — Theoretical Phillips terminal curve No. 3 for concentric expansion.',
      },
      {
        pageNumber: 4,
        chapterTitle: 'CHAPTER III · THERMAL COMPENSATION',
        heading: '03. The Cut Bimetallic Balance',
        bodyParagraphs: [
          'An uncompensated steel hairspring loses approximately eleven seconds per day for every one-degree Celsius rise in temperature due to elastic modulus softening.',
          'Fusing an outer lamina of brass to an inner rim of steel—and slitting the rim near the spokes—causes the free ends to curl inward when warmed, reducing the moment of inertia to match the weakened spring.',
        ],
        footnote: 'Observatory Trial Note: Middle temperature error stays below 0.15s/day.',
      },
      {
        pageNumber: 5,
        chapterTitle: 'CHAPTER IV · GRAVITATIONAL AVERAGING',
        heading: '04. The Revolving Tourbillon Carriage',
        bodyParagraphs: [
          'When a pocket watch rests vertically in a waistcoat pocket, any microscopic poise error in the balance rim or spring acts as a pendulum, accelerating or retarding the rate.',
          'Mounting the entire balance, spring, and escapement inside a lightweight titanium or steel cage that rotates once per minute averages out all vertical positional errors.',
        ],
        diagramType: 'escapement-gear',
      },
      {
        pageNumber: 6,
        chapterTitle: 'CHAPTER V · GEAR TRAINS',
        heading: '05. Epicycloidal Wheel Teeth Profiles',
        bodyParagraphs: [
          'Unlike industrial machinery that transmits heavy torque from small pinions to large wheels, a watch train multiplies speed from the slow mainspring barrel to the rapid fourth wheel.',
          'Ogival epicycloidal addenda ensure smooth rolling contact ahead of the line of centers without wedging.',
        ],
        pullQuote:
          '“In horology, friction is not merely wasted energy—it is an unscheduled perturbation of time.”',
      },
      {
        pageNumber: 7,
        chapterTitle: 'CHAPTER VI · JEWELING & LUBRICATION',
        heading: '06. Olive-Hole Ruby Bearings',
        bodyParagraphs: [
          'Synthetic corundum rubies are pierced with an olive-shaped internal profile and paired with flat endstones to hold a capillary reservoir of epilame-treated oil around the pivot cone.',
          'Proper endshake of 0.015 millimeters prevents binding under thermal expansion.',
        ],
        diagramType: 'escapement-gear',
      },
      {
        pageNumber: 8,
        chapterTitle: 'ARCHIVAL COLOPHON',
        heading: '07. Geneva Observatory Standards',
        bodyParagraphs: [
          'Compiled from public-domain 19th-century horological proceedings of Geneva and Neuchâtel.',
          'Restored for 3DBook with interactive 3D and 2D spread support.',
        ],
        footnote: 'Public Domain Edition · Verified 8-page technical monograph.',
      },
    ],
  },
];

const STORAGE_KEYS = {
  BOOKS: '3dbook_catalogue_v1',
  USER: '3dbook_current_user_v1',
  USERS_DB: '3dbook_users_db_v1',
  BOOKMARKS: '3dbook_bookmarks_v1',
  PROGRESS: '3dbook_reading_progress_v1',
  REQUESTS: '3dbook_book_requests_v1',
};

// IndexedDB helper for storing uploaded PDF ArrayBuffers / Data URLs reliably
const IDB_NAME = '3dbook_pdf_storage_v1';
const IDB_STORE = 'pdfs';

function openPdfDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storePdfBytes(key: string, data: ArrayBuffer): Promise<void> {
  const db = await openPdfDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put(data, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function loadPdfBytes(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openPdfDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(key);
      req.onsuccess = () => {
        db.close();
        resolve(req.result || null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  } catch {
    return null;
  }
}

export function getAllBooks(): Book[] {
  if (typeof window === 'undefined') return INITIAL_BOOKS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKS);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    const parsed = JSON.parse(raw) as Book[];
    // Ensure initial books are always present unless explicitly modified
    const existingIds = new Set(parsed.map((b) => b.id));
    const merged = [...parsed];
    for (const initBook of INITIAL_BOOKS) {
      if (!existingIds.has(initBook.id)) {
        merged.push(initBook);
      }
    }
    return merged;
  } catch {
    return INITIAL_BOOKS;
  }
}

export function getPublishedBooks(): Book[] {
  return getAllBooks().filter((b) => b.visibility === 'published');
}

export function getBookBySlug(slug: string): Book | undefined {
  return getAllBooks().find((b) => b.slug === slug);
}

export function saveBookToCatalogue(book: Book): Book[] {
  if (typeof window === 'undefined') return INITIAL_BOOKS;
  const current = getAllBooks();
  const idx = current.findIndex((b) => b.id === book.id || b.slug === book.slug);
  let updated: Book[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = book;
  } else {
    updated = [book, ...current];
  }
  window.localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(updated));
  window.dispatchEvent(new Event('3dbook-catalogue-updated'));
  return updated;
}

export function deleteBookFromCatalogue(bookId: string): Book[] {
  if (typeof window === 'undefined') return INITIAL_BOOKS;
  const current = getAllBooks().filter((b) => b.id !== bookId);
  window.localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(current));
  window.dispatchEvent(new Event('3dbook-catalogue-updated'));
  return current;
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function authenticateUser(
  email: string,
  password: string,
  mode: 'signin' | 'signup',
  displayName?: string
): {user?: UserProfile; error?: string} {
  if (typeof window === 'undefined') return {error: 'Client environment required'};
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {error: 'Please enter a valid email address.'};
  }
  if (!password || password.length < 6) {
    return {error: 'Password must be at least 6 characters.'};
  }

  try {
    const rawDb = window.localStorage.getItem(STORAGE_KEYS.USERS_DB);
    const db: Record<string, {profile: UserProfile; passwordHash: string}> = rawDb
      ? JSON.parse(rawDb)
      : {};

    const simpleHash = btoa(encodeURIComponent(password + '_3dbook_salt'));

    if (mode === 'signup') {
      if (db[cleanEmail]) {
        return {error: 'Unable to create account with those credentials. Please sign in instead.'};
      }
      const newProfile: UserProfile = {
        id: 'usr_' + Math.random().toString(36).slice(2, 10),
        email: cleanEmail,
        display_name:
          displayName?.trim() ||
          cleanEmail.split('@')[0].replace(/[._-]/g, ' '),
        role: 'admin', // Grant admin publishing capabilities for the platform owner
        created_at: new Date().toISOString(),
      };
      db[cleanEmail] = {profile: newProfile, passwordHash: simpleHash};
      window.localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(db));
      window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newProfile));
      window.dispatchEvent(new Event('3dbook-auth-updated'));
      return {user: newProfile};
    } else {
      const existing = db[cleanEmail];
      if (!existing) {
        // Also support instant demo sign-in if first time on this browser so testing is frictionless
        const autoProfile: UserProfile = {
          id: 'usr_' + Math.random().toString(36).slice(2, 10),
          email: cleanEmail,
          display_name: cleanEmail.split('@')[0].replace(/[._-]/g, ' '),
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        db[cleanEmail] = {profile: autoProfile, passwordHash: simpleHash};
        window.localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(db));
        window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(autoProfile));
        window.dispatchEvent(new Event('3dbook-auth-updated'));
        return {user: autoProfile};
      }
      if (existing.passwordHash !== simpleHash) {
        return {error: 'Invalid email or password.'};
      }
      window.localStorage.setItem(
        STORAGE_KEYS.USER,
        JSON.stringify(existing.profile)
      );
      window.dispatchEvent(new Event('3dbook-auth-updated'));
      return {user: existing.profile};
    }
  } catch {
    return {error: 'Authentication error occurred.'};
  }
}

export function signOutCurrentUser(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEYS.USER);
  window.dispatchEvent(new Event('3dbook-auth-updated'));
}

export function deleteCurrentUserAccount(): void {
  if (typeof window === 'undefined') return;
  const user = getCurrentUser();
  if (!user) return;
  try {
    const rawDb = window.localStorage.getItem(STORAGE_KEYS.USERS_DB);
    if (rawDb) {
      const db = JSON.parse(rawDb);
      delete db[user.email];
      window.localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(db));
    }
    const bookmarks = getAllBookmarks().filter((b) => b.user_id !== user.id);
    window.localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    const progress = getAllReadingProgress().filter((p) => p.user_id !== user.id);
    window.localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch {
    // ignore cleanup errors
  }
  signOutCurrentUser();
}

function getAllBookmarks(): BookmarkRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? (JSON.parse(raw) as BookmarkRecord[]) : [];
  } catch {
    return [];
  }
}

export function getUserBookmarks(userId: string): BookmarkRecord[] {
  return getAllBookmarks().filter((b) => b.user_id === userId);
}

export function isBookBookmarked(userId: string | undefined, bookId: string): boolean {
  if (!userId) return false;
  return getAllBookmarks().some((b) => b.user_id === userId && b.book_id === bookId);
}

export function toggleUserBookmark(userId: string, bookId: string): boolean {
  const all = getAllBookmarks();
  const exists = all.findIndex((b) => b.user_id === userId && b.book_id === bookId);
  let next: BookmarkRecord[];
  let nowSaved: boolean;
  if (exists >= 0) {
    next = all.filter((_, i) => i !== exists);
    nowSaved = false;
  } else {
    next = [
      {user_id: userId, book_id: bookId, created_at: new Date().toISOString()},
      ...all,
    ];
    nowSaved = true;
  }
  window.localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next));
  window.dispatchEvent(new Event('3dbook-bookmarks-updated'));
  return nowSaved;
}

function getAllReadingProgress(): ReadingProgress[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? (JSON.parse(raw) as ReadingProgress[]) : [];
  } catch {
    return [];
  }
}

export function getUserReadingProgress(userId: string): ReadingProgress[] {
  return getAllReadingProgress()
    .filter((p) => p.user_id === userId)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
}

export function getBookProgress(
  userId: string | undefined,
  bookId: string
): ReadingProgress | undefined {
  if (!userId) return undefined;
  return getAllReadingProgress().find(
    (p) => p.user_id === userId && p.book_id === bookId
  );
}

export function saveUserReadingProgress(
  userId: string,
  bookId: string,
  bookSlug: string,
  currentPage: number,
  totalPages: number
): void {
  if (typeof window === 'undefined') return;
  const all = getAllReadingProgress();
  const idx = all.findIndex((p) => p.user_id === userId && p.book_id === bookId);
  const record: ReadingProgress = {
    user_id: userId,
    book_id: bookId,
    book_slug: bookSlug,
    current_page: currentPage,
    total_pages: totalPages,
    updated_at: new Date().toISOString(),
  };
  if (idx >= 0) {
    all[idx] = record;
  } else {
    all.unshift(record);
  }
  window.localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
  window.dispatchEvent(new Event('3dbook-progress-updated'));
}

export function getBookRequests(): BookRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return raw ? (JSON.parse(raw) as BookRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveBookRequest(
  input: Omit<BookRequest, 'id' | 'status' | 'created_at'>
): BookRequest {
  const newRequest: BookRequest = {
    ...input,
    id: 'req_' + Math.random().toString(36).slice(2, 10),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    const existing = getBookRequests();
    const updated = [newRequest, ...existing];
    window.localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(updated));
    window.dispatchEvent(new Event('3dbook-requests-updated'));
  }
  return newRequest;
}

export function deleteBookRequest(requestId: string): void {
  if (typeof window === 'undefined') return;
  const existing = getBookRequests().filter((r) => r.id !== requestId);
  window.localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(existing));
  window.dispatchEvent(new Event('3dbook-requests-updated'));
}

