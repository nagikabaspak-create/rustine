import { aurora } from "@/server/aurora/client";
import { prisma } from "@/server/db";
import { formatCents, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1) || 1;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const type = (typeof sp.type === "string" ? sp.type : "all") as
    | "incoming"
    | "outgoing"
    | "converted"
    | "all";
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const currency = typeof sp.currency === "string" ? sp.currency : undefined;

  let error: string | null = null;
  const ledger = await aurora
    .listTransactions({
      page,
      page_size: 50,
      search,
      type: type === "all" ? undefined : type,
      status: status === "pending" || status === "completed" ? status : undefined,
      currency: currency === "USD" || currency === "EUR" || currency === "GBP" ? currency : undefined,
    })
    .catch((e) => {
      error = e instanceof Error ? e.message : "Impossible de charger le wallet";
      return null;
    });

  const [attributions, users] = await Promise.all([
    prisma.spendAttribution.findMany(),
    prisma.user.findMany(),
  ]);

  const attrByTx = new Map(
    attributions
      .filter((a) => a.auroraTransactionId)
      .map((a) => [a.auroraTransactionId as string, a]),
  );
  const usersByAurora = new Map(
    users.filter((u) => u.auroraUserId).map((u) => [u.auroraUserId as string, u]),
  );
  const usersById = new Map(users.map((u) => [u.id, u]));

  function who(txId: string, createdById?: string | null) {
    const local = attrByTx.get(txId);
    if (local) return usersById.get(local.actorUserId)?.name ?? "Rustine";
    if (createdById && usersByAurora.get(createdById)) {
      return usersByAurora.get(createdById)!.name;
    }
    return "—";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Portefeuille</h1>
        <p className="text-sm text-muted-foreground">
          Ledger Aurora + colonne d’attribution Rustine (« Par qui »).
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5" method="get">
            <Input name="search" placeholder="Recherche" defaultValue={search ?? ""} />
            <select
              name="type"
              defaultValue={type}
              className="field"
            >
              <option value="all">Tous les sens</option>
              <option value="incoming">Entrées</option>
              <option value="outgoing">Sorties</option>
              <option value="converted">Conversions</option>
            </select>
            <select
              name="status"
              defaultValue={status ?? ""}
              className="field"
            >
              <option value="">Tous statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
            </select>
            <select
              name="currency"
              defaultValue={currency ?? ""}
              className="field"
            >
              <option value="">Toutes devises</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <button
              type="submit"
              className="h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Filtrer
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!error && (!ledger || ledger.transactions.length === 0) ? (
            <p className="text-sm text-muted-foreground">Aucune transaction pour ces filtres.</p>
          ) : null}
          {ledger && ledger.transactions.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Réf.</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Compte</TableHead>
                    <TableHead>Par qui</TableHead>
                    <TableHead>Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatDate(tx.created_at)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.reference_id ?? tx.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>{tx.source}</TableCell>
                      <TableCell>
                        <Badge variant={tx.status === "completed" ? "success" : "outline"}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tx.ad_account ? (
                          <Link className="text-primary hover:underline" href={`/accounts/${tx.ad_account.id}`}>
                            {tx.ad_account.name ?? tx.ad_account.id.slice(0, 8)}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{who(tx.id, tx.created_by?.id)}</TableCell>
                      <TableCell
                        className={
                          tx.amount_cents < 0
                            ? "tabular-nums text-destructive"
                            : "tabular-nums text-primary"
                        }
                      >
                        {formatCents(tx.amount_cents, tx.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Page {ledger.page} / {ledger.page_count} · {ledger.total} tx
                </span>
                <div className="flex gap-2">
                  {page > 1 ? (
                    <Link className="text-primary" href={`/wallet?page=${page - 1}`}>
                      Précédent
                    </Link>
                  ) : null}
                  {page < ledger.page_count ? (
                    <Link className="text-primary" href={`/wallet?page=${page + 1}`}>
                      Suivant
                    </Link>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
