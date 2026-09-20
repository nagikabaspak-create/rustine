"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setAdStatusAction } from "@/server/actions/meta";
import type { MetaAd } from "@/server/meta/types";

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${currency}`;
  }
}

export function AdsTable({ ads, killSwitch }: { ads: MetaAd[]; killSwitch: boolean }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (ads.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune publicité.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pub</TableHead>
          <TableHead>Campagne</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Dépense</TableHead>
          <TableHead>CTR</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ads.map((ad) => (
          <TableRow key={ad.id}>
            <TableCell>
              <p className="font-medium">{ad.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{ad.id}</p>
            </TableCell>
            <TableCell className="text-sm">{ad.campaign_name}</TableCell>
            <TableCell>
              <Badge variant={ad.status === "ACTIVE" ? "success" : "muted"}>{ad.status}</Badge>
            </TableCell>
            <TableCell className="tabular-nums">{money(ad.spend, ad.currency)}</TableCell>
            <TableCell className="tabular-nums">{ad.ctr.toFixed(2)}%</TableCell>
            <TableCell>
              <Button
                size="sm"
                variant={ad.status === "ACTIVE" ? "outline" : "default"}
                disabled={killSwitch || pendingId === ad.id}
                onClick={async () => {
                  setPendingId(ad.id);
                  const fd = new FormData();
                  fd.set("adId", ad.id);
                  fd.set("status", ad.status === "ACTIVE" ? "PAUSED" : "ACTIVE");
                  const result = await setAdStatusAction(fd);
                  setPendingId(null);
                  if (result.ok) toast.success(result.message);
                  else toast.error(result.message);
                }}
              >
                {pendingId === ad.id
                  ? "…"
                  : ad.status === "ACTIVE"
                    ? "Pause"
                    : "Reprendre"}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
