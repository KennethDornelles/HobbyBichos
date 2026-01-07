-- CreateTable
CREATE TABLE "store_business_hours" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,

    CONSTRAINT "store_business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_exclusions" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "store_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_business_hours_storeId_idx" ON "store_business_hours"("storeId");

-- CreateIndex
CREATE INDEX "store_exclusions_storeId_idx" ON "store_exclusions"("storeId");

-- CreateIndex
CREATE INDEX "store_exclusions_date_idx" ON "store_exclusions"("date");

-- AddForeignKey
ALTER TABLE "store_business_hours" ADD CONSTRAINT "store_business_hours_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_exclusions" ADD CONSTRAINT "store_exclusions_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
