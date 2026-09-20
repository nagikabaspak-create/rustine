import { Badge } from "@/components/ui/badge";
import type { Whoami } from "@/server/aurora/types";

export function StatusChips({
  whoami,
  mock,
  metaMock,
}: {
  whoami: Whoami | null;
  mock: boolean;
  metaMock: boolean;
}) {
  const dry = mock || whoami?.dry_run || whoami?.execution_mode === "DRY_RUN";
  return (
    <div className="flex max-w-[55vw] flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2">
      {dry ? <Badge variant="outline">DRY RUN</Badge> : <Badge variant="success">LIVE</Badge>}
      {mock ? <Badge variant="muted" className="hidden sm:inline-flex">Mocks</Badge> : null}
      {metaMock ? (
        <Badge variant="muted">
          <span className="sm:hidden">Meta</span>
          <span className="hidden sm:inline">Meta MOCK</span>
        </Badge>
      ) : (
        <Badge variant="success" className="hidden sm:inline-flex">
          Meta LIVE
        </Badge>
      )}
    </div>
  );
}
