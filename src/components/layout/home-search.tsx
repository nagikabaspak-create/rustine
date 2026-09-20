"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { History, Search } from "lucide-react";

export type SearchAccount = {
  id: string;
  name: string | null;
  type: string;
  status: string;
};

export function HomeSearch({ accounts }: { accounts: SearchAccount[] }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return accounts
      .filter((a) =>
        `${a.name ?? ""} ${a.id} ${a.type} ${a.status}`.toLowerCase().includes(needle),
      )
      .slice(0, 6);
  }, [accounts, q]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (matches[0]) {
      router.push(`/accounts/${matches[0].id}`);
      return;
    }
    router.push("/accounts");
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <form onSubmit={onSubmit} className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher des comptes…"
          className="h-12 w-full rounded-full border border-transparent bg-[#161616] pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        {matches.length > 0 ? (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover py-1 shadow-xl">
            {matches.map((a) => (
              <Link
                key={a.id}
                href={`/accounts/${a.id}`}
                className="block px-4 py-2 text-sm hover:bg-secondary"
              >
                <span className="font-medium">{a.name ?? a.id.slice(0, 8)}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {a.type} · {a.status}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </form>
      <div className="mt-3 flex items-center justify-center gap-3 text-xs text-muted-foreground">
        <span>
          {accounts.length
            ? `${accounts.length} compte${accounts.length > 1 ? "s" : ""} indexé${accounts.length > 1 ? "s" : ""}`
            : "Aucun compte pour l’instant"}
        </span>
        <Link
          href="/audit"
          className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 hover:text-foreground"
        >
          <History className="h-3 w-3" />
          Historique
        </Link>
      </div>
    </div>
  );
}
