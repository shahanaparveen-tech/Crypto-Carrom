import { PrismaClient, type ItemCategory, type ItemRarity } from '@prisma/client';

const prisma = new PrismaClient();

interface Seed {
  id: string;
  name: string;
  category: ItemCategory;
  rarity?: ItemRarity;
  isDefault?: boolean;
}

const ITEMS: Seed[] = [
  // Strikers
  { id: 'blaze', name: 'Blaze', category: 'STRIKER', isDefault: true },
  { id: 'sunshine', name: 'Sunshine', category: 'STRIKER' },
  { id: 'arjun', name: 'Arjun', category: 'STRIKER', rarity: 'RARE' },
  { id: 'sniper', name: 'Sniper', category: 'STRIKER', rarity: 'EPIC' },
  { id: 'blood', name: 'Blood', category: 'STRIKER', rarity: 'RARE' },
  { id: 'divine', name: 'Divine', category: 'STRIKER', rarity: 'EPIC' },
  { id: 'zen', name: 'Zen', category: 'STRIKER' },
  { id: 'taj', name: 'Taj', category: 'STRIKER' },
  { id: 'chakra', name: 'Chakra', category: 'STRIKER' },
  // Pucks
  { id: 'black', name: 'Black', category: 'PUCK', isDefault: true },
  { id: 'white', name: 'White', category: 'PUCK' },
  { id: 'vervain', name: 'Vervain', category: 'PUCK' },
  { id: 'swathe', name: 'Swathe', category: 'PUCK', rarity: 'RARE' },
  { id: 'aqua', name: 'Aqua', category: 'PUCK', rarity: 'EPIC' },
  { id: 'iris', name: 'Iris', category: 'PUCK' },
  { id: 'enchant', name: 'Enchant', category: 'PUCK', rarity: 'RARE' },
  { id: 'stardust', name: 'Stardust', category: 'PUCK', rarity: 'EPIC' },
  { id: 'oscar', name: 'Oscar', category: 'PUCK' },
  // Trails
  { id: 'no-trail', name: 'No Trail', category: 'TRAIL', isDefault: true },
  { id: 'burst', name: 'Burst', category: 'TRAIL' },
  { id: 'verdant', name: 'Verdant', category: 'TRAIL' },
  { id: 'death', name: 'Death', category: 'TRAIL', rarity: 'RARE' },
  { id: 'haunted', name: 'Haunted', category: 'TRAIL', rarity: 'RARE' },
  { id: 'pennon', name: 'Pennon', category: 'TRAIL', rarity: 'RARE' },
  // Pockets
  { id: 'no-pocket', name: 'No Pocket Effect', category: 'POCKET', isDefault: true },
  { id: 'firestarter', name: 'Firestarter', category: 'POCKET' },
  { id: 'jade-echo', name: 'Jade Echo', category: 'POCKET', rarity: 'RARE' },
  { id: 'mystic', name: 'Mystic', category: 'POCKET', rarity: 'EPIC' },
  { id: 'plasma', name: 'Plasma', category: 'POCKET', rarity: 'EPIC' },
  // Powers
  { id: 'default', name: 'Default', category: 'POWER', isDefault: true },
  { id: 'spine', name: 'Spine', category: 'POWER' },
  { id: 'venom', name: 'Venom', category: 'POWER' },
  { id: 'particle', name: 'Particle', category: 'POWER' },
  { id: 'radiance', name: 'Radiance', category: 'POWER' },
  { id: 'reptile', name: 'Reptile', category: 'POWER' },
];

const main = async (): Promise<void> => {
  for (const it of ITEMS) {
    const key = `${it.category.toLowerCase()}:${it.id}`;
    await prisma.item.upsert({
      where: { key },
      create: {
        key,
        name: it.name,
        category: it.category,
        rarity: it.rarity ?? 'STANDARD',
        isDefault: it.isDefault ?? false,
      },
      update: { name: it.name, rarity: it.rarity ?? 'STANDARD', isDefault: it.isDefault ?? false },
    });
  }
  const count = await prisma.item.count();
  console.log(`Seeded items. Total in catalog: ${count}`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
