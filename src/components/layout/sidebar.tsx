"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Megaphone,
  FileStack,
  PieChart,
  ScrollText,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const AURORA_NAV: NavItem[] = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/wallet", label: "Portefeuille", icon: Wallet },
  { href: "/accounts", label: "Comptes pubs", icon: Megaphone },
  { href: "/applications", label: "Demandes", icon: FileStack },
  { href: "/spend", label: "Dépenses", icon: PieChart },
];

const META_NAV: NavItem[] = [
  { href: "/meta/inbox", label: "Meta Inbox (commentaires)", icon: MessageSquare },
  { href: "/meta/ads", label: "Meta Ads (aperçu)", icon: BarChart3 },
  { href: "/meta/guardrails", label: "Meta Garde-fous", icon: ShieldCheck },
];

const OPS_NAV: NavItem[] = [
  { href: "/audit", label: "Journal", icon: ScrollText },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

function NavGroup({
  items,
  label,
  onNavigate,
}: {
  items: NavItem[];
  label?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      {label ? (
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      ) : null}
      {items.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
      <NavGroup items={AURORA_NAV} onNavigate={onNavigate} />
      <NavGroup items={META_NAV} label="Meta" onNavigate={onNavigate} />
      <NavGroup items={OPS_NAV} onNavigate={onNavigate} />
    </nav>
  );
}

export function Sidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-[#0B0F14] p-4 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-3 px-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-bold text-primary">
          R
        </div>
        <div>
          <p className="text-base font-semibold leading-none">Rustine</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Aurora · Meta</p>
        </div>
      </Link>
      <NavLinks />
      <div className="mt-auto rounded-lg border border-border bg-card p-3">
        <p className="text-sm font-medium">{userName}</p>
        <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        <form action={logoutAction} className="mt-3">
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 px-0">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Link href="/" className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 font-bold text-primary">
            R
          </div>
          <span className="font-semibold">Rustine</span>
        </Link>
        <NavLinks />
        <div className="mt-auto pt-6 text-sm">
          <p className="font-medium">{userName}</p>
          <p className="text-xs text-muted-foreground">{userEmail}</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm">
              Déconnexion
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
