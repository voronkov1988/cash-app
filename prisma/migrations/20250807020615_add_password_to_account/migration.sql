/*
  Warnings:

  - You are about to drop the column `balance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Account` table. All the data in the column will be lost.
  - Added the required column `password` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Account_userId_idx";

-- AlterTable
ALTER TABLE "public"."Account" DROP COLUMN "balance",
DROP COLUMN "color",
DROP COLUMN "currency",
DROP COLUMN "type",
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
