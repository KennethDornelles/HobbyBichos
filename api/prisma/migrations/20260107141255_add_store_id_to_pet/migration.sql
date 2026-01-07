/*
  Warnings:

  - Added the required column `storeId` to the `pets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "storeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
