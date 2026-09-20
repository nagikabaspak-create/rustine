import type {
  AdAccount,
  AdAccountApplication,
  ApplicationMessage,
  BeginApplication,
  BulkBmShareCreated,
  BmShareCreated,
  ClearFundsCreated,
  PlatformConfig,
  TopUpCreated,
  WalletTransaction,
  WalletTransactionsPage,
  Whoami,
} from "./types";

const now = new Date().toISOString();

export const MOCK_WHOAMI: Whoami = {
  api_key_valid: true,
  company_id: "comp_rustine_mock",
  permissions: [
    "ad_accounts:read",
    "ad_accounts:write",
    "wallet:read",
    "applications:read",
    "applications:write",
  ],
  rate_limit_tier: "STANDARD",
  execution_mode: "DRY_RUN",
  dry_run: true,
  real_mutations_allowed: false,
  real_provider_calls_allowed: false,
  message:
    "Mode mock Rustine — AURORA_API_KEY absente. Les lectures et mutations sont simulées (DRY_RUN).",
};

export const MOCK_ACCOUNTS: AdAccount[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    type: "META",
    status: "ACTIVE",
    name: "Rustine — Prospecting US",
    currency: "USD",
    provider: "Aurora Internal BM",
    hidden: false,
    properties: { timezone: "America/New_York" },
    balance: {
      id: "bal-meta-1",
      usd_cents: 128450,
      eur_cents: 0,
      gbp_cents: 0,
    },
    top_ups_summary: {
      lifetime_gross_top_ups: 12500,
      clearable_amount: 1284.5,
      approved_clear_funds: 400,
      reverted_top_ups: 0,
      fees_total: 500,
      last_top_up_at: now,
    },
    created_at: "2026-03-12T09:00:00.000Z",
    updated_at: now,
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    type: "TIKTOK",
    status: "ACTIVE",
    name: "Rustine — TikTok BR",
    currency: "USD",
    provider: "Cheetah",
    hidden: false,
    properties: {},
    balance: {
      id: "bal-tt-1",
      usd_cents: 42100,
      eur_cents: 0,
      gbp_cents: 0,
    },
    top_ups_summary: {
      lifetime_gross_top_ups: 3200,
      clearable_amount: 421,
      approved_clear_funds: 0,
      reverted_top_ups: 0,
      fees_total: 128,
      last_top_up_at: "2026-08-02T14:22:00.000Z",
    },
    created_at: "2026-05-01T11:30:00.000Z",
    updated_at: now,
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    type: "GOOGLE",
    status: "PAUSED",
    name: "Rustine — Search FR",
    currency: "EUR",
    provider: "Aurora Google MCC",
    hidden: false,
    properties: {},
    balance: {
      id: "bal-gg-1",
      usd_cents: 0,
      eur_cents: 8900,
      gbp_cents: 0,
    },
    created_at: "2026-01-18T08:00:00.000Z",
    updated_at: now,
  },
];

export const MOCK_TRANSACTIONS: WalletTransaction[] = [
  {
    id: "tx-001-bank",
    reference_id: "BANK-IN-88421",
    action: "added",
    source: "bank_transfer",
    status: "completed",
    amount_cents: 2500000,
    currency: "USD",
    created_by: null,
    created_at: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "tx-002-topup-meta",
    reference_id: "META-TOP-SYD34B7A",
    action: "removed",
    source: "ad_account_top_up",
    status: "completed",
    amount_cents: -83200,
    currency: "USD",
    created_by: { id: "aurora-user-micha", name: "Micha" },
    ad_account: {
      id: MOCK_ACCOUNTS[0].id,
      type: "META",
      name: MOCK_ACCOUNTS[0].name,
    },
    created_at: "2026-09-10T15:41:00.000Z",
  },
  {
    id: "tx-003-topup-tt",
    reference_id: "TIKTOK-TOP-K8Q1",
    action: "removed",
    source: "ad_account_top_up",
    status: "completed",
    amount_cents: -52000,
    currency: "USD",
    created_by: { id: "aurora-user-xian", name: "Xian Mu" },
    ad_account: {
      id: MOCK_ACCOUNTS[1].id,
      type: "TIKTOK",
      name: MOCK_ACCOUNTS[1].name,
    },
    created_at: "2026-09-14T09:12:00.000Z",
  },
  {
    id: "tx-004-clear",
    reference_id: "META-CLR-0912",
    action: "added",
    source: "ad_account_clear_funds",
    status: "completed",
    amount_cents: 15000,
    currency: "USD",
    created_by: { id: "aurora-user-micha", name: "Micha" },
    ad_account: {
      id: MOCK_ACCOUNTS[0].id,
      type: "META",
      name: MOCK_ACCOUNTS[0].name,
    },
    created_at: "2026-09-16T18:05:00.000Z",
  },
  {
    id: "tx-005-pending",
    reference_id: "BANK-IN-99102",
    action: "added",
    source: "bank_transfer",
    status: "pending",
    amount_cents: 100000,
    currency: "EUR",
    created_at: "2026-09-18T07:30:00.000Z",
  },
];

export const MOCK_APPLICATIONS: AdAccountApplication[] = [
  {
    id: "app-001-meta",
    type: "META",
    properties: { names: ["Rustine — Retargeting EU"] },
    currency: "EUR",
    status: "UNDER_REVIEW",
    top_up_amounts: { default: 50000 },
    total_top_up_cents: 50000,
    total_fee_cents: 2000,
    changes_required: "",
    request_id: "META-APL-LBGSUZMQ",
    messages: [
      {
        id: "msg-1",
        content: "Dossier reçu, en cours de revue.",
        author: { id: "aurora-ops", name: "Aurora Ops" },
        created_at: "2026-09-12T11:00:00.000Z",
        updated_at: "2026-09-12T11:00:00.000Z",
      },
    ],
    created_at: "2026-09-12T10:40:00.000Z",
    updated_at: "2026-09-12T11:00:00.000Z",
  },
];

export const MOCK_PLATFORM_CONFIG: PlatformConfig = {
  platforms: [
    {
      type: "META",
      subtype: "Standard",
      supported_currencies: ["USD", "EUR", "GBP"],
      fee_percentages: { USD: 0.04, EUR: 0.04, GBP: 0.04 },
      minimum_top_up_cents: 10000,
    },
    {
      type: "TIKTOK",
      supported_currencies: ["USD"],
      fee_percentages: { USD: 0.04 },
      minimum_top_up_cents: 10000,
    },
    {
      type: "GOOGLE",
      supported_currencies: ["USD", "EUR"],
      fee_percentages: { USD: 0.03, EUR: 0.03 },
      minimum_top_up_cents: 5000,
    },
  ],
};

export function mockTopUp(amount: number, addFee: boolean): TopUpCreated {
  const requested = Math.round(amount * 100);
  const fee = Math.round(requested * 0.04);
  const charged = addFee ? requested + fee : requested;
  const credited = addFee ? requested : requested - fee;
  return {
    id: crypto.randomUUID(),
    short_request_id: `MOCK-TOP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: "PENDING",
    replayed: false,
    fee_calculation_mode: addFee
      ? "ADD_FEE_ON_TOP_OF_REQUESTED_AMOUNT"
      : "DEDUCT_FEE_FROM_REQUESTED_AMOUNT",
    fee_percentage: 0.04,
    requested_amount_cents: requested,
    charged_to_wallet_cents: charged,
    fee_cents: fee,
    credited_to_account_cents: credited,
  };
}

export function mockClearFunds(amount?: number): ClearFundsCreated {
  const cents = Math.round((amount ?? 150) * 100);
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    status: "PENDING",
    amount_to_clear_cents: cents,
    funds_cleared_cents: cents,
    total_returned_cents: cents,
    created_at: ts,
    updated_at: ts,
  };
}

export function mockBmShare(
  businessManagerValue: string,
  email?: string,
): BmShareCreated {
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    business_manager_value: businessManagerValue,
    business_manager_email_value: email,
    status: "PENDING",
    bm_share_from_application: false,
    created_at: ts,
    updated_at: ts,
  };
}

export function mockBulkBmShare(
  requests: { account_id: string; business_manager_value: string; business_manager_email_value?: string }[],
): BulkBmShareCreated {
  return {
    bulk_request_id: crypto.randomUUID(),
    requests: requests.map((r) => mockBmShare(r.business_manager_value, r.business_manager_email_value)),
  };
}

export function mockBegin(type: string): BeginApplication {
  if (type === "META") {
    return { request_id: crypto.randomUUID(), session_required: true };
  }
  return { request_id: null, session_required: false };
}

export function mockCreateApplication(
  type: string,
  data: Record<string, unknown>,
): AdAccountApplication {
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    properties: data,
    currency: (data.currency as string) ?? "USD",
    status: "PENDING",
    top_up_amounts: (data.top_up_amounts as Record<string, number>) ?? {},
    total_top_up_cents: 0,
    total_fee_cents: 0,
    changes_required: "",
    request_id: `${type}-APL-MOCK`,
    messages: [],
    created_at: ts,
    updated_at: ts,
  };
}

export function mockMessage(content: string): ApplicationMessage {
  const ts = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    content,
    author: { id: "rustine-mock", name: "Rustine" },
    created_at: ts,
    updated_at: ts,
  };
}

export function paginateTransactions(query: {
  page?: number;
  page_size?: number;
  search?: string;
  type?: string;
  status?: string;
  currency?: string;
}): WalletTransactionsPage {
  let rows = [...MOCK_TRANSACTIONS];
  if (query.search) {
    const q = query.search.toLowerCase();
    rows = rows.filter((t) =>
      JSON.stringify(t).toLowerCase().includes(q),
    );
  }
  if (query.status) rows = rows.filter((t) => t.status === query.status);
  if (query.currency) rows = rows.filter((t) => t.currency === query.currency);
  if (query.type === "incoming") rows = rows.filter((t) => t.action === "added");
  if (query.type === "outgoing") rows = rows.filter((t) => t.action === "removed");
  const page = query.page ?? 1;
  const pageSize = query.page_size ?? 50;
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    transactions: rows.slice(start, start + pageSize),
    page,
    page_size: pageSize,
    page_count: pageCount,
    total,
  };
}
