-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "loyalty_birthday_awards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_birthday_awards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "loyalty_birthday_awards_userId_idx" ON "loyalty_birthday_awards"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_birthday_awards_userId_year_key" ON "loyalty_birthday_awards"("userId", "year");

-- AddForeignKey
ALTER TABLE "loyalty_birthday_awards" ADD CONSTRAINT "loyalty_birthday_awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
