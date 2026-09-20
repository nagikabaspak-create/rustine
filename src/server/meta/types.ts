export type MetaCommentTag = "spam" | "question" | "lead" | "neutral";

export type MetaAuthor = {
  id: string;
  name: string;
};

export type MetaComment = {
  id: string;
  message: string;
  created_time: string;
  from: MetaAuthor;
  post_id: string;
  post_message?: string;
  ad_id?: string;
  ad_name?: string;
  permalink?: string;
  hidden: boolean;
  deleted: boolean;
  tags: MetaCommentTag[];
  replies: MetaCommentReply[];
};

export type MetaCommentReply = {
  id: string;
  message: string;
  created_time: string;
  from: MetaAuthor;
};

export type MetaSuggestedReply = {
  comment_id: string;
  text: string;
  rationale: string;
};

export type MetaCampaign = {
  id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  objective: string;
  spend: number;
  currency: string;
};

export type MetaAdSet = {
  id: string;
  campaign_id: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  daily_budget: number;
};

export type MetaAd = {
  id: string;
  adset_id: string;
  campaign_id: string;
  campaign_name: string;
  name: string;
  status: "ACTIVE" | "PAUSED";
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  currency: string;
};

export type MetaUsageSnapshot = {
  mock: boolean;
  killSwitch: boolean;
  appPct: number;
  accountPct: number;
  insightsPct: number;
  dailyCalls: number;
  dailyBudget: number;
  repliesThisHour: number;
  hidesThisHour: number;
  deletesThisHour: number;
  adsMutationsThisHour: number;
  maxRepliesPerHour: number;
  maxHidesPerHour: number;
  maxDeletesPerHour: number;
  maxAdsMutationsPerHour: number;
  lastHeaders?: ParsedMetaUsage["raw"];
};

export type MetaMutationKind = "reply" | "hide" | "delete" | "ads";

export type MetaFetchOptions = {
  method?: string;
  body?: Record<string, string | number | boolean | undefined>;
  query?: Record<string, string | number | boolean | undefined | null>;
  timeoutMs?: number;
  tokenKind?: "page" | "ads";
};

export type GraphErrorBody = {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };
};

export type ParsedMetaUsage = {
  appPct: number | null;
  accountPct: number | null;
  insightsAppPct: number | null;
  insightsAccountPct: number | null;
  raw: {
    businessUseCase: unknown;
    adAccountUsage: unknown;
    insightsThrottle: unknown;
  };
};

export type MetaGuardrailsState = {
  killSwitch: boolean;
  appPct: number;
  accountPct: number;
  insightsPct: number;
  dailyCalls: number;
  dailyBudget: number;
  dayKey: string;
  hourKey: string;
  repliesThisHour: number;
  hidesThisHour: number;
  deletesThisHour: number;
  adsMutationsThisHour: number;
  maxRepliesPerHour: number;
  maxHidesPerHour: number;
  maxDeletesPerHour: number;
  maxAdsMutationsPerHour: number;
  lastHeaders?: ParsedMetaUsage["raw"];
};
