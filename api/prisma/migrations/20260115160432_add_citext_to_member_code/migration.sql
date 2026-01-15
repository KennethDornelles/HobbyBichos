/*
Warnings:

- The primary key for the `member_codes` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- CreateExtension for citext (case-insensitive text)
CREATE EXTENSION IF NOT EXISTS citext;

-- AlterTable
ALTER TABLE "member_codes"
DROP CONSTRAINT "member_codes_pkey",
ALTER COLUMN "code"
SET
    DATA TYPE CITEXT,
ADD CONSTRAINT "member_codes_pkey" PRIMARY KEY ("code");