import { getSessionUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { isMockMode } from "@/server/aurora/client";
import { isMetaMockMode } from "@/server/meta/env";
import { loadWhoami } from "@/server/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MappingForm } from "@/components/settings/mapping-form";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const me = await getSessionUser();
  if (!me) redirect("/login");
  const [users, whoami] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    loadWhoami(),
  ]);

  const editable = users.filter((u) => me.role === "ADMIN" || u.id === me.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Profil opérateur et mapping optionnel vers un UUID Aurora.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            {me.name} · {me.email}
          </p>
          <p className="text-muted-foreground">Rôle {me.role}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Aurora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {isMockMode() ? <Badge variant="muted">Mocks locaux</Badge> : <Badge>Clé API</Badge>}
            {whoami?.execution_mode === "DRY_RUN" || whoami?.dry_run ? (
              <Badge variant="outline">DRY RUN</Badge>
            ) : whoami ? (
              <Badge variant="success">LIVE</Badge>
            ) : null}
          </div>
          <p className="text-muted-foreground">
            {whoami?.message ??
              "Whoami indisponible. Renseignez AURORA_API_KEY dans .env pour le mode live."}
          </p>
          {whoami?.company_id ? (
            <p className="font-mono text-xs">company_id {whoami.company_id}</p>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-2">
            {isMetaMockMode() ? (
              <Badge variant="muted">Meta MOCK</Badge>
            ) : (
              <Badge variant="success">Meta LIVE</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {isMetaMockMode()
              ? "Aucun token Graph. L’inbox, les pubs et les garde-fous tournent en simulation."
              : "Token présent — le client n’utilise plus les mocks. Les appels partent vers graph.facebook.com."}
          </p>
          <Link href="/meta/guardrails" className="text-xs text-primary hover:underline">
            Ouvrir les garde-fous Meta
          </Link>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Mapping UUID Aurora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Optionnel. Si renseigné, le wallet peut relier created_by Aurora à un opérateur
            Rustine.
          </p>
          {editable.map((u) => (
            <div key={u.id} className="space-y-2">
              <p className="text-sm font-medium">
                {u.name}{" "}
                <span className="text-muted-foreground">({u.email})</span>
              </p>
              <MappingForm userId={u.id} defaultValue={u.auroraUserId ?? ""} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
