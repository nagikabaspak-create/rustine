import { aurora } from "@/server/aurora/client";
import { formatDate } from "@/lib/utils";
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
import { CreateApplicationDialog } from "@/components/applications/create-application-dialog";

export default async function ApplicationsPage() {
  let error: string | null = null;
  const apps = await aurora.listApplications().catch((e) => {
    error = e instanceof Error ? e.message : "Impossible de charger les demandes";
    return [];
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Demandes de comptes</h1>
          <p className="text-sm text-muted-foreground">
            Applications Aurora : liste, détail, messages, création META.
          </p>
        </div>
        <CreateApplicationDialog />
      </div>
      <Card>
        <CardContent className="pt-6">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {apps.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">Aucune demande.</p>
          ) : null}
          {apps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Réf.</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Créée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-primary hover:underline"
                      >
                        {app.request_id ?? app.id}
                      </Link>
                    </TableCell>
                    <TableCell>{app.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(app.created_at)}</TableCell>
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
