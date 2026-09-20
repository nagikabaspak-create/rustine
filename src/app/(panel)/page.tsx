import { prisma } from "@/server/db";
import { aurora } from "@/server/aurora/client";
import { syncCachedAccounts } from "@/server/attribution";
import { formatCents, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  let accountsError: string | null = null;
  let txError: string | null = null;
  const [accounts, txs, users, spend] = await Promise.all([
    aurora.listAccounts().catch((e) => {
      accountsError = e instanceof Error ? e.message : "Erreur comptes";
      return [];
    }),
    aurora.listTransactions({ page: 1, page_size: 8 }).catch((e) => {
      txError = e instanceof Error ? e.message : "Erreur wallet";
      return { transactions: [], total: 0, page: 1, page_size: 8, page_count: 1 };
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.spendAttribution.findMany({
      include: { actor: true },
    }),
  ]);

  if (accounts.length) {
    await syncCachedAccounts(accounts);
  }

  const active = accounts.filter((a) => a.status === "ACTIVE").length;
  const now = Date.now();
  const spendWindow = (days: number) =>
    spend.filter(
      (s) =>
        s.amountCents > 0 &&
        now - s.createdAt.getTime() <= days * 24 * 60 * 60 * 1000,
    );

  const byUser = (days: number) => {
    const rows = spendWindow(days);
    return users.map((u) => ({
      name: u.name,
      cents: rows
        .filter((r) => r.actorUserId === u.id)
        .reduce((sum, r) => sum + r.amountCents, 0),
    }));
  };

  const usdBalance = accounts.reduce((s, a) => s + (a.balance?.usd_cents ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="text-sm text-muted-foreground">
          Vue d’ensemble Rustine — wallet company, comptes et attribution locale.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Solde comptes (USD)" value={formatCents(usdBalance, "USD")} />
        <Kpi title="Comptes ACTIVE" value={String(active)} hint={`${accounts.length} au total`} />
        <Kpi
          title="Spend 7 j"
          value={formatCents(
            spendWindow(7).reduce((s, r) => s + r.amountCents, 0),
            "USD",
          )}
        />
        <Kpi
          title="Spend 30 j"
          value={formatCents(
            spendWindow(30).reduce((s, r) => s + r.amountCents, 0),
            "USD",
          )}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dépenses par opérateur (7 j)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {byUser(7).map((row) => (
              <div key={row.name} className="flex items-center justify-between text-sm">
                <span>{row.name}</span>
                <span className="font-medium tabular-nums">{formatCents(row.cents)}</span>
              </div>
            ))}
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun utilisateur.</p>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Dernières transactions</CardTitle>
            <Link href="/wallet" className="text-xs text-primary hover:underline">
              Voir le wallet
            </Link>
          </CardHeader>
          <CardContent>
            {txError ? (
              <p className="text-sm text-destructive">{txError}</p>
            ) : txs.transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune transaction.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txs.transactions.slice(0, 6).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.created_at)}</TableCell>
                      <TableCell>{tx.source}</TableCell>
                      <TableCell className="tabular-nums">
                        {formatCents(tx.amount_cents, tx.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {accountsError ? (
        <p className="text-sm text-destructive">{accountsError}</p>
      ) : null}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Comptes</CardTitle>
          <Link href="/accounts" className="text-xs text-primary hover:underline">
            Tous les comptes
          </Link>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun compte ads.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {accounts.slice(0, 8).map((a) => (
                <Link key={a.id} href={`/accounts/${a.id}`}>
                  <Badge variant={a.status === "ACTIVE" ? "success" : "muted"}>
                    {a.type} · {a.name ?? a.id.slice(0, 8)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
