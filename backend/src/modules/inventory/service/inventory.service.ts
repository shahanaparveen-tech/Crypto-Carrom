import type { ItemCategory } from '@prisma/client';

import { inventoryRepository } from '../repository/inventory.repository';
import { ForbiddenError, NotFoundError } from '../../../shared/errors';

export interface InventoryItemDto {
  key: string;
  name: string;
  category: ItemCategory;
  rarity: string;
  owned: boolean;
  equipped: boolean;
}

export interface InventoryDto {
  items: InventoryItemDto[];
  equipped: Partial<Record<ItemCategory, string>>;
}

export const inventoryService = {
  /** Returns the full catalog annotated with the user's ownership/equip state. */
  async get(userId: string): Promise<InventoryDto> {
    // Ensure default items are granted (and equipped) on first access.
    const defaults = await inventoryRepository.defaults();
    await Promise.all(defaults.map((d) => inventoryRepository.grantIfMissing(userId, d.id, true)));

    const [catalog, inventory] = await Promise.all([
      inventoryRepository.catalog(),
      inventoryRepository.userInventory(userId),
    ]);

    const owned = new Map(inventory.map((inv) => [inv.itemId, inv.equipped]));
    const equipped: Partial<Record<ItemCategory, string>> = {};
    for (const inv of inventory) if (inv.equipped) equipped[inv.item.category] = inv.item.key;

    const items: InventoryItemDto[] = catalog.map((i) => ({
      key: i.key,
      name: i.name,
      category: i.category,
      rarity: i.rarity,
      owned: owned.has(i.id),
      equipped: owned.get(i.id) === true,
    }));

    return { items, equipped };
  },

  /** Equips an owned item in its category. */
  async equip(userId: string, key: string): Promise<InventoryDto> {
    const item = await inventoryRepository.findItemByKey(key);
    if (!item) throw new NotFoundError('Item not found');
    const inv = await inventoryRepository.findInventory(userId, item.id);
    if (!inv) throw new ForbiddenError('You do not own this item');

    await inventoryRepository.equipExclusive(userId, inv.id, item.category);
    return this.get(userId);
  },
};
