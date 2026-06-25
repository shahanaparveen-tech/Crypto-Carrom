-- Add premium gems currency to wallets
ALTER TABLE "wallets" ADD COLUMN "gems" BIGINT NOT NULL DEFAULT 0;
