import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { StatusChips } from "@/components/layout/topbar";
import { SupportChat } from "@/components/layout/support-chat";
import { isMockMode, loadWhoami } from "@/server/data";
import { isMetaMockMode } from "@/server/meta/env";
import { BrandLockup } from "@/components/brand/logo-mark";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const whoami = await loadWhoami();

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar userName={user.name} userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 px-3 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/75 safe-top lg:border-0 lg:bg-transparent lg:px-6 lg:py-3 lg:backdrop-blur-none">
          <div className="flex items-center gap-2">
            <div className="lg:hidden">
              <MobileNav userName={user.name} userEmail={user.email} />
            </div>
            <Link href="/" className="min-w-0 flex-1 lg:hidden">
              <BrandLockup size={22} className="max-w-full" />
            </Link>
            <div className="hidden min-w-0 flex-1 lg:block" />
            <StatusChips whoami={whoami} mock={isMockMode()} metaMock={isMetaMockMode()} />
          </div>
        </header>
        <main className="flex-1 px-3 pb-24 pt-3 sm:px-4 lg:px-8 lg:pb-16 lg:pt-2">
          {children}
        </main>
      </div>
      <SupportChat />
    </div>
  );
}
