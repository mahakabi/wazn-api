-- Sign-in moves from phone OTP to email OTP: email becomes the identity, phone is collected at booking.
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
