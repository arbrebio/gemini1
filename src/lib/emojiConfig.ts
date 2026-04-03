// Arbre Bio Africa — Centralized emoji/icon registry
// Each key maps to a custom 3D SVG icon stored in public/emoji/
// To swap an icon: replace the SVG file at the path — no code changes needed.

export interface EmojiDef {
  alt: string;
  path: string;
}

export const emojiMap: Record<string, EmojiDef> = {
  // Nature / Plants
  plant:      { alt: 'Seedling',        path: '/emoji/plant.svg' },
  water:      { alt: 'Water drop',      path: '/emoji/water.svg' },
  leaf:       { alt: 'Leaf',            path: '/emoji/leaf.svg' },
  flower:     { alt: 'Flower',          path: '/emoji/flower.svg' },
  earth:      { alt: 'Earth',           path: '/emoji/earth.svg' },

  // Greenhouse / Structure
  greenhouse: { alt: 'Greenhouse',      path: '/emoji/greenhouse.svg' },
  sun:        { alt: 'Sun',             path: '/emoji/sun.svg' },
  wind:       { alt: 'Wind',            path: '/emoji/wind.svg' },
  shield:     { alt: 'Shield',          path: '/emoji/shield.svg' },
  tent:       { alt: 'Tunnel greenhouse', path: '/emoji/tent.svg' },
  home:       { alt: 'Home greenhouse', path: '/emoji/home.svg' },
  factory:    { alt: 'Commercial greenhouse', path: '/emoji/factory.svg' },

  // People / Business
  handshake:  { alt: 'Partnership',     path: '/emoji/handshake.svg' },
  trophy:     { alt: 'Trophy',          path: '/emoji/trophy.svg' },
  medal:      { alt: 'Medal',           path: '/emoji/medal.svg' },
  rocket:     { alt: 'Launch',          path: '/emoji/rocket.svg' },
  laptop:     { alt: 'Technology',      path: '/emoji/laptop.svg' },
  phone:      { alt: 'Phone',           path: '/emoji/phone.svg' },
  bulb:       { alt: 'Innovation',      path: '/emoji/bulb.svg' },

  // Agriculture / Equipment
  tractor:    { alt: 'Tractor',         path: '/emoji/tractor.svg' },
  wrench:     { alt: 'Tools',           path: '/emoji/wrench.svg' },

  // Science / Data
  microscope: { alt: 'Research',        path: '/emoji/microscope.svg' },
  flask:      { alt: 'Laboratory',      path: '/emoji/flask.svg' },
  chart:      { alt: 'Analytics',       path: '/emoji/chart.svg' },
  pill:       { alt: 'Fertigation',     path: '/emoji/pill.svg' },

  // Irrigation
  wave:       { alt: 'Water wave',      path: '/emoji/wave.svg' },
  target:     { alt: 'Precision',       path: '/emoji/target.svg' },

  // Crops
  tomato:     { alt: 'Tomato',          path: '/emoji/tomato.svg' },
  strawberry: { alt: 'Strawberry',      path: '/emoji/strawberry.svg' },
  cucumber:   { alt: 'Cucumber',        path: '/emoji/cucumber.svg' },
  lettuce:    { alt: 'Lettuce',         path: '/emoji/lettuce.svg' },
  pepper:     { alt: 'Bell pepper',     path: '/emoji/pepper.svg' },
  chili:      { alt: 'Chili pepper',    path: '/emoji/chili.svg' },

  // Substrates
  coconut:    { alt: 'Coconut fiber',   path: '/emoji/coconut.svg' },
  stone:      { alt: 'Stone/Perlite',   path: '/emoji/stone.svg' },
};

export type EmojiKey = keyof typeof emojiMap;
