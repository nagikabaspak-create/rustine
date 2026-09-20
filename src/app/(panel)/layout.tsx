import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { isMockMode, loadWalletEstimate, loadWhoami } from "@/server/data";
import { isMetaMockMode } from "@/server/meta/env";

export const dynamic = "force-dynamic";

export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [whoami, wallet] = await Promise.all([loadWhoami(), loadWalletEstimate()]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border lg:border-0">
          <div className="px-2 py-2 lg:hidden">
            <MobileNav userName={user.name} userEmail={user.email} />
          </div>
          <div className="min-w-0 flex-1">
            <Topbar
              whoami={whoami}
              walletCents={wallet.cents}
              currency={wallet.currency}
              mock={isMockMode()}
              metaMock={isMetaMockMode()}
            />
          </div>
        </div>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
