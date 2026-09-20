export const AD_PLATFORMS = [
  "UNKNOWN",
  "META",
  "GOOGLE",
  "TIKTOK",
  "SNAPCHAT",
  "BING",
  "OUTBRAIN",
  "TABOOLA",
  "NEWSBREAK",
  "MEDIAGO",
] as const;

export type AdPlatform = (typeof AD_PLATFORMS)[number];

export type Currency = "USD" | "EUR" | "GBP" | "unknown";

export type Envelope<T> = {
  data: T;
  metadata?: { request_id?: string; timestamp?: string };
};

export type Whoami = {
  api_key_valid: boolean;
  company_id: string;
  permissions: string[];
  rate_limit_tier: "STANDARD" | "ELEVATED" | "UNLIMITED";
  execution_mode: "LIVE" | "DRY_RUN";
  dry_run: boolean;
  real_mutations_allowed: boolean;
  real_provider_calls_allowed: boolean;
  message: string;
};

export type TransactionUser = { id: string; name: string };

export type TransactionAdAccount = {
  id: string;
  type: AdPlatform | string;
  name?: string;
  external_account_id?: string;
};

export type TransactionApplication = {
  id: string;
  type: AdPlatform | string;
  request_id?: string;
};

export type WalletTransaction = {
  id: string;
  reference_id?: string;
  action: "unknown" | "added" | "removed";
  source: string;
  status: "pending" | "completed";
  amount_cents: number;
  currency: Currency | string;
  invoice_number?: string;
  payout_request_id?: string;
  provider_reference?: string;
  created_by?: TransactionUser | null;
  ad_account?: TransactionAdAccount | null;
  ad_account_application?: TransactionApplication | null;
  created_at: string;
};

export type WalletTransactionsPage = {
  transactions: WalletTransaction[];
  page: number;
  page_size: number;
  page_count: number;
  total: number;
};

export type AdAccountBalance = {
  id: string;
  usd_cents: number;
  eur_cents: number;
  gbp_cents: number;
};

export type TopUpsSummary = {
  lifetime_gross_top_ups: number;
  clearable_amount: number;
  approved_clear_funds: number;
  reverted_top_ups: number;
  fees_total: number;
  last_top_up_at?: string | null;
};

export type AdAccount = {
  id: string;
  type: AdPlatform | string;
  status: "ACTIVE" | "DISABLED" | "PAUSED" | "RESTRICTED" | string;
  name?: string;
  currency: Currency | string;
  provider?: string;
  hidden: boolean;
  properties: Record<string, unknown>;
  balance?: AdAccountBalance;
  top_ups_summary?: TopUpsSummary;
  created_at: string;
  updated_at: string;
};

export type TopUpCreated = {
  id: string;
  short_request_id: string | null;
  status: string;
  replayed: boolean;
  fee_calculation_mode: string;
  fee_percentage: number | null;
  requested_amount_cents: number | null;
  charged_to_wallet_cents: number;
  fee_cents: number;
  credited_to_account_cents: number;
};

export type ClearFundsCreated = {
  id: string;
  status: string;
  amount_to_clear_cents?: number;
  additional_fee_cents?: number;
  funds_cleared_cents?: number;
  total_returned_cents?: number;
  message?: string;
  created_at: string;
  updated_at: string;
};

export type BmShareCreated = {
  id: string;
  business_manager_value: string;
  business_manager_email_value?: string;
  status: string;
  bm_share_from_application: boolean;
  created_at: string;
  updated_at: string;
};

export type BulkBmShareCreated = {
  bulk_request_id: string;
  requests: BmShareCreated[];
};

export type ApplicationMessage = {
  id: string;
  content: string;
  author: { id: string; name: string };
  created_at: string;
  updated_at: string;
};

export type AdAccountApplication = {
  id: string;
  type: AdPlatform | string;
  properties: Record<string, unknown>;
  currency: Currency | string;
  status: string;
  top_up_amounts: Record<string, number>;
  total_top_up_cents: number;
  total_fee_cents: number;
  changes_required: string;
  creation_provider?: string;
  request_id?: string;
  messages?: ApplicationMessage[];
  created_at: string;
  updated_at: string;
};

export type BeginApplication = {
  request_id: string | null;
  session_required: boolean;
};

export type PlatformConfigItem = {
  type: string;
  subtype?: string;
  supported_currencies: string[];
  fee_percentages: Record<string, unknown>;
  minimum_top_up_cents: number;
};

export type PlatformConfig = {
  platforms: PlatformConfigItem[];
};

export type TransactionListQuery = {
  page?: number;
  page_size?: number;
  search?: string;
  type?: "incoming" | "outgoing" | "converted" | "all";
  status?: "pending" | "completed";
  currency?: "USD" | "EUR" | "GBP";
  reference_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: "timestamp" | "amount";
  sort_order?: "asc" | "desc";
};

export type AuroraFetchOptions = {
  method?: string;
  body?: unknown;
  idempotencyKey?: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
};
