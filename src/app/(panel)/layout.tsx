import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/auth/session";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import { StatusChips } from "@/components/layout/topbar";
import { SupportChat } from "@/components/layout/support-chat";
import { isMockMode, loadWhoami } from "@/server/data";
import { isMetaMockMode } from "@/server/meta/env";

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
    <div className="flex min-h-screen bg-background">
      <Sidebar userName={user.name} userEmail={user.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 px-3 py-3 lg:px-6">
          <div className="lg:hidden">
            <MobileNav userName={user.name} userEmail={user.email} />
          </div>
          <div className="min-w-0 flex-1" />
          <StatusChips whoami={whoami} mock={isMockMode()} metaMock={isMetaMockMode()} />
        </div>
        <main className="flex-1 px-4 pb-16 lg:px-8">{children}</main>
      </div>
      <SupportChat />
    </div>
  );
}
