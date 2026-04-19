export interface FlavorNode {
  name: string;
  color: string;
  sub?: FlavorNode[];
}

export const SCA_FLAVOR_WHEEL: FlavorNode[] = [
  {
    name: 'Fruity',
    color: '#ff9e0c',
    sub: [
      { name: 'Berry', color: '#e63946', sub: [{ name: 'Blackberry', color: '#e63946' }, { name: 'Raspberry', color: '#e63946' }, { name: 'Blueberry', color: '#e63946' }, { name: 'Strawberry', color: '#e63946' }] },
      { name: 'Dried Fruit', color: '#d4a373', sub: [{ name: 'Raisin', color: '#d4a373' }, { name: 'Prune', color: '#d4a373' }] },
      { name: 'Citrus Fruit', color: '#f9c74f', sub: [{ name: 'Grapefruit', color: '#f9c74f' }, { name: 'Orange', color: '#f9c74f' }, { name: 'Lemon', color: '#f9c74f' }, { name: 'Lime', color: '#f9c74f' }] },
      { name: 'Other Fruit', color: '#e9edc9', sub: [{ name: 'Coconut', color: '#e9edc9' }, { name: 'Cherry', color: '#e9edc9' }, { name: 'Pomegranate', color: '#e9edc9' }, { name: 'Pineapple', color: '#e9edc9' }, { name: 'Grape', color: '#e9edc9' }, { name: 'Apple', color: '#e9edc9' }, { name: 'Peach', color: '#e9edc9' }, { name: 'Pear', color: '#e9edc9' }] }
    ]
  },
  {
    name: 'Floral',
    color: '#e56c9a',
    sub: [
      { name: 'Black Tea', color: '#582f0e' },
      { name: 'Floral', color: '#e56c9a', sub: [{ name: 'Chamomile', color: '#e56c9a' }, { name: 'Rose', color: '#e56c9a' }, { name: 'Jasmine', color: '#e56c9a' }] }
    ]
  },
  {
    name: 'Sweet',
    color: '#f4a261',
    sub: [
      { name: 'Sugar Brown', color: '#8d5b4c', sub: [{ name: 'Molasses', color: '#8d5b4c' }, { name: 'Maple Syrup', color: '#8d5b4c' }, { name: 'Caramelised', color: '#8d5b4c' }, { name: 'Honey', color: '#8d5b4c' }] },
      { name: 'Vanilla', color: '#f4e4bc' },
      { name: 'Overall Sweet', color: '#f4a261' }
    ]
  },
  {
    name: 'Nutty/Cocoa',
    color: '#ae8a68',
    sub: [
      { name: 'Nutty', color: '#ae8a68', sub: [{ name: 'Peanuts', color: '#ae8a68' }, { name: 'Hazelnut', color: '#ae8a68' }, { name: 'Almond', color: '#ae8a68' }] },
      { name: 'Cocoa', color: '#582f0e', sub: [{ name: 'Chocolate', color: '#582f0e' }, { name: 'Dark Chocolate', color: '#582f0e' }] }
    ]
  },
  {
    name: 'Spices',
    color: '#e76f51',
    sub: [
      { name: 'Pungent', color: '#e76f51' },
      { name: 'Pepper', color: '#e76f51' },
      { name: 'Brown Spice', color: '#b07d62', sub: [{ name: 'Clove', color: '#b07d62' }, { name: 'Cinnamon', color: '#b07d62' }, { name: 'Nutmeg', color: '#b07d62' }, { name: 'Anise', color: '#b07d62' }] }
    ]
  },
  {
    name: 'Roasted',
    color: '#9c6644',
    sub: [
      { name: 'Pipe Tobacco', color: '#9c6644' },
      { name: 'Tobacco', color: '#9c6644' },
      { name: 'Burnt', color: '#3d2b1f', sub: [{ name: 'Acrid', color: '#3d2b1f' }, { name: 'Smoky', color: '#3d2b1f' }] },
      { name: 'Cereal', color: '#ddb892', sub: [{ name: 'Grain', color: '#ddb892' }, { name: 'Malt', color: '#ddb892' }] }
    ]
  },
  {
    name: 'Green/Vegetative',
    color: '#90be6d',
    sub: [
      { name: 'Olive Oil', color: '#90be6d' },
      { name: 'Raw', color: '#90be6d' },
      { name: 'Green/Vegetative', color: '#4d908e', sub: [{ name: 'Under-ripe', color: '#4d908e' }, { name: 'Peas', color: '#4d908e' }, { name: 'Fresh', color: '#4d908e' }, { name: 'Dark Green', color: '#4d908e' }, { name: 'Vegetative', color: '#4d908e' }, { name: 'Hay-like', color: '#4d908e' }, { name: 'Herb-like', color: '#4d908e' }] }
    ]
  },
  {
    name: 'Sour/Fermented',
    color: '#e9c46a',
    sub: [
      { name: 'Sour', color: '#e9c46a', sub: [{ name: 'Sour Aromatics', color: '#e9c46a' }, { name: 'Acetic Acid', color: '#e9c46a' }, { name: 'Butyric Acid', color: '#e9c46a' }, { name: 'Isovaleric Acid', color: '#e9c46a' }, { name: 'Citric Acid', color: '#e9c46a' }, { name: 'Malic Acid', color: '#e9c46a' }] },
      { name: 'Alcohol/Fermented', color: '#8a5a44', sub: [{ name: 'Winey', color: '#8a5a44' }, { name: 'Whiskey', color: '#8a5a44' }, { name: 'Overripe', color: '#8a5a44' }] }
    ]
  },
  {
    name: 'Other',
    color: '#6c757d',
    sub: [
      { name: 'Papery/Musty', color: '#dee2e6', sub: [{ name: 'Stale', color: '#dee2e6' }, { name: 'Cardboard', color: '#dee2e6' }, { name: 'Woody', color: '#dee2e6' }, { name: 'Musty/Earthy', color: '#dee2e6' }, { name: 'Musty/Dusty', color: '#dee2e6' }] },
      { name: 'Chemical', color: '#ced4da', sub: [{ name: 'Bitter', color: '#ced4da' }, { name: 'Salty', color: '#ced4da' }, { name: 'Medicinal', color: '#ced4da' }, { name: 'Petroleum', color: '#ced4da' }, { name: 'Skunky', color: '#ced4da' }, { name: 'Rubber', color: '#ced4da' }] }
    ]
  }
];
