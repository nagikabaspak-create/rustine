import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function MetaMockBanner({ mock }: { mock: boolean }) {
  if (!mock) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm">
        Client Meta en <span className="font-semibold">LIVE</span> — les appels passent par
        Graph (<code className="font-mono text-xs">graph.facebook.com</code>). Un 17 / 613 /
        80004 n’invalide pas le token.
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
      Simulation Meta — colle <code className="font-mono text-xs">META_PAGE_ACCESS_TOKEN</code>{" "}
      (ou <code className="font-mono text-xs">META_ACCESS_TOKEN</code>) pour le live.
    </div>
  );
}

export function MetaKillBanner({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm">
      Coupe-circuit actif — les écritures Meta sont bloquées côté Rustine. Le token n’est pas
      révoqué. Désactivez-le dans{" "}
      <Link href="/meta/guardrails" className="text-primary underline">
        Garde-fous
      </Link>
      .
    </div>
  );
}

export function TagBadge({ tag }: { tag: string }) {
  const variant =
    tag === "spam" ? "danger" : tag === "lead" ? "success" : tag === "question" ? "default" : "muted";
  const label =
    tag === "spam" ? "Spam" : tag === "lead" ? "Lead" : tag === "question" ? "Question" : "Neutre";
  return <Badge variant={variant}>{label}</Badge>;
}
