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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dépenses par utilisateur</h1>
          <p className="text-sm text-muted-foreground">
            Attribution locale Rustine (Micha vs Xian Mu), pas uniquement Aurora created_by.
          </p>
        </div>
        <ExportCsvButton rows={csvRows} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {split.map((u) => (
          <Card key={u.id}>
            <CardHeader>
              <CardTitle>{u.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">
                {formatCents(u.cents, "USD")}
              </p>
              <p className="text-xs text-muted-foreground">Top-ups imputés (montant &gt; 0)</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Répartition</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendChart data={split} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détail des attributions</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
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
                    <TableCell>{r.note ?? "—"}</TableCell>
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
