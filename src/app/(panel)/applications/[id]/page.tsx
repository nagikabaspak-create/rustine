import { aurora } from "@/server/aurora/client";
import { formatCents, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageForm } from "@/components/applications/message-form";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appResult = await aurora.getApplication(id).then(
    (value) => ({ value, error: null as string | null }),
    (e: unknown) => ({
      value: null as Awaited<ReturnType<typeof aurora.getApplication>> | null,
      error: e instanceof Error ? e.message : "Demande introuvable",
    }),
  );
  const app = appResult.value;
  const error = appResult.error;

  if (!app) {
    return (
      <div>
        <h1 className="page-title">Demande</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{app.type}</p>
        <h1 className="page-title">{app.request_id ?? app.id}</h1>
        <Badge className="mt-2" variant="outline">
          {app.status}
        </Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Montants</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>Top-up : {formatCents(app.total_top_up_cents, app.currency)}</p>
            <p>Frais : {formatCents(app.total_fee_cents, app.currency)}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Notes reviewer</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {app.changes_required || "Aucune."}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(app.messages ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Pas encore de messages.</p>
          ) : (
            <ul className="space-y-3">
              {(app.messages ?? []).map((m) => (
                <li key={m.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    {m.author.name} · {formatDate(m.created_at)}
                  </p>
                  <p className="mt-1 text-sm">{m.content}</p>
                </li>
              ))}
            </ul>
          )}
          <MessageForm applicationId={app.id} type={app.type} />
        </CardContent>
      </Card>
    </div>
  );
}
