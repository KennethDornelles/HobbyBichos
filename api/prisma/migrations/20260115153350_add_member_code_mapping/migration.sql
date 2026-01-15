-- CreateTable
CREATE TABLE "member_codes" (
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_codes_pkey" PRIMARY KEY ("code")
);

-- AddForeignKey
ALTER TABLE "member_codes" ADD CONSTRAINT "member_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
