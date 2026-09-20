"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Bell,
  Moon,
  X,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/brand/logo-mark";
import type { LucideIcon } from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Accueil", icon: LayoutDashboard },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/accounts", label: "Comptes", icon: Megaphone },
  { href: "/applications", label: "Demandes", icon: FileStack },
  { href: "/spend", label: "Dépenses", icon: PieChart },
  { href: "/audit", label: "Journal", icon: ScrollText },
  { href: "/meta/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/meta/ads", label: "Ads", icon: BarChart3 },
  { href: "/meta/guardrails", label: "Garde-fous", icon: ShieldCheck },
  { href: "/settings", label: "Réglages", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({
  onNavigate,
  compact,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();
  return (
    <nav className={cn("flex flex-col", compact ? "items-center gap-0.5" : "gap-0.5")}>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={item.label}
            className={cn(
              "flex items-center transition-colors touch-manipulation",
              compact
                ? "w-[68px] min-h-11 flex-col justify-center gap-1 rounded-xl px-1 py-2 text-center"
                : "min-h-11 gap-3 rounded-xl px-3 py-2.5 text-sm",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Icon className={cn("shrink-0", compact ? "h-[18px] w-[18px]" : "h-4 w-4")} />
            <span className={cn(compact ? "text-[10px] leading-tight" : "")}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  userName,
  userEmail,
  compact,
}: {
  userName: string;
  userEmail: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initial = userName.trim().charAt(0).toUpperCase() || "R";

  return (
    <div className={cn("mt-auto flex flex-col items-center gap-2", compact ? "pb-2" : "p-2")}>
      <button
        type="button"
        title="Notifications"
        className="relative flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground touch-manipulation hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </button>
      <button
        type="button"
        title="Thème sombre"
        className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground touch-manipulation hover:text-foreground"
      >
        <Moon className="h-4 w-4" />
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title={`${userName} · ${userEmail}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85a2a] text-xs font-semibold text-white touch-manipulation"
        >
          {initial}
        </button>
        {open ? (
          <div className="absolute bottom-12 left-1/2 z-50 w-48 -translate-x-1/2 rounded-xl border border-border bg-popover p-2 shadow-xl">
            <p className="truncate px-2 text-xs font-medium">{userName}</p>
            <p className="truncate px-2 text-[10px] text-muted-foreground">{userEmail}</p>
            <form action={logoutAction} className="mt-2">
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2 min-h-10">
                <LogOut className="h-4 w-4" />
                Déconnexion
              </Button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
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
    <aside className="hidden w-[76px] shrink-0 flex-col items-center border-r border-border/80 bg-background py-4 lg:flex">
      <Link href="/" className="mb-5" title="Rustine">
        <LogoMark size={30} />
      </Link>
      <div className="flex-1 overflow-y-auto overscroll-contain px-0">
        <NavLinks compact />
      </div>
      <SidebarFooter userName={userName} userEmail={userEmail} compact />
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
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 touch-manipulation lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[min(100vw-2rem,20rem)] max-w-[20rem] gap-0 overflow-y-auto overscroll-contain">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <LogoMark size={28} />
            <span className="font-semibold">Rustine</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <NavLinks onNavigate={() => setOpen(false)} />
        <div className="mt-auto border-t border-border pt-6 text-sm">
          <p className="font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="outline" size="sm" className="min-h-10 w-full">
              Déconnexion
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
