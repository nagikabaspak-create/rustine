import { prisma } from "@/server/db";
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
import { SpendChart } from "@/components/spend/spend-chart";
import { ExportCsvButton } from "@/components/spend/export-csv";

export default async function SpendPage() {
  const [users, rows] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.spendAttribution.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const split = users.map((u) => ({
    id: u.id,
    name: u.name,
    cents: rows
      .filter((r) => r.actorUserId === u.id && r.amountCents > 0)
      .reduce((s, r) => s + r.amountCents, 0),
  }));

  const csvRows = rows.map((r) => ({
    name: r.actor.name,
    amount: (r.amountCents / 100).toFixed(2),
    note: r.note ?? r.actionLogId ?? "",
    date: r.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="page-title">Dépenses par utilisateur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Attribution locale Rustine (Micha vs Xian Mu), pas uniquement Aurora created_by.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ExportCsvButton rows={csvRows} />
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        {split.map((u) => (
          <Card key={u.id}>
            <CardHeader className="p-4 sm:p-5">
              <CardTitle>{u.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
              <p className="text-2xl font-semibold tabular-nums sm:text-3xl">
                {formatCents(u.cents, "USD")}
              </p>
              <p className="text-xs text-muted-foreground">Top-ups imputés (montant &gt; 0)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-5">
          <CardTitle>Répartition</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 sm:p-5 sm:pt-0">
          <SpendChart data={split} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-5">
          <CardTitle>Détail des attributions</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 sm:p-5 sm:pt-0">
          {rows.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground sm:px-0">
              Aucune attribution. Un top-up depuis Rustine apparaîtra ici.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Opérateur</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{formatDate(r.createdAt)}</TableCell>
                    <TableCell>{r.actor.name}</TableCell>
                    <TableCell className="max-w-[12rem] truncate whitespace-normal sm:max-w-none sm:whitespace-nowrap">
                      {r.note ?? "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatCents(r.amountCents, r.currency)}
                    </TableCell>
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
