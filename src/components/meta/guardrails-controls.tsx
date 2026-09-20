"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleKillSwitchAction } from "@/server/actions/meta";

export function KillSwitchForm({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const fd = new FormData();
        fd.set("enabled", enabled ? "false" : "true");
        const result = await toggleKillSwitchAction(fd);
        setPending(false);
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
      }}
    >
      <Button type="submit" variant={enabled ? "destructive" : "outline"} disabled={pending}>
        {pending
          ? "Enregistrement…"
          : enabled
            ? "Désactiver le coupe-circuit"
            : "Activer le coupe-circuit"}
      </Button>
    </form>
  );
}

export function UsageMeter({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  const tone = pct >= 80 ? "bg-destructive" : pct >= 50 ? "bg-[#F5C16C]" : "bg-primary";
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value.toFixed(1)}
          {suffix}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
