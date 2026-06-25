import { walletService } from '../../wallet';
import { NotFoundError } from '../../../shared/errors';
import { CHESTS, findChest } from '../data/shopCatalog';

const randomInt = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

export const shopService = {
  /** Public catalog (gem costs as strings for JSON). */
  catalog() {
    return {
      chests: CHESTS.map((c) => ({ id: c.id, name: c.name, gems: c.gems.toString() })),
    };
  },

  /** Buys a chest: debits gems, credits a random coin reward. */
  async buyChest(userId: string, chestId: string) {
    const chest = findChest(chestId);
    if (!chest) throw new NotFoundError('Chest not found');

    // Debit gems first (throws InsufficientGems if not enough).
    const { gems } = await walletService.debitGems(userId, chest.gems);

    const reward = BigInt(randomInt(chest.coinMin, chest.coinMax));
    const { balance } = await walletService.credit(userId, reward, 'PURCHASE', `chest:${chestId}`);

    return {
      chestId,
      reward: reward.toString(),
      coins: balance.toString(),
      gems: gems.toString(),
    };
  },
};
