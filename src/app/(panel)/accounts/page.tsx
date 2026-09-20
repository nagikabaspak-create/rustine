import { aurora } from "@/server/aurora/client";
import { syncCachedAccounts } from "@/server/attribution";
import { formatCents } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  BmShareDialog,
  ClearFundsDialog,
  TopUpDialog,
} from "@/components/accounts/account-actions";

function balanceFor(account: {
  currency: string;
  balance?: { usd_cents: number; eur_cents: number; gbp_cents: number };
}) {
  const b = account.balance;
  if (!b) return 0;
  if (account.currency === "EUR") return b.eur_cents;
  if (account.currency === "GBP") return b.gbp_cents;
  return b.usd_cents;
}

export default async function AccountsPage() {
  let error: string | null = null;
  const accounts = await aurora.listAccounts().catch((e) => {
    error = e instanceof Error ? e.message : "Impossible de lister les comptes";
    return [];
  });
  if (accounts.length) await syncCachedAccounts(accounts);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Comptes pubs</h1>
        <p className="text-sm text-muted-foreground">
          Liste Aurora, soldes, top-up / clear funds / BM share.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {accounts.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">Aucun ad account.</p>
          ) : null}
          {accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Compte</TableHead>
                  <TableHead>Plateforme</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Solde</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <Link
                        href={`/accounts/${account.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {account.name ?? account.id}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {account.id}
                      </p>
                    </TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          account.status === "ACTIVE"
                            ? "success"
                            : account.status === "DISABLED"
                              ? "danger"
                              : "muted"
                        }
                      >
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCents(balanceFor(account), account.currency)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
