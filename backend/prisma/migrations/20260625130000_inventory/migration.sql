-- Cosmetics: item catalog + per-user inventory
CREATE TYPE "ItemCategory" AS ENUM ('STRIKER', 'PUCK', 'TRAIL', 'POCKET', 'POWER', 'AVATAR', 'FRAME');
CREATE TYPE "ItemRarity" AS ENUM ('STANDARD', 'RARE', 'EPIC', 'LEGENDARY');

CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "rarity" "ItemRarity" NOT NULL DEFAULT 'STANDARD',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "items_key_key" ON "items"("key");
CREATE INDEX "items_category_idx" ON "items"("category");

CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "inventory_items_userId_itemId_key" ON "inventory_items"("userId", "itemId");
CREATE INDEX "inventory_items_userId_idx" ON "inventory_items"("userId");

ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
