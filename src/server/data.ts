import { aurora, isMockMode } from "@/server/aurora/client";
import type { Whoami, WalletTransactionsPage } from "@/server/aurora/types";

export async function loadWhoami(): Promise<Whoami | null> {
  try {
    return await aurora.validate();
  } catch {
    return null;
  }
}

export async function loadWalletEstimate(): Promise<{
  cents: number;
  currency: string;
  page: WalletTransactionsPage | null;
  error?: string;
}> {
  try {
    const page = await aurora.listTransactions({
      page: 1,
      page_size: 100,
      status: "completed",
    });
    const byCurrency = new Map<string, number>();
    for (const tx of page.transactions) {
      const cur = tx.currency || "USD";
      byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + tx.amount_cents);
    }
    const preferred =
      byCurrency.get("USD") !== undefined
        ? "USD"
        : [...byCurrency.keys()][0] ?? "USD";
    return { cents: byCurrency.get(preferred) ?? 0, currency: preferred, page };
  } catch (error) {
    return {
      cents: 0,
      currency: "USD",
      page: null,
      error: error instanceof Error ? error.message : "Wallet indisponible",
    };
  }
}

export { isMockMode };
