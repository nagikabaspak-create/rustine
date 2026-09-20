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
    <div className="flex flex-wrap items-center justify-end gap-2">
      {dry ? <Badge variant="outline">DRY RUN</Badge> : <Badge variant="success">LIVE</Badge>}
      {mock ? <Badge variant="muted">Mocks</Badge> : null}
      {metaMock ? (
        <Badge variant="muted">Meta MOCK</Badge>
      ) : (
        <Badge variant="success">Meta LIVE</Badge>
      )}
    </div>
  );
}
