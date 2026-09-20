-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "auroraUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "auroraEntityId" TEXT,
    "payloadJson" TEXT NOT NULL,
    "resultJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpendAttribution" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "auroraTransactionId" TEXT,
    "actionLogId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpendAttribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedAdAccount" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "name" TEXT,
    "currency" TEXT NOT NULL,
    "provider" TEXT,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "usdCents" INTEGER NOT NULL DEFAULT 0,
    "eurCents" INTEGER NOT NULL DEFAULT 0,
    "gbpCents" INTEGER NOT NULL DEFAULT 0,
    "payloadJson" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedAdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ActionLog_actorUserId_idx" ON "ActionLog"("actorUserId");

-- CreateIndex
CREATE INDEX "ActionLog_createdAt_idx" ON "ActionLog"("createdAt");

-- CreateIndex
CREATE INDEX "SpendAttribution_actorUserId_idx" ON "SpendAttribution"("actorUserId");

-- CreateIndex
CREATE INDEX "SpendAttribution_auroraTransactionId_idx" ON "SpendAttribution"("auroraTransactionId");

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendAttribution" ADD CONSTRAINT "SpendAttribution_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendAttribution" ADD CONSTRAINT "SpendAttribution_actionLogId_fkey" FOREIGN KEY ("actionLogId") REFERENCES "ActionLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
