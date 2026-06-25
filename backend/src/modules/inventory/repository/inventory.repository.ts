import type { Item, ItemCategory } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

export const inventoryRepository = {
  catalog(): Promise<Item[]> {
    return prisma.item.findMany({
      orderBy: [{ category: 'asc' }, { rarity: 'asc' }, { name: 'asc' }],
    });
  },

  defaults(): Promise<Item[]> {
    return prisma.item.findMany({ where: { isDefault: true } });
  },

  userInventory(userId: string) {
    return prisma.inventoryItem.findMany({ where: { userId }, include: { item: true } });
  },

  findItemByKey(key: string): Promise<Item | null> {
    return prisma.item.findUnique({ where: { key } });
  },

  findInventory(userId: string, itemId: string) {
    return prisma.inventoryItem.findUnique({ where: { userId_itemId: { userId, itemId } } });
  },

  /** Grants an item if the user doesn't already own it. */
  grantIfMissing(userId: string, itemId: string, equipped: boolean) {
    return prisma.inventoryItem.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: { userId, itemId, equipped },
      update: {},
    });
  },

  /** Equips one item in a category, unequipping the others the user owns there. */
  async equipExclusive(userId: string, invItemId: string, category: ItemCategory): Promise<void> {
    const owned = await prisma.inventoryItem.findMany({
      where: { userId, item: { category } },
      select: { id: true },
    });
    await prisma.inventoryItem.updateMany({
      where: { id: { in: owned.map((o) => o.id) } },
      data: { equipped: false },
    });
    await prisma.inventoryItem.update({ where: { id: invItemId }, data: { equipped: true } });
  },
};
