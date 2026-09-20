import "server-only";

import { isMetaMockMode, metaAdAccountId, metaPageId } from "./env";
import { MetaError, metaGraphFetch } from "./graph";
import {
  listMockAds,
  listMockCampaigns,
  listMockComments,
  mockDelete,
  mockHide,
  mockReply,
  mockSetAdStatus,
  mockSuggestedReply,
} from "./mocks";
import { withMetaQueue } from "./queue";
import type { MetaAd, MetaCampaign, MetaComment, MetaSuggestedReply } from "./types";

export {
  isMetaMockMode,
  metaAdAccountId,
  metaGraphVersion,
  metaGraphBase,
  metaPageId,
} from "./env";
export { MetaError } from "./graph";
export { mockSuggestedReply };

type GraphList<T> = { data?: T[] };

type GraphComment = {
  id: string;
  message?: string;
  created_time?: string;
  from?: { id: string; name: string };
  permalink_url?: string;
  is_hidden?: boolean;
};

type GraphPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  comments?: GraphList<GraphComment>;
};

type GraphInsights = {
  data?: { spend?: string; impressions?: string; clicks?: string; ctr?: string }[];
};

type GraphAd = {
  id: string;
  name?: string;
  status?: string;
  adset_id?: string;
  campaign_id?: string;
  campaign?: { id?: string; name?: string };
  insights?: GraphInsights;
};

type GraphCampaign = {
  id: string;
  name?: string;
  status?: string;
  objective?: string;
  insights?: GraphInsights;
};

function insightNumber(
  insights: GraphInsights | undefined,
  key: "spend" | "impressions" | "clicks" | "ctr",
): number {
  const row = insights?.data?.[0];
  if (!row) return 0;
  return Number(row[key] ?? 0) || 0;
}

function mapLiveComments(posts: GraphPost[]): MetaComment[] {
  const comments: MetaComment[] = [];
  for (const post of posts) {
    for (const c of post.comments?.data ?? []) {
      comments.push({
        id: c.id,
        message: c.message ?? "",
        created_time: c.created_time ?? new Date().toISOString(),
        from: c.from ?? { id: "unknown", name: "Inconnu" },
        post_id: post.id,
        post_message: post.message,
        permalink: c.permalink_url,
        hidden: Boolean(c.is_hidden),
        deleted: false,
        tags: ["neutral"],
        replies: [],
      });
    }
  }
  return comments;
}

async function liveListComments(): Promise<MetaComment[]> {
  const pageId = metaPageId();
  if (!pageId) {
    throw new MetaError(
      "META_PAGE_ID manquant. Le client est en mode live (token présent) mais la page n’est pas configurée.",
      400,
    );
  }
  const { data } = await metaGraphFetch<GraphList<GraphPost>>(`/${pageId}/feed`, {
    tokenKind: "page",
    query: {
      fields:
        "id,message,created_time,permalink_url,comments.limit(50){id,message,from,created_time,permalink_url,is_hidden}",
      limit: 10,
    },
  });
  return mapLiveComments(data.data ?? []);
}

async function liveListCampaigns(): Promise<MetaCampaign[]> {
  const act = metaAdAccountId();
  if (!act) {
    throw new MetaError("META_AD_ACCOUNT_ID manquant en mode live.", 400);
  }
  const { data } = await metaGraphFetch<GraphList<GraphCampaign>>(`/${act}/campaigns`, {
    tokenKind: "ads",
    query: {
      fields: "id,name,status,objective,insights.date_preset(last_7d){spend}",
      limit: 50,
    },
  });
  return (data.data ?? []).map((c) => ({
    id: c.id,
    name: c.name ?? c.id,
    status: c.status === "PAUSED" ? "PAUSED" : "ACTIVE",
    objective: c.objective ?? "",
    spend: insightNumber(c.insights, "spend"),
    currency: "USD",
  }));
}

async function liveListAds(): Promise<MetaAd[]> {
  const act = metaAdAccountId();
  if (!act) {
    throw new MetaError("META_AD_ACCOUNT_ID manquant en mode live.", 400);
  }
  const { data } = await metaGraphFetch<GraphList<GraphAd>>(`/${act}/ads`, {
    tokenKind: "ads",
    query: {
      fields:
        "id,name,status,adset_id,campaign_id,campaign{name},insights.date_preset(last_7d){spend,impressions,clicks,ctr}",
      limit: 50,
    },
  });
  return (data.data ?? []).map((ad) => {
    const impressions = insightNumber(ad.insights, "impressions");
    const clicks = insightNumber(ad.insights, "clicks");
    const ctr =
      insightNumber(ad.insights, "ctr") || (impressions ? (clicks / impressions) * 100 : 0);
    return {
      id: ad.id,
      adset_id: ad.adset_id ?? "",
      campaign_id: ad.campaign_id ?? "",
      campaign_name: ad.campaign?.name ?? "",
      name: ad.name ?? ad.id,
      status: ad.status === "PAUSED" ? "PAUSED" : "ACTIVE",
      spend: insightNumber(ad.insights, "spend"),
      impressions,
      clicks,
      ctr: Math.round(ctr * 100) / 100,
      currency: "USD",
    };
  });
}

export const meta = {
  isMock: isMetaMockMode,
  listComments: async (): Promise<MetaComment[]> => {
    if (isMetaMockMode()) return listMockComments();
    return withMetaQueue(() => liveListComments());
  },
  suggestReply: (comment: MetaComment): MetaSuggestedReply => mockSuggestedReply(comment),
  replyToComment: async (commentId: string, message: string) => {
    if (isMetaMockMode()) return mockReply(commentId, message);
    return withMetaQueue(async () => {
      const { data } = await metaGraphFetch<{ id: string }>(`/${commentId}/comments`, {
        method: "POST",
        tokenKind: "page",
        body: { message },
      });
      return { id: data.id, success: true, message };
    });
  },
  hideComment: async (commentId: string, hidden = true) => {
    if (isMetaMockMode()) return mockHide(commentId, hidden);
    return withMetaQueue(async () => {
      await metaGraphFetch(`/${commentId}`, {
        method: "POST",
        tokenKind: "page",
        body: { is_hidden: hidden },
      });
      return { id: commentId, success: true, hidden };
    });
  },
  deleteComment: async (commentId: string) => {
    if (isMetaMockMode()) return mockDelete(commentId);
    return withMetaQueue(async () => {
      await metaGraphFetch(`/${commentId}`, {
        method: "DELETE",
        tokenKind: "page",
      });
      return { id: commentId, success: true, deleted: true };
    });
  },
  listCampaigns: async (): Promise<MetaCampaign[]> => {
    if (isMetaMockMode()) return listMockCampaigns();
    return withMetaQueue(() => liveListCampaigns());
  },
  listAds: async (): Promise<MetaAd[]> => {
    if (isMetaMockMode()) return listMockAds();
    return withMetaQueue(() => liveListAds());
  },
  setAdStatus: async (adId: string, status: "ACTIVE" | "PAUSED") => {
    if (isMetaMockMode()) return mockSetAdStatus(adId, status);
    return withMetaQueue(async () => {
      await metaGraphFetch(`/${adId}`, {
        method: "POST",
        tokenKind: "ads",
        body: { status },
      });
      return { id: adId, success: true, status };
    });
  },
};
