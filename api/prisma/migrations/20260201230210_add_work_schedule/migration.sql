-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "professionalId" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "commissionPercentage" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "commissionPercentage" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "pixKey" TEXT;

-- CreateTable
CREATE TABLE "work_schedules" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "startBreak" TEXT,
    "endBreak" TEXT,
    "isDayOff" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "work_schedules_userId_weekday_key" ON "work_schedules"("userId", "weekday");

-- CreateIndex
CREATE INDEX "commissions_professionalId_idx" ON "commissions"("professionalId");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- AddForeignKey
ALTER TABLE "work_schedules" ADD CONSTRAINT "work_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
