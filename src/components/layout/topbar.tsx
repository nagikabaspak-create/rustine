import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/utils";
import type { Whoami } from "@/server/aurora/types";

export function Topbar({
  whoami,
  walletCents,
  currency,
  mock,
  metaMock,
}: {
  whoami: Whoami | null;
  walletCents: number;
  currency: string;
  mock: boolean;
  metaMock: boolean;
}) {
  const dry = mock || whoami?.dry_run || whoami?.execution_mode === "DRY_RUN";
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-[#0B0F14]/80 px-4 backdrop-blur lg:px-8">
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">Solde wallet estimé</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatCents(walletCents, currency)}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {dry ? <Badge variant="outline">DRY RUN</Badge> : <Badge variant="success">LIVE</Badge>}
        {mock ? <Badge variant="muted">Mocks</Badge> : null}
        {metaMock ? (
          <Badge variant="muted">Meta MOCK</Badge>
        ) : (
          <Badge variant="success">Meta LIVE</Badge>
        )}
        {whoami?.company_id ? (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {whoami.company_id}
          </span>
        ) : null}
      </div>
    </header>
  );
}
