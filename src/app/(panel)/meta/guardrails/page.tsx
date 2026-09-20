import { isMetaMockMode } from "@/server/meta/env";
import { loadGuardrails } from "@/server/meta/queue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetaMockBanner } from "@/components/meta/banners";
import { KillSwitchForm, UsageMeter } from "@/components/meta/guardrails-controls";
import { ShieldAlert, KeyRound, Webhook, Gauge } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MetaGuardrailsPage() {
  const mock = isMetaMockMode();
  const state = await loadGuardrails();
  const dailyPct = Math.min(100, (state.dailyCalls / state.dailyBudget) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Meta Garde-fous</h1>
        <p className="text-sm text-muted-foreground">
          Un plafond n’est pas un token mort. Ces contrôles existent pour que l’ancien panneau
          « qui a tué la clé » ne se reproduise pas.
        </p>
      </div>
      <MetaMockBanner mock={mock} />

      <Card className={state.killSwitch ? "border-destructive/40" : undefined}>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Coupe-circuit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Bloque toutes les écritures Meta côté Rustine. Lecture encore possible. Persisté
              en base.
            </p>
          </div>
          <Badge variant={state.killSwitch ? "danger" : "success"}>
            {state.killSwitch ? "ON" : "OFF"}
          </Badge>
        </CardHeader>
        <CardContent>
          <KillSwitchForm enabled={state.killSwitch} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage simulé / headers</CardTitle>
            <p className="text-xs text-muted-foreground">
              Les barres bougent un peu à chaque action mock. En live elles suivent{" "}
              <code className="font-mono">X-Business-Use-Case-Usage</code>,{" "}
              <code className="font-mono">X-Ad-Account-Usage</code>,{" "}
              <code className="font-mono">X-FB-Ads-Insights-Throttle</code>.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageMeter label="App (call_count)" value={state.appPct} />
            <UsageMeter label="Ad account" value={state.accountPct} />
            <UsageMeter label="Insights throttle" value={state.insightsPct} />
            <UsageMeter
              label={`Appels du jour (${state.dailyCalls} / ${state.dailyBudget})`}
              value={dailyPct}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plafonds horaires Rustine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <CapRow
              label="Réponses publiques"
              used={state.repliesThisHour}
              max={state.maxRepliesPerHour}
            />
            <CapRow
              label="Masquages"
              used={state.hidesThisHour}
              max={state.maxHidesPerHour}
            />
            <CapRow
              label="Suppressions"
              used={state.deletesThisHour}
              max={state.maxDeletesPerHour}
            />
            <CapRow
              label="Pause / reprise pubs"
              used={state.adsMutationsThisHour}
              max={state.maxAdsMutationsPerHour}
            />
            <p className="pt-2 text-xs text-muted-foreground">
              File d’attente : concurrence 2. Soft cap journalier {state.dailyBudget} appels.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Explain
          icon={ShieldAlert}
          title="Rate limit ≠ token mort"
          body="Les erreurs 4, 17, 613 et 80004 (throttle ads/insights) veulent dire : trop d’appels, trop vite. Le token est toujours valide — on backoff, on coupe le robinet. L’erreur 190, elle, est un OAuth invalide / révoqué. Ne pas les confondre."
        />
        <Explain
          icon={KeyRound}
          title="Préférer un token System User"
          body="Un token utilisateur perso expire, se révoque, et un panneau trop agressif le brûle. Un System User (Business Manager) avec les permissions pages/ads, stocké seulement côté serveur, est le modèle à viser avant l’App Review."
        />
        <Explain
          icon={Webhook}
          title="Webhooks plutôt que polling"
          body="Pour les commentaires, s’abonner aux webhooks page (feed) évite de marteler GET /comments. Rustine expose déjà GET/POST /api/webhooks/meta : le GET renvoie hub.challenge, le POST loggue le payload. Pas d’App Review dans cette v0."
        />
        <Explain
          icon={Gauge}
          title="Caps visibles"
          body="Rustine plafonne les réponses, masquages et suppressions à l’heure. Si le plafond saute, le message d’erreur dit explicitement que ce n’est pas un token mort. Le coupe-circuit est le dernier recours humain."
        />
      </div>
    </div>
  );
}

function CapRow({ label, used, max }: { label: string; used: number; max: number }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="tabular-nums text-muted-foreground">
        {used} / {max} h
      </span>
    </div>
  );
}

function Explain({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldAlert;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
