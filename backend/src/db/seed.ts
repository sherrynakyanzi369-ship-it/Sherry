import * as crypto from 'crypto';
import { JsonDbService } from './json-db.service';
import { CONFIG } from '../config';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

const P = (p: Record<string, unknown>) => p;

export function seedDatabase(db: JsonDbService): void {
  const d = db.data;
  d.meta.seedVersion = CONFIG.seedVersion;
  d.users = [
    {
      id: db.nextId('users'),
      name: 'Store Administrator',
      email: 'admin@sherriezscents.com',
      role: 'admin',
      passwordHash: hashPassword('SherriezAdmin#2026'),
      addresses: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const edpSizes = (skuBase: string, stock30: number, stock50: number, stock100: number) => [
    { sku: `${skuBase}-30`, size: '30 ml', priceDelta: 0, stock: stock30 },
    { sku: `${skuBase}-50`, size: '50 ml', priceDelta: 15, stock: stock50 },
    { sku: `${skuBase}-100`, size: '100 ml', priceDelta: 30, stock: stock100 },
  ];
  const oilSizes = (base: string, s10: number, s25: number) => [
    { sku: `${base}-10`, size: '10 ml roll-on', priceDelta: 0, stock: s10 },
    { sku: `${base}-25`, size: '25 ml bottle', priceDelta: 12, stock: s25 },
  ];
  const spraySizes = (base: string, s150: number, s250: number) => [
    { sku: `${base}-150`, size: '150 ml', priceDelta: 0, stock: s150 },
    { sku: `${base}-250`, size: '250 ml', priceDelta: 6, stock: s250 },
  ];
  const setSize = (base: string, stock: number) => [{ sku: `${base}-std`, size: 'Standard set', priceDelta: 0, stock }];

  d.products = [
    P({
      id: db.nextId('products'), slug: 'signature-scent', name: 'Signature Scent', brand: 'Sherriez',
      category: 'women', type: 'eau-de-parfum', audience: 'women', family: 'floral',
      shortDescription: 'A radiant white-floral signature with a warm amber drydown.',
      description: 'Signature Scent opens with luminous bergamot and pear before unfolding into a heart of jasmine and orange blossom. A base of amber and soft musk leaves an unforgettable trail that lingers from morning to evening.',
      notes: { top: ['Bergamot', 'Pear'], middle: ['Jasmine', 'Orange Blossom'], base: ['Amber', 'White Musk'] },
      price: 49.99, salePrice: null, images: ['/images/Perfume 1.jpg', '/images/mood-glow.svg'],
      variants: edpSizes('SIG', 24, 18, 10), rating: 4.8, reviewCount: 2, badges: [],
      featured: true, isNew: false, bestSeller: true, soldCount: 320, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'luxury-essence', name: 'Luxury Essence', brand: 'Sherriez',
      category: 'unisex', type: 'eau-de-parfum', audience: 'unisex', family: 'amber',
      shortDescription: 'Opulent amber and oud wrapped in vanilla warmth.',
      description: 'Luxury Essence is a statement fragrance for those who enter a room and own it. Smoky oud and resinous amber are softened by Madagascan vanilla and a whisper of rose for a composition that is rich, magnetic and long-lasting.',
      notes: { top: ['Saffron', 'Rose'], middle: ['Oud', 'Amber'], base: ['Vanilla', 'Sandalwood'] },
      price: 59.99, salePrice: 49.99, images: ['/images/Perfume 2.jpg'],
      variants: edpSizes('LUX', 15, 20, 8), rating: 4.7, reviewCount: 1, badges: ['Save $10'],
      featured: true, isNew: false, bestSeller: true, soldCount: 410, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'ocean-breeze', name: 'Ocean Breeze', brand: 'Sherriez',
      category: 'unisex', type: 'eau-de-toilette', audience: 'unisex', family: 'aquatic',
      shortDescription: 'Sea-salt freshness with driftwood calm.',
      description: 'Ocean Breeze captures the first light of dawn on the coastline. Cool marine accords and sea salt glide over driftwood and musk for a clean, effortless scent made for everyday wear.',
      notes: { top: ['Marine Accord', 'Lemon Zest'], middle: ['Sea Salt', 'Lavender'], base: ['Driftwood', 'Musk'] },
      price: 39.99, salePrice: null, images: ['/images/Perfume 3.jpg'],
      variants: edpSizes('OCN', 22, 16, 12), rating: 4.5, reviewCount: 1, badges: [],
      featured: true, isNew: true, bestSeller: false, soldCount: 180, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'midnight-bloom', name: 'Midnight Bloom', brand: 'Sherriez',
      category: 'women', type: 'eau-de-parfum', audience: 'women', family: 'floral',
      shortDescription: 'Night-blooming florals with dark plum and velvet woods.',
      description: 'Midnight Bloom is the flower that only opens after dusk. Juicy plum and blackcurrant melt into night jasmine and tuberose, settling onto velvet sandalwood — mysterious, feminine and unforgettable.',
      notes: { top: ['Plum', 'Blackcurrant'], middle: ['Night Jasmine', 'Tuberose'], base: ['Sandalwood', 'Patchouli'] },
      price: 64.99, salePrice: null, images: ['/images/Perfume 5.jpg'],
      variants: edpSizes('MID', 18, 14, 9), rating: 4.9, reviewCount: 1, badges: ['Best Seller'],
      featured: true, isNew: false, bestSeller: true, soldCount: 520, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'velvet-rose-oil', name: 'Velvet Rose Oil', brand: 'Sherriez Atelier',
      category: 'perfume-oils', type: 'perfume-oil', audience: 'women', family: 'floral',
      shortDescription: 'Alcohol-free Taif rose oil that melts into skin.',
      description: 'A pure perfume oil distilled from Taif roses, softened with creamy musk. Applied to pulse points it blooms slowly with your body heat for an intimate, close-to-the-skin scent that lasts all day.',
      notes: { top: ['Rose Petals'], middle: ['Taif Rose', 'Geranium'], base: ['Creamy Musk', 'Cedar'] },
      price: 22.99, salePrice: null, images: ['/images/oil-rose.svg'],
      variants: oilSizes('VRO', 30, 18), rating: 4.6, reviewCount: 0, badges: ['Alcohol Free'],
      featured: false, isNew: true, bestSeller: false, soldCount: 95, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'oud-royale-oil', name: 'Oud Royale Oil', brand: 'Sherriez Atelier',
      category: 'perfume-oils', type: 'perfume-oil', audience: 'men', family: 'woody',
      shortDescription: 'Cambodian oud aged and polished with leather.',
      description: 'Oud Royale is our most precious oil: genuine Cambodian oud aged for depth, polished with saffron and a touch of soft leather. One drop is enough — this is fragrance as jewellery.',
      notes: { top: ['Saffron'], middle: ['Cambodian Oud', 'Leather'], base: ['Amberwood', 'Tonka'] },
      price: 34.99, salePrice: 29.99, images: ['/images/oil-oud.svg'],
      variants: oilSizes('OURO', 26, 14), rating: 4.8, reviewCount: 1, badges: ['Save $5'],
      featured: false, isNew: false, bestSeller: true, soldCount: 260, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'citrus-mist-body-spray', name: 'Citrus Mist Body Spray', brand: 'Sherriez Daily',
      category: 'body-sprays', type: 'body-spray', audience: 'unisex', family: 'citrus',
      shortDescription: 'A burst of Sicilian lemon and grapefruit for instant uplift.',
      description: 'Citrus Mist is sunshine in a bottle. Sparkling lemon, bitter grapefruit and a hint of mint refresh the skin any time of day. Light enough to reapply, bright enough to be noticed.',
      notes: { top: ['Sicilian Lemon', 'Grapefruit'], middle: ['Mint', 'Green Leaves'], base: ['White Cedar'] },
      price: 12.99, salePrice: null, images: ['/images/spray-citrus.svg'],
      variants: spraySizes('CIM', 40, 25), rating: 4.4, reviewCount: 0, badges: [],
      featured: false, isNew: false, bestSeller: false, soldCount: 210, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'lavender-dusk-body-spray', name: 'Lavender Dusk Body Spray', brand: 'Sherriez Daily',
      category: 'body-sprays', type: 'body-spray', audience: 'women', family: 'fresh',
      shortDescription: 'Calming lavender and soft cotton for quiet evenings.',
      description: 'Wind down with Lavender Dusk: French lavender folded into cotton blossom and a lullaby of soft vanilla. The gentle mist is kind to skin and perfect for pillow-side spritzing.',
      notes: { top: ['French Lavender'], middle: ['Cotton Blossom'], base: ['Soft Vanilla'] },
      price: 11.99, salePrice: null, images: ['/images/spray-lavender.svg'],
      variants: spraySizes('LAV', 35, 20), rating: 4.3, reviewCount: 0, badges: [],
      featured: false, isNew: false, bestSeller: false, soldCount: 140, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'amber-ember', name: 'Amber Ember', brand: 'Sherriez',
      category: 'men', type: 'eau-de-parfum', audience: 'men', family: 'spicy',
      shortDescription: 'Smouldering spices over molten amber.',
      description: 'Amber Ember ignites with pink pepper and cardamom before smouldering into labdanum, amber and smoked woods. Bold yet refined — built for cool evenings and warm entrances.',
      notes: { top: ['Pink Pepper', 'Cardamom'], middle: ['Labdanum', 'Cinnamon'], base: ['Amber', 'Smoked Cedar'] },
      price: 54.99, salePrice: null, images: ['/images/edp-ember.svg'],
      variants: edpSizes('AMB', 20, 17, 7), rating: 4.7, reviewCount: 1, badges: [],
      featured: true, isNew: false, bestSeller: false, soldCount: 175, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'cedar-trail', name: 'Cedar Trail', brand: 'Sherriez',
      category: 'men', type: 'eau-de-toilette', audience: 'men', family: 'woody',
      shortDescription: 'Crisp cedarwood and vetiver for the modern explorer.',
      description: 'Cedar Trail walks the line between city and wild: aromatic cypress and crisp cedar grounded by earthy vetiver. Dependable, versatile and quietly confident.',
      notes: { top: ['Cypress', 'Bergamot'], middle: ['Cedarwood', 'Juniper'], base: ['Vetiver', 'Moss'] },
      price: 44.99, salePrice: null, images: ['/images/edp-cedar.svg'],
      variants: edpSizes('CED', 25, 19, 11), rating: 4.5, reviewCount: 0, badges: [],
      featured: false, isNew: false, bestSeller: false, soldCount: 130, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'golden-hour', name: 'Golden Hour', brand: 'Sherriez',
      category: 'women', type: 'eau-de-parfum', audience: 'women', family: 'fruity',
      shortDescription: 'Sun-warmed peach and mango with a floral glow.',
      description: 'Golden Hour bottles the last light of a perfect afternoon: ripe peach, juicy mango and neroli glowing over tonka and benzoin. Radiant, joyful and impossible to ignore.',
      notes: { top: ['Peach', 'Mango'], middle: ['Neroli', 'Freesia'], base: ['Tonka Bean', 'Benzoin'] },
      price: 58.0, salePrice: null, images: ['/images/edp-golden.svg'],
      variants: edpSizes('GLD', 21, 15, 8), rating: 4.6, reviewCount: 0, badges: ['New'],
      featured: false, isNew: true, bestSeller: false, soldCount: 88, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'aqua-pulse', name: 'Aqua Pulse', brand: 'Sherriez',
      category: 'men', type: 'eau-de-toilette', audience: 'men', family: 'aquatic',
      shortDescription: 'Cold-water energy with ginger and blue sage.',
      description: 'Aqua Pulse hits like a plunge pool: icy marine notes spiked with ginger and blue sage, drying down to clean ambergris. Your post-gym, pre-anything signature.',
      notes: { top: ['Marine Notes', 'Ginger'], middle: ['Blue Sage', 'Melon'], base: ['Ambergris', 'Musk'] },
      price: 42.99, salePrice: 36.99, images: ['/images/edp-aqua.svg'],
      variants: edpSizes('AQP', 23, 18, 10), rating: 4.4, reviewCount: 1, badges: ['Save $6'],
      featured: false, isNew: false, bestSeller: false, soldCount: 160, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'musk-habibi-oil', name: 'Musk Habibi Oil', brand: 'Sherriez Atelier',
      category: 'perfume-oils', type: 'perfume-oil', audience: 'unisex', family: 'musk',
      shortDescription: 'Silky white musk with dates and warm skin.',
      description: 'Musk Habibi is comfort rendered in fragrance: pillowy white musk sweetened by date fruit and a trail of ambrette seed. Unisex, addictive, and beautiful layered over any other Sherriez scent.',
      notes: { top: ['Ambrette Seed'], middle: ['White Musk', 'Date Fruit'], base: ['Sandalwood', 'Vanilla Husk'] },
      price: 27.5, salePrice: null, images: ['/images/oil-musk.svg'],
      variants: oilSizes('MUH', 28, 16), rating: 4.7, reviewCount: 0, badges: ['Layering Favourite'],
      featured: false, isNew: false, bestSeller: true, soldCount: 240, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'spiced-amber-gift-set', name: 'Spiced Amber Gift Set', brand: 'Sherriez Collections',
      category: 'gift-sets', type: 'gift-set', audience: 'unisex', family: 'spicy',
      shortDescription: 'Amber Ember EDP 50ml + body spray + travel oil in a keepsake box.',
      description: 'The complete Amber Ember ritual: a 50 ml eau de parfum, matching body spray and a 10 ml travel perfume oil nested in a magnetic keepsake box tied with ribbon. Ready to gift, no wrapping needed.',
      notes: { top: ['Pink Pepper'], middle: ['Cinnamon', 'Labdanum'], base: ['Amber', 'Cedar'] },
      price: 79.99, salePrice: null, images: ['/images/gift-spice.svg'],
      variants: setSize('SPG', 14), rating: 4.9, reviewCount: 1, badges: ['Gift Ready'],
      featured: true, isNew: false, bestSeller: true, soldCount: 190, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'discovery-trio-set', name: 'Discovery Trio Set', brand: 'Sherriez Collections',
      category: 'gift-sets', type: 'gift-set', audience: 'unisex', family: 'floral',
      shortDescription: 'Three 10 ml travel sprays: Signature, Ocean Breeze & Golden Hour.',
      description: 'Can’t pick one? Try three. The Discovery Trio holds 10 ml travel sprays of Signature Scent, Ocean Breeze and Golden Hour in a slim gift sleeve — the smartest way to find your signature.',
      notes: { top: ['Bergamot', 'Lemon'], middle: ['Jasmine', 'Marine Accord'], base: ['Amber', 'Musk'] },
      price: 45.0, salePrice: null, images: ['/images/gift-trio.svg'],
      variants: setSize('DTR', 30), rating: 4.7, reviewCount: 0, badges: ['New', 'Best Value'],
      featured: false, isNew: true, bestSeller: true, soldCount: 230, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'white-petal-mist', name: 'White Petal Mist', brand: 'Sherriez Daily',
      category: 'body-sprays', type: 'body-spray', audience: 'women', family: 'floral',
      shortDescription: 'Fresh-cut petals and dew for everyday softness.',
      description: 'White Petal Mist is a just-picked bouquet: peony, lily and dewy greens in a featherlight body spray. Kind to skin, easy to love, effortless to wear every single day.',
      notes: { top: ['Dew Greens'], middle: ['Peony', 'Lily'], base: ['Soft Musk'] },
      price: 13.5, salePrice: null, images: ['/images/spray-petal.svg'],
      variants: spraySizes('WPM', 38, 22), rating: 4.5, reviewCount: 0, badges: [],
      featured: false, isNew: false, bestSeller: false, soldCount: 120, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'noir-intense', name: 'Noir Intense', brand: 'Sherriez Privé',
      category: 'men', type: 'eau-de-parfum', audience: 'men', family: 'oriental',
      shortDescription: 'Black orchid, incense and dark chocolate for evening power.',
      description: 'Noir Intense is our private-label statement piece: black orchid and smouldering incense poured over dark chocolate and patchouli. Two sprays are plenty — this one fills the room.',
      notes: { top: ['Black Orchid'], middle: ['Incense', 'Cacao'], base: ['Patchouli', 'Dark Woods'] },
      price: 69.99, salePrice: null, images: ['/images/edp-noir.svg'],
      variants: edpSizes('NOI', 16, 12, 6), rating: 4.8, reviewCount: 0, badges: ['Privé'],
      featured: true, isNew: false, bestSeller: false, soldCount: 85, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'blossom-duo-set', name: 'Blossom Duo Set', brand: 'Sherriez Collections',
      category: 'gift-sets', type: 'gift-set', audience: 'women', family: 'floral',
      shortDescription: 'Midnight Bloom 50ml + Velvet Rose oil in a floral keepsake box.',
      description: 'A love letter in a box: Midnight Bloom eau de parfum paired with our alcohol-free Velvet Rose oil. Layer them together for a deeper, longer-lasting bloom she will adore.',
      notes: { top: ['Plum'], middle: ['Night Jasmine', 'Taif Rose'], base: ['Sandalwood', 'Musk'] },
      price: 55.0, salePrice: 47.5, images: ['/images/gift-blossom.svg'],
      variants: setSize('BLD', 18), rating: 4.6, reviewCount: 0, badges: ['Save $7.50'],
      featured: false, isNew: false, bestSeller: false, soldCount: 105, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'rosie', name: 'Rosie', brand: 'Sherriez',
      category: 'women', type: 'eau-de-parfum', audience: 'women', family: 'floral',
      shortDescription: 'Floral & Fresh — a radiant bouquet of pink petals and morning dew.',
      description: 'Rosie captures the first bloom of a dewy garden at sunrise. Soft peony and fresh-cut roses dance over a heart of lily of the valley, settling into a clean white musk base. Feminine, joyful, and utterly addictive.',
      notes: { top: ['Peony', 'Pink Pepper'], middle: ['Rose', 'Lily of the Valley'], base: ['White Musk', 'Cedar'] },
      price: 44.00, salePrice: null, images: ['/images/Perfume 1.jpg'],
      variants: edpSizes('ROS', 20, 16, 10), rating: 4.7, reviewCount: 2, badges: ['Floral & Fresh'],
      featured: true, isNew: false, bestSeller: true, soldCount: 380, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'noir-velvet', name: 'Noir Velvet', brand: 'Sherriez',
      category: 'men', type: 'eau-de-parfum', audience: 'men', family: 'woody',
      shortDescription: 'Woody & Spicy — dark oud, black leather and smoky vetiver.',
      description: 'Noir Velvet is the essence of midnight confidence. Black oud and saffron open with intensity, melting into smoked leather and dark vetiver. A commanding signature for men who own every room.',
      notes: { top: ['Saffron', 'Black Pepper'], middle: ['Oud', 'Leather'], base: ['Vetiver', 'Dark Amber'] },
      price: 48.00, salePrice: null, images: ['/images/Perfume 2.jpg'],
      variants: edpSizes('NRV', 18, 14, 8), rating: 4.8, reviewCount: 1, badges: ['Woody & Spicy'],
      featured: true, isNew: false, bestSeller: true, soldCount: 420, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'luna-muse', name: 'Luna Muse', brand: 'Sherriez',
      category: 'unisex', type: 'eau-de-parfum', audience: 'unisex', family: 'fruity',
      shortDescription: 'Fruity & Elegant — night-blooming jasmine with blackcurrant and plum.',
      description: 'Luna Muse enchants with the mystery of moonlit gardens. Juicy blackcurrant and ripe plum melt into night jasmine and iris, resting on a pillow of tonka and skin musk. Elegant, radiant, unforgettable.',
      notes: { top: ['Blackcurrant', 'Plum'], middle: ['Night Jasmine', 'Iris'], base: ['Tonka Bean', 'Skin Musk'] },
      price: 59.00, salePrice: null, images: ['/images/Perfume 3.jpg'],
      variants: edpSizes('LUN', 22, 18, 10), rating: 4.9, reviewCount: 1, badges: ['Fruity & Elegant'],
      featured: true, isNew: false, bestSeller: true, soldCount: 310, active: true,
    }),
    P({
      id: db.nextId('products'), slug: 'solar-bloom', name: 'Solar Bloom', brand: 'Sherriez',
      category: 'women', type: 'eau-de-parfum', audience: 'women', family: 'citrus',
      shortDescription: 'Citrus & Fresh — Sicilian bergamot, neroli and warm amber.',
      description: 'Solar Bloom radiates like golden sunlight on bare skin. Sparkling bergamot and neroli illuminate a heart of white florals, drying down to warm amber and sandalwood. Fresh, luminous, and effortlessly chic.',
      notes: { top: ['Bergamot', 'Neroli'], middle: ['White Florals', 'Orange Blossom'], base: ['Amber', 'Sandalwood'] },
      price: 36.00, salePrice: null, images: ['/images/Perfume 5.jpg'],
      variants: edpSizes('SLB', 25, 20, 12), rating: 4.6, reviewCount: 1, badges: ['Citrus & Fresh'],
      featured: true, isNew: false, bestSeller: false, soldCount: 250, active: true,
    }),
  ] as never;

  const pid = (slug: string) => d.products.find((p) => p.slug === slug)!.id;

  d.reviews = [
    { id: db.nextId('reviews'), productId: pid('signature-scent'), userId: null, authorName: 'Amara O.', rating: 5, title: 'My everyday luxury', body: 'I get compliments every single time I wear this. The jasmine heart is gorgeous and it lasts on me a good 8 hours.', verified: true, createdAt: '2026-06-02T09:00:00Z' },
    { id: db.nextId('reviews'), productId: pid('signature-scent'), userId: null, authorName: 'Ruth K.', rating: 4, title: 'Beautiful floral', body: 'Very elegant scent. I wish the 100ml came back in stock more often!', verified: true, createdAt: '2026-07-11T14:30:00Z' },
    { id: db.nextId('reviews'), productId: pid('luxury-essence'), userId: null, authorName: 'Daniel M.', rating: 5, title: 'Worth every cent', body: 'Deep, warm and powerful. My partner and I both use it — perfect unisex amber.', verified: true, createdAt: '2026-05-21T10:00:00Z' },
    { id: db.nextId('reviews'), productId: pid('ocean-breeze'), userId: null, authorName: 'Kofi A.', rating: 4, title: 'Clean and fresh', body: 'Great office scent, not overpowering at all.', verified: false, createdAt: '2026-08-01T08:15:00Z' },
    { id: db.nextId('reviews'), productId: pid('midnight-bloom'), userId: null, authorName: 'Zainab H.', rating: 5, title: 'Pure magic', body: 'This is my special-occasion perfume now. The plum opening is divine.', verified: true, createdAt: '2026-07-19T19:45:00Z' },
    { id: db.nextId('reviews'), productId: pid('oud-royale-oil'), userId: null, authorName: 'Ibrahim S.', rating: 5, title: 'Real oud quality', body: 'Rich and authentic. One swipe lasts through Jumuah prayers and beyond.', verified: true, createdAt: '2026-06-27T12:00:00Z' },
    { id: db.nextId('reviews'), productId: pid('amber-ember'), userId: null, authorName: 'Marcus T.', rating: 5, title: 'Evening king', body: 'Spicy, warm, confident. Wearing this to dinners gets questions.', verified: true, createdAt: '2026-07-05T18:20:00Z' },
    { id: db.nextId('reviews'), productId: pid('aqua-pulse'), userId: null, authorName: 'Leo G.', rating: 4, title: 'Great gym bag scent', body: 'Fresh and energetic. Good value at the sale price.', verified: false, createdAt: '2026-08-10T07:00:00Z' },
    { id: db.nextId('reviews'), productId: pid('spiced-amber-gift-set'), userId: null, authorName: 'Grace N.', rating: 5, title: 'Gifted twice already', body: 'The packaging looks expensive and everyone loves the layering combo.', verified: true, createdAt: '2026-07-28T16:00:00Z' },
  ];

  d.coupons = [
    { id: db.nextId('coupons'), code: 'WELCOME10', kind: 'percent', value: 10, minSubtotal: 0, active: true, description: '10% off your order' },
    { id: db.nextId('coupons'), code: 'SCENTS25', kind: 'fixed', value: 25, minSubtotal: 120, active: true, description: '$25 off orders over $120' },
    { id: db.nextId('coupons'), code: 'FREESHIP', kind: 'free-ship', value: 0, minSubtotal: 30, active: true, description: 'Free standard delivery over $30' },
  ];

  d.banners = [
    { id: db.nextId('banners'), eyebrow: 'Limited Time', title: 'The Amber Season Sale', text: 'Enjoy up to 25% off selected ambers, ouds and gift sets — while stocks last.', ctaLabel: 'Shop the Sale', ctaHref: '/shop?sort=discount', theme: 'sale', active: true },
    { id: db.nextId('banners'), eyebrow: 'Free Delivery', title: 'Free standard delivery over $75', text: 'Anywhere in the country. Automatic at checkout — no code needed.', ctaLabel: 'Start Shopping', ctaHref: '/shop', theme: 'new', active: true },
    { id: db.nextId('banners'), eyebrow: 'New Collection', title: 'Meet Golden Hour', text: 'Our sunniest composition yet — peach, neroli and tonka in perfect balance.', ctaLabel: 'Discover Now', ctaHref: '/product/golden-hour', theme: 'gift', active: true },
  ];

  d.orders = [];
  d.subscribers = [];
  d.messages = [];

  db.save();
}
