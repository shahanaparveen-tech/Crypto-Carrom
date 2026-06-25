-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GUEST', 'GOOGLE', 'FACEBOOK', 'EMAIL');

-- AlterTable: make email/passwordHash nullable, add provider/guest/firebase fields
ALTER TABLE "users"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "passwordHash" DROP NOT NULL,
  ADD COLUMN "provider" "AuthProvider" NOT NULL DEFAULT 'EMAIL',
  ADD COLUMN "isGuest" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "firebaseUid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");
