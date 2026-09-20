import { prisma } from "@/server/db";
import { aurora } from "@/server/aurora/client";
import { meta } from "@/server/meta/client";
import { syncCachedAccounts } from "@/server/attribution";
import { formatCents, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/brand/logo-mark";
import { HomeSearch } from "@/components/layout/home-search";
import { getSessionUser } from "@/server/auth/session";
import { loadWalletEstimate } from "@/server/data";
import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Binoculars,
  BookOpen,
  Instagram,
  LayoutGrid,
  Radar,
  Search,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  let accountsError: string | null = null;
  const [accounts, txs, logs, comments, wallet] = await Promise.all([
    aurora.listAccounts().catch((e) => {
      accountsError = e instanceof Error ? e.message : "Erreur comptes";
      return [];
    }),
    aurora.listTransactions({ page: 1, page_size: 8 }).catch(() => ({
      transactions: [],
      total: 0,
      page: 1,
      page_size: 8,
      page_count: 1,
    })),
    prisma.actionLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    meta.listComments().catch(() => []),
    loadWalletEstimate(),
  ]);

  if (accounts.length) {
    await syncCachedAccounts(accounts);
  }

  const active = accounts.filter((a) => a.status === "ACTIVE");
  const firstName = user?.name?.split(" ")[0] ?? "là";
  const openComments = comments.filter((c) => !c.hidden && !c.deleted).length;

  return (
    <div className="space-y-10">
      <h1 className="sr-only">Tableau de bord</h1>

      <section className="flex flex-col items-center pt-4 text-center">
        <LogoMark size={44} className="mb-5 rounded-[12px]" />
        <h2 className="text-[2rem] font-semibold tracking-tight sm:text-[2.35rem]">
          Bon retour, {firstName}.
        </h2>
        <div className="mt-7 w-full">
          <HomeSearch
            accounts={accounts.map((a) => ({
              id: a.id,
              name: a.name,
              type: a.type,
              status: a.status,
            }))}
          />
        </div>
      </section>

      {accountsError ? (
        <p className="text-center text-sm text-destructive">{accountsError}</p>
      ) : null}

      <section className="flex gap-3 overflow-x-auto pb-2">
        <DashCard
          title="Activité"
          icon={Radar}
          footer={
            <Link href="/accounts" className="inline-flex">
              <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
                Voir les comptes
              </span>
            </Link>
          }
        >
          {logs.length === 0 ? (
            <EmptyState
              icon={Binoculars}
              text="Suivez un compte et voyez chaque top-up, commentaire et dépense dès que ça bouge."
            />
          ) : (
            <ul className="space-y-3 text-left text-sm">
              {logs.slice(0, 4).map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{log.type.replaceAll("_", " ")}</p>
                    <p className="text-[11px] text-muted-foreground">{log.actor.name}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatDate(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashCard>

        <DashCard
          title="Journal"
          icon={LayoutGrid}
          badge="Récent"
          footer={
            <Link href="/audit" className="text-[11px] text-muted-foreground hover:text-foreground">
              Voir tout →
            </Link>
          }
        >
          {txs.transactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chargement des mouvements…</p>
          ) : (
            <ul className="space-y-3 text-left text-sm">
              {txs.transactions.slice(0, 4).map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-2">
                  <span className="truncate">{tx.source}</span>
                  <span className="shrink-0 tabular-nums">
                    {formatCents(tx.amount_cents, tx.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashCard>

        <DashCard title="Lookups" icon={Search}>
          {active.length === 0 ? (
            <EmptyState text="Aucun compte ouvert pour le moment." />
          ) : (
            <div className="flex flex-col gap-2 text-left">
              {active.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  href={`/accounts/${a.id}`}
                  className="flex items-center justify-between rounded-xl bg-black/30 px-3 py-2 text-sm hover:bg-black/50"
                >
                  <span className="truncate">{a.name ?? a.id.slice(0, 8)}</span>
                  <Badge variant={a.status === "ACTIVE" ? "success" : "muted"}>{a.type}</Badge>
                </Link>
              ))}
            </div>
          )}
        </DashCard>

        <DashCard
          title="Intégration"
          icon={Instagram}
          headerRight={
            <Link href="/meta/inbox" className="text-[11px] text-muted-foreground hover:text-foreground">
              Configurer →
            </Link>
          }
        >
          <div className="overflow-hidden rounded-xl border border-border bg-black/40">
            <div className="grid grid-cols-2 gap-px bg-border">
              <div className="aspect-square bg-gradient-to-br from-[#2a2a2a] to-[#111]" />
              <div className="aspect-square bg-gradient-to-tl from-primary/30 to-[#111]" />
            </div>
            <div className="p-3 text-left">
              <p className="flex items-center gap-1 text-sm font-medium">
                <span className="text-primary">●</span> Ne perdez plus un commentaire
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Inbox Meta — {openComments} fil{openComments > 1 ? "s" : ""} ouvert
                {openComments > 1 ? "s" : ""}. Envoyez les réponses depuis Rustine.
              </p>
            </div>
          </div>
        </DashCard>

        <DashCard
          title="Academy"
          icon={BookOpen}
          headerRight={
            <Link href="/meta/guardrails" className="text-[11px] text-muted-foreground hover:text-foreground">
              Ouvrir →
            </Link>
          }
        >
          <Link href="/meta/guardrails" className="block overflow-hidden rounded-xl">
            <div className="relative aspect-[16/10] bg-gradient-to-br from-[#1a2a12] via-[#111] to-[#050505]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(200,255,0,0.25),transparent_55%)]" />
              <p className="absolute left-3 top-3 max-w-[70%] text-left text-lg font-bold leading-tight">
                Rate limit ≠ token mort
              </p>
              <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                ▶
              </span>
            </div>
            <div className="bg-[#0c0c0c] p-3 text-left">
              <p className="text-sm font-medium">Les garde-fous Meta expliqués</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Caps horaires, coupe-circuit et lecture des headers Graph.
              </p>
            </div>
          </Link>
        </DashCard>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MiniStat
          label="Wallet estimé"
          value={formatCents(wallet.cents, wallet.currency)}
          href="/wallet"
        />
        <MiniStat
          label="Comptes ACTIVE"
          value={`${active.length}`}
          hint={`${accounts.length} au total`}
          href="/accounts"
        />
        <MiniStat
          label="Inbox Meta"
          value={String(comments.length)}
          hint={`${openComments} ouverts`}
          href="/meta/inbox"
        />
      </section>
    </div>
  );
}

function DashCard({
  title,
  icon: Icon,
  badge,
  headerRight,
  footer,
  children,
}: {
  title: string;
  icon: LucideIcon;
  badge?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="flex min-h-[320px] min-w-[260px] flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {title}
        </div>
        <div className="flex items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[10px] text-foreground">
              {badge}
            </span>
          ) : null}
          {headerRight}
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col justify-between pt-4">
        <div className="flex-1">{children}</div>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon?: LucideIcon;
  text: string;
}) {
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 px-4 text-center">
      {Icon ? (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1a1a1a] text-muted-foreground">
          <Icon className="h-5 w-5" />
        </div>
      ) : null}
      <p className="max-w-[220px] text-[13px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full hover:border-primary/40">
        <CardContent className="flex items-end justify-between pt-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
            {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
          </div>
          <ArrowRight className="mb-1 h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
