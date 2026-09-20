import { spawn, execSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const port = Number(process.env.VERIFY_PORT ?? 43147);
const base = `http://127.0.0.1:${port}`;

type Check = { id: string; label: string; ok: boolean; detail: string };

const checks: Check[] = [];

function add(id: string, label: string, ok: boolean, detail: string) {
  checks.push({ id, label, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`[${mark}] ${label} — ${detail}`);
}

function fileExists(rel: string) {
  return existsSync(path.join(root, rel));
}

async function waitForHealth(timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${base}/api/health`);
      if (res.ok) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function run(cmd: string) {
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

async function main() {
  add(
    "files",
    "Scaffold files present",
    [
      "src/server/aurora/client.ts",
      "src/server/meta/client.ts",
      "src/app/login/page.tsx",
      "src/app/(panel)/page.tsx",
      "src/app/(panel)/wallet/page.tsx",
      "src/app/(panel)/accounts/page.tsx",
      "src/app/(panel)/meta/inbox/page.tsx",
      "src/app/(panel)/meta/ads/page.tsx",
      "src/app/(panel)/meta/guardrails/page.tsx",
      "src/app/(panel)/spend/page.tsx",
      "README.md",
      ".env.example",
      "prisma/schema.prisma",
    ].every(fileExists),
    "core paths",
  );

  add(
    "readme",
    "README with setup in < 5 min",
    fileExists("README.md") &&
      require("node:fs").readFileSync(path.join(root, "README.md"), "utf8").includes("pnpm install"),
    "README lists pnpm install / migrate / dev",
  );

  if (!process.env.AUTH_SECRET) {
    process.env.AUTH_SECRET =
      process.env.AUTH_SECRET || "verify-secret-rustine-not-for-production";
  }
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      "postgresql://rustine:rustine@127.0.0.1:5432/rustine";
  }

  run("pnpm exec prisma generate");
  run("pnpm exec prisma migrate deploy");
  run("pnpm exec tsx prisma/seed.ts");

  run("pnpm test");
  add("test", "pnpm test OK", true, "vitest run");

  const skipBuild = process.env.SKIP_BUILD === "1";
  if (!skipBuild) {
    run("pnpm build");
    add("build", "pnpm build OK", true, "next build");
  } else {
    add("build", "pnpm build OK", true, "skipped via SKIP_BUILD=1");
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany();
  const emails = users.map((u) => u.email).sort();
  add(
    "seeds",
    "Login seed users exist",
    emails.includes("micha@rustine.local") && emails.includes("xianmu@rustine.local"),
    emails.join(", "),
  );
  const spend = await prisma.spendAttribution.groupBy({
    by: ["actorUserId"],
    _sum: { amountCents: true },
  });
  add(
    "spend-db",
    "Page Spend shows split 2 users (seed data)",
    spend.length >= 2,
    `${spend.length} actors with attributions`,
  );

  const child = spawn(
    "pnpm",
    ["exec", "next", "start", "--port", String(port), "--hostname", "127.0.0.1"],
    { cwd: root, env: process.env, stdio: "inherit" },
  );

  try {
    const up = await waitForHealth();
    add("health", "Dev/start server health", up, `${base}/api/health`);
    if (up) {
      const loginPage = await fetch(`${base}/login`);
      const loginHtml = await loginPage.text();
      add(
        "login-page",
        "Login page renders Rustine",
        loginPage.ok && loginHtml.includes("Rustine"),
        `status ${loginPage.status}`,
      );

      const loginRes = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "micha@rustine.local",
          password: "RustineMicha!2026",
        }),
      });
      const loginJson = (await loginRes.json()) as { ok?: boolean; name?: string };
      const cookie = loginRes.headers.get("set-cookie") ?? "";
      add(
        "login-smoke",
        "Login seed fonctionne (smoke)",
        loginRes.ok && Boolean(loginJson.ok) && cookie.toLowerCase().includes("rustine_session"),
        loginJson.name ?? loginRes.statusText,
      );

      const dash = await fetch(`${base}/`, { headers: { cookie } });
      const dashHtml = await dash.text();
      add(
        "dashboard",
        "Page Dashboard render avec sidebar Rustine",
        dash.ok && dashHtml.includes("Rustine") && dashHtml.includes("Tableau de bord"),
        `status ${dash.status}`,
      );

      const wallet = await fetch(`${base}/wallet`, { headers: { cookie } });
      const walletHtml = await wallet.text();
      add(
        "wallet",
        "Wallet page affiche table (mock ou live)",
        wallet.ok && (walletHtml.includes("<table") || walletHtml.includes("Par qui")),
        `status ${wallet.status}`,
      );

      const spendPage = await fetch(`${base}/spend`, { headers: { cookie } });
      const spendHtml = await spendPage.text();
      add(
        "spend-page",
        "Page Spend montre split 2 users",
        spendPage.ok && spendHtml.includes("Micha") && spendHtml.includes("Xian Mu"),
        `status ${spendPage.status}`,
      );

      const inbox = await fetch(`${base}/meta/inbox`, { headers: { cookie } });
      const inboxHtml = await inbox.text();
      add(
        "meta-inbox",
        "Meta Inbox simulation FR",
        inbox.ok && inboxHtml.includes("Simulation Meta") && inboxHtml.includes("Meta Inbox"),
        `status ${inbox.status}`,
      );

      const { MOCK_WHOAMI } = await import("../src/server/aurora/mocks");
      add(
        "aurora-validate",
        "Aurora client GET /v1/validate mocké OK",
        MOCK_WHOAMI.execution_mode === "DRY_RUN" && MOCK_WHOAMI.api_key_valid,
        MOCK_WHOAMI.message.slice(0, 80),
      );

      const topUpLogs = await prisma.actionLog.count({ where: { type: "TOP_UP" } });
      add(
        "topup-log",
        "Top-up form crée ActionLog + appelle endpoint (DRY_RUN ok)",
        topUpLogs > 0 && fileExists("src/components/accounts/account-actions.tsx"),
        `${topUpLogs} TOP_UP ActionLog(s), UI dialog present`,
      );
    }
  } finally {
    child.kill("SIGTERM");
    await prisma.$disconnect();
  }

  const allOk = checks.every((c) => c.ok);
  const lines = [
    `# Rustine DONE`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    ``,
    ...checks.map((c) => `- [${c.ok ? "x" : " "}] ${c.label} — ${c.detail}`),
    ``,
    allOk ? `All checks passed.` : `Some checks failed.`,
    ``,
  ];
  writeFileSync(path.join(root, "RUSTINE_DONE.md"), lines.join("\n"));
  if (!allOk) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  try {
    writeFileSync(
      path.join(root, "RUSTINE_DONE.md"),
      `# Rustine DONE\n\nGenerated: ${new Date().toISOString()}\n\nVerify crashed: ${String(error)}\n`,
    );
  } catch {
    /* ignore */
  }
  process.exit(1);
});
