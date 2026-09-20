import { aurora } from "@/server/aurora/client";
import { prisma } from "@/server/db";
import { formatCents, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BmShareDialog,
  ClearFundsDialog,
  TopUpDialog,
} from "@/components/accounts/account-actions";
import { notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accountResult = await aurora.getAccount(id).then(
    (value) => ({ value, error: null as string | null }),
    (e: unknown) => ({
      value: null as Awaited<ReturnType<typeof aurora.getAccount>> | null,
      error: e instanceof Error ? e.message : "Compte introuvable",
    }),
  );
  const account = accountResult.value;
  const error = accountResult.error;
  if (!account && !error) notFound();

  const logs = await prisma.actionLog.findMany({
    where: { auroraEntityId: id },
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  if (!account) {
    return (
      <div>
        <h1 className="page-title">Compte</h1>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  const summary = account.top_ups_summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {account.type}
          </p>
          <h1 className="page-title">{account.name ?? account.id}</h1>
          <p className="font-mono text-xs text-muted-foreground">{account.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TopUpDialog
            accountId={account.id}
            accountType={account.type}
            accountName={account.name}
          />
          <ClearFundsDialog
            accountId={account.id}
            accountType={account.type}
            accountName={account.name}
          />
          <BmShareDialog
            accountId={account.id}
            accountType={account.type}
            accountName={account.name}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={account.status === "ACTIVE" ? "success" : "muted"}>
              {account.status}
            </Badge>
            <p className="mt-2 text-sm text-muted-foreground">
              Devise {account.currency}
              {account.provider ? ` · ${account.provider}` : ""}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Soldes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm tabular-nums">
            <p>USD {formatCents(account.balance?.usd_cents ?? 0, "USD")}</p>
            <p>EUR {formatCents(account.balance?.eur_cents ?? 0, "EUR")}</p>
            <p>GBP {formatCents(account.balance?.gbp_cents ?? 0, "GBP")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top-ups (lifetime)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {summary ? (
              <>
                <p>Brut : {summary.lifetime_gross_top_ups}</p>
                <p>Clearable : {summary.clearable_amount}</p>
                <p>Frais : {summary.fees_total}</p>
              </>
            ) : (
              <p className="text-muted-foreground">Résumé indisponible sur cette vue.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique Rustine</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune mutation Rustine pour ce compte.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Par</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{log.type}</TableCell>
                    <TableCell>{log.actor.name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
