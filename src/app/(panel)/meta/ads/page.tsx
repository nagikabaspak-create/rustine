import { meta } from "@/server/meta/client";
import { isMetaMockMode } from "@/server/meta/env";
import { loadGuardrails } from "@/server/meta/queue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdsTable } from "@/components/meta/ads-table";
import { MetaKillBanner, MetaMockBanner } from "@/components/meta/banners";

export const dynamic = "force-dynamic";

export default async function MetaAdsPage() {
  const mock = isMetaMockMode();
  const [campaigns, ads, guard] = await Promise.all([
    meta.listCampaigns().catch(() => []),
    meta.listAds().catch(() => []),
    loadGuardrails(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meta Ads</h1>
        <p className="text-sm text-muted-foreground">
          Aperçu campagnes / pubs. Pause et reprise passent par le client Graph (ou la
          simulation) et le journal d’audit.
        </p>
      </div>
      <MetaMockBanner mock={mock} />
      <MetaKillBanner enabled={guard.killSwitch} />
      <p className="text-xs text-muted-foreground">
        En live, les insights Meta sont souvent asynchrones et lisent{" "}
        <code className="font-mono">X-FB-Ads-Insights-Throttle</code> — on ne poll pas en
        boucle.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {c.objective}
              </p>
              <CardTitle>{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant={c.status === "ACTIVE" ? "success" : "muted"}>{c.status}</Badge>
              <span className="text-sm tabular-nums">
                {c.spend.toLocaleString("fr-FR", {
                  style: "currency",
                  currency: c.currency,
                  maximumFractionDigits: 0,
                })}
              </span>
            </CardContent>
          </Card>
        ))}
        {campaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune campagne.</p>
        ) : null}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Publicités</CardTitle>
        </CardHeader>
        <CardContent>
          <AdsTable ads={ads} killSwitch={guard.killSwitch} />
        </CardContent>
      </Card>
    </div>
  );
}
