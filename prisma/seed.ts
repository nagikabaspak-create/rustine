import { hashPassword } from "../src/server/auth/password";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const michaHash = await hashPassword("RustineMicha!2026");
  const xianHash = await hashPassword("RustineXian!2026");

  const micha = await prisma.user.upsert({
    where: { email: "micha@rustine.local" },
    update: { name: "Micha", role: "ADMIN", passwordHash: michaHash },
    create: {
      email: "micha@rustine.local",
      name: "Micha",
      role: "ADMIN",
      passwordHash: michaHash,
    },
  });

  const xian = await prisma.user.upsert({
    where: { email: "xianmu@rustine.local" },
    update: { name: "Xian Mu", role: "OPERATOR", passwordHash: xianHash },
    create: {
      email: "xianmu@rustine.local",
      name: "Xian Mu",
      role: "OPERATOR",
      passwordHash: xianHash,
    },
  });

  const existingLogs = await prisma.actionLog.count();
  if (existingLogs === 0) {
    const michaTopUp = await prisma.actionLog.create({
      data: {
        actorUserId: micha.id,
        type: "TOP_UP",
        auroraEntityId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        payloadJson: JSON.stringify({ amount: 800, add_fee: true }),
        resultJson: JSON.stringify({ id: "seed-topup-micha", charged_to_wallet_cents: 83200 }),
      },
    });
    await prisma.spendAttribution.create({
      data: {
        actorUserId: micha.id,
        auroraTransactionId: "tx-002-topup-meta",
        actionLogId: michaTopUp.id,
        amountCents: 83200,
        currency: "USD",
        note: "Top-up META Prospecting US (seed)",
        createdAt: new Date("2026-09-10T15:41:00.000Z"),
      },
    });

    const xianTopUp = await prisma.actionLog.create({
      data: {
        actorUserId: xian.id,
        type: "TOP_UP",
        auroraEntityId: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        payloadJson: JSON.stringify({ amount: 500, add_fee: true }),
        resultJson: JSON.stringify({ id: "seed-topup-xian", charged_to_wallet_cents: 52000 }),
      },
    });
    await prisma.spendAttribution.create({
      data: {
        actorUserId: xian.id,
        auroraTransactionId: "tx-003-topup-tt",
        actionLogId: xianTopUp.id,
        amountCents: 52000,
        currency: "USD",
        note: "Top-up TikTok BR (seed)",
        createdAt: new Date("2026-09-14T09:12:00.000Z"),
      },
    });

    const michaClear = await prisma.actionLog.create({
      data: {
        actorUserId: micha.id,
        type: "CLEAR_FUNDS",
        auroraEntityId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        payloadJson: JSON.stringify({ amount_to_clear: 150 }),
        resultJson: JSON.stringify({ id: "seed-clear-micha" }),
      },
    });
    await prisma.spendAttribution.create({
      data: {
        actorUserId: micha.id,
        auroraTransactionId: "tx-004-clear",
        actionLogId: michaClear.id,
        amountCents: -15000,
        currency: "USD",
        note: "Clear funds META (seed)",
        createdAt: new Date("2026-09-16T18:05:00.000Z"),
      },
    });
  }

  await prisma.appSetting.upsert({
    where: { key: "product_name" },
    update: { value: "Rustine" },
    create: { key: "product_name", value: "Rustine" },
  });

  const existingMeta = await prisma.appSetting.findUnique({
    where: { key: "meta_guardrails" },
  });
  if (!existingMeta) {
    const now = new Date();
    await prisma.appSetting.create({
      data: {
        key: "meta_guardrails",
        value: JSON.stringify({
          killSwitch: false,
          appPct: 18,
          accountPct: 11,
          insightsPct: 4,
          dailyCalls: 37,
          dailyBudget: 480,
          dayKey: now.toISOString().slice(0, 10),
          hourKey: now.toISOString().slice(0, 13),
          repliesThisHour: 0,
          hidesThisHour: 0,
          deletesThisHour: 0,
          adsMutationsThisHour: 0,
          maxRepliesPerHour: 20,
          maxHidesPerHour: 30,
          maxDeletesPerHour: 10,
          maxAdsMutationsPerHour: 20,
        }),
      },
    });
  }

  console.log("Seeded Rustine users:", micha.email, xian.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
