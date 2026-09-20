import type {
  MetaAd,
  MetaCampaign,
  MetaComment,
  MetaSuggestedReply,
} from "./types";

const PAGE_ID = "page_rustine_demo";

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

export const MOCK_PAGE = {
  id: PAGE_ID,
  name: "Rustine Demo",
};

export const MOCK_CAMPAIGNS: MetaCampaign[] = [
  {
    id: "120330001",
    name: "Prospecting US — Spring",
    status: "ACTIVE",
    objective: "OUTCOME_SALES",
    spend: 1240.18,
    currency: "USD",
  },
  {
    id: "120330002",
    name: "Retargeting EU",
    status: "ACTIVE",
    objective: "OUTCOME_TRAFFIC",
    spend: 486.4,
    currency: "EUR",
  },
  {
    id: "120330003",
    name: "Brand FR — awareness",
    status: "PAUSED",
    objective: "OUTCOME_AWARENESS",
    spend: 92.0,
    currency: "EUR",
  },
];

export const MOCK_ADS: MetaAd[] = [
  {
    id: "ad_spring_carousel",
    adset_id: "as_spring_1",
    campaign_id: "120330001",
    campaign_name: "Prospecting US — Spring",
    name: "Carousel — 3 looks US",
    status: "ACTIVE",
    spend: 812.4,
    impressions: 148_200,
    clicks: 2667,
    ctr: 1.8,
    currency: "USD",
  },
  {
    id: "ad_spring_ugc",
    adset_id: "as_spring_1",
    campaign_id: "120330001",
    campaign_name: "Prospecting US — Spring",
    name: "UGC — unboxing",
    status: "ACTIVE",
    spend: 427.78,
    impressions: 91_040,
    clicks: 1092,
    ctr: 1.2,
    currency: "USD",
  },
  {
    id: "ad_eu_catalog",
    adset_id: "as_eu_1",
    campaign_id: "120330002",
    campaign_name: "Retargeting EU",
    name: "DPA catalog EU",
    status: "ACTIVE",
    spend: 486.4,
    impressions: 62_110,
    clicks: 1553,
    ctr: 2.5,
    currency: "EUR",
  },
  {
    id: "ad_brand_film",
    adset_id: "as_brand_1",
    campaign_id: "120330003",
    campaign_name: "Brand FR — awareness",
    name: "Film 15s — noir",
    status: "PAUSED",
    spend: 92.0,
    impressions: 40_002,
    clicks: 160,
    ctr: 0.4,
    currency: "EUR",
  },
];

export const MOCK_COMMENTS: MetaComment[] = [
  {
    id: "cmt_lea_link",
    message: "Le lien de commande est cassé, vous pouvez renvoyer ?",
    created_time: hoursAgo(2),
    from: { id: "user_lea", name: "Léa Martin" },
    post_id: "post_spring",
    post_message: "Spring drop — free shipping this week.",
    ad_id: "ad_spring_carousel",
    ad_name: "Carousel — 3 looks US",
    permalink: "https://facebook.com/mock/cmt_lea_link",
    hidden: false,
    deleted: false,
    tags: ["question"],
    replies: [],
  },
  {
    id: "cmt_karim_lead",
    message: "Je veux le pack, c’est dispo en FR avec facture ?",
    created_time: hoursAgo(5),
    from: { id: "user_karim", name: "Karim B." },
    post_id: "post_eu",
    post_message: "Restock EU — 48h only.",
    ad_id: "ad_eu_catalog",
    ad_name: "DPA catalog EU",
    permalink: "https://facebook.com/mock/cmt_karim_lead",
    hidden: false,
    deleted: false,
    tags: ["lead", "question"],
    replies: [],
  },
  {
    id: "cmt_spam_home",
    message: "Make $5000/week from home — click bio cheap-work.xyz",
    created_time: hoursAgo(1),
    from: { id: "user_spam1", name: "Promo Dealz 88" },
    post_id: "post_spring",
    post_message: "Spring drop — free shipping this week.",
    ad_id: "ad_spring_ugc",
    ad_name: "UGC — unboxing",
    permalink: "https://facebook.com/mock/cmt_spam_home",
    hidden: false,
    deleted: false,
    tags: ["spam"],
    replies: [],
  },
  {
    id: "cmt_sophie_price",
    message: "C’est plus cher qu’Amazon, il y a un code promo ?",
    created_time: hoursAgo(8),
    from: { id: "user_sophie", name: "Sophie Durand" },
    post_id: "post_eu",
    post_message: "Restock EU — 48h only.",
    ad_id: "ad_eu_catalog",
    ad_name: "DPA catalog EU",
    permalink: "https://facebook.com/mock/cmt_sophie_price",
    hidden: false,
    deleted: false,
    tags: ["question"],
    replies: [],
  },
  {
    id: "cmt_john_nyc",
    message: "Is this available in NYC? Need it before Friday.",
    created_time: hoursAgo(3),
    from: { id: "user_john", name: "John Hale" },
    post_id: "post_spring",
    post_message: "Spring drop — free shipping this week.",
    ad_id: "ad_spring_carousel",
    ad_name: "Carousel — 3 looks US",
    permalink: "https://facebook.com/mock/cmt_john_nyc",
    hidden: false,
    deleted: false,
    tags: ["lead"],
    replies: [],
  },
  {
    id: "cmt_spam_pills",
    message: "Cheap meds overnight 💊 visit pills-now.example",
    created_time: hoursAgo(0.4),
    from: { id: "user_spam2", name: "Health Offers" },
    post_id: "post_brand",
    post_message: "Nouvelle campagne brand FR.",
    ad_id: "ad_brand_film",
    ad_name: "Film 15s — noir",
    permalink: "https://facebook.com/mock/cmt_spam_pills",
    hidden: false,
    deleted: false,
    tags: ["spam"],
    replies: [],
  },
  {
    id: "cmt_nina_size",
    message: "Vous avez du 42 ? Le site affiche rupture.",
    created_time: hoursAgo(12),
    from: { id: "user_nina", name: "Nina Cole" },
    post_id: "post_eu",
    post_message: "Restock EU — 48h only.",
    ad_id: "ad_eu_catalog",
    ad_name: "DPA catalog EU",
    permalink: "https://facebook.com/mock/cmt_nina_size",
    hidden: false,
    deleted: false,
    tags: ["question"],
    replies: [],
  },
  {
    id: "cmt_neutral_fire",
    message: "Love the film 🔥",
    created_time: hoursAgo(20),
    from: { id: "user_alex", name: "Alex Moreau" },
    post_id: "post_brand",
    post_message: "Nouvelle campagne brand FR.",
    ad_id: "ad_brand_film",
    ad_name: "Film 15s — noir",
    permalink: "https://facebook.com/mock/cmt_neutral_fire",
    hidden: false,
    deleted: false,
    tags: ["neutral"],
    replies: [],
  },
];

const PAGE_OPERATOR: MetaComment["from"] = {
  id: PAGE_ID,
  name: "Rustine Demo",
};

export function listMockComments(): MetaComment[] {
  return MOCK_COMMENTS.filter((c) => !c.deleted).map((c) => ({
    ...c,
    replies: [...c.replies],
    tags: [...c.tags],
  }));
}

export function listMockAds(): MetaAd[] {
  return MOCK_ADS.map((a) => ({ ...a }));
}

export function listMockCampaigns(): MetaCampaign[] {
  return MOCK_CAMPAIGNS.map((c) => ({ ...c }));
}

export function mockReply(commentId: string, message: string) {
  const comment = MOCK_COMMENTS.find((c) => c.id === commentId);
  if (!comment || comment.deleted) {
    throw new Error("Commentaire introuvable");
  }
  const reply = {
    id: `reply_${crypto.randomUUID().slice(0, 8)}`,
    message,
    created_time: new Date().toISOString(),
    from: PAGE_OPERATOR,
  };
  comment.replies.push(reply);
  return { id: reply.id, success: true, message };
}

export function mockHide(commentId: string, hidden = true) {
  const comment = MOCK_COMMENTS.find((c) => c.id === commentId);
  if (!comment || comment.deleted) {
    throw new Error("Commentaire introuvable");
  }
  comment.hidden = hidden;
  return { id: commentId, success: true, hidden };
}

export function mockDelete(commentId: string) {
  const comment = MOCK_COMMENTS.find((c) => c.id === commentId);
  if (!comment) {
    throw new Error("Commentaire introuvable");
  }
  comment.deleted = true;
  return { id: commentId, success: true, deleted: true };
}

export function mockSetAdStatus(adId: string, status: "ACTIVE" | "PAUSED") {
  const ad = MOCK_ADS.find((a) => a.id === adId);
  if (!ad) throw new Error("Publicité introuvable");
  ad.status = status;
  const campaign = MOCK_CAMPAIGNS.find((c) => c.id === ad.campaign_id);
  if (campaign && status === "PAUSED") {
    const siblings = MOCK_ADS.filter((a) => a.campaign_id === campaign.id);
    if (siblings.every((a) => a.status === "PAUSED")) campaign.status = "PAUSED";
  }
  if (campaign && status === "ACTIVE") campaign.status = "ACTIVE";
  return { id: adId, success: true, status };
}

export function mockSuggestedReply(comment: MetaComment): MetaSuggestedReply {
  if (comment.tags.includes("spam")) {
    return {
      comment_id: comment.id,
      text: "Ce commentaire a l’air d’être du spam — mieux vaut le masquer plutôt que d’engager.",
      rationale:
        "Pas de réponse publique au spam : ça booste le thread. Masquer (ou supprimer) suffit.",
    };
  }
  if (comment.tags.includes("lead") && comment.tags.includes("question")) {
    return {
      comment_id: comment.id,
      text: "Oui, on livre en France avec facture. Je vous envoie le lien du pack en message — dites-moi simplement votre taille.",
      rationale: "Lead + question : confirmer dispo, proposer un canal privé, CTA clair.",
    };
  }
  if (comment.tags.includes("lead")) {
    return {
      comment_id: comment.id,
      text: "Yes — we ship to NYC, usually 2–3 days. I can hold one until Friday if you checkout today; want the direct link?",
      rationale: "Lead logistique : délai concret + offre d’aide, sans promesse irréaliste.",
    };
  }
  if (comment.tags.includes("question")) {
    return {
      comment_id: comment.id,
      text: "Merci pour le signalement — je vérifie le lien de votre côté et je reviens avec un URL qui fonctionne.",
      rationale: "Question support : accuser réception, pas de remise improvisée.",
    };
  }
  return {
    comment_id: comment.id,
    text: "Merci beaucoup 🙏",
    rationale: "Commentaire neutre : courte gratitude, pas de sur-réponse.",
  };
}

export function resetMetaMocks() {
  for (const c of MOCK_COMMENTS) {
    c.hidden = false;
    c.deleted = false;
    c.replies.length = 0;
  }
  MOCK_ADS[0].status = "ACTIVE";
  MOCK_ADS[1].status = "ACTIVE";
  MOCK_ADS[2].status = "ACTIVE";
  MOCK_ADS[3].status = "PAUSED";
  MOCK_CAMPAIGNS[0].status = "ACTIVE";
  MOCK_CAMPAIGNS[1].status = "ACTIVE";
  MOCK_CAMPAIGNS[2].status = "PAUSED";
}
