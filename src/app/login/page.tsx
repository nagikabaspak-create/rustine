import { LoginForm } from "@/components/login-form";
import { BrandLockup } from "@/components/brand/logo-mark";
import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { Mail, Megaphone, MessageSquare, Store, Users, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

const STATS: { label: string; value: string; icon: LucideIcon }[] = [
  { label: "Pubs Meta", value: "153 883", icon: Megaphone },
  { label: "Wallet (USD)", value: "8 787", icon: Wallet },
  { label: "Comptes ads", value: "12 291", icon: Store },
  { label: "Commentaires", value: "4 241", icon: MessageSquare },
  { label: "Comptes opé.", value: "819", icon: Users },
  { label: "Inbox", value: "7 758", icon: Mail },
];

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-3 py-8 sm:px-4 sm:py-10">
      <BrandLockup className="mb-8" size={28} />

      <div className="w-full max-w-[1100px] rounded-2xl border border-[#2a2a2a] bg-shell p-2 sm:rounded-[28px] sm:p-4">
        <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="flex flex-col justify-center px-4 py-8 sm:px-12 sm:py-10 lg:px-16">
            <h1 className="mb-6 text-[15px] font-medium">Content de te revoir</h1>
            <LoginForm />
            <div className="login-mobile-stats mt-8 grid grid-cols-2 gap-2 lg:hidden">
              {STATS.slice(0, 4).map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-[#0a0a0a] px-3 py-3"
                  >
                    <Icon className="mb-2 h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-sm font-medium tabular-nums">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="login-hero relative hidden min-h-[540px] overflow-hidden rounded-[22px] p-8 lg:flex lg:flex-col lg:justify-between lg:p-10">
            <h2 className="relative z-10 max-w-md text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-white">
              Bon retour.
              <br />
              Tout est là
              <br />
              où tu l’as laissé.
            </h2>
            <div className="relative z-10 mt-10 grid grid-cols-2 gap-3">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/8 bg-black/35 px-4 py-3.5 backdrop-blur-[2px]"
                  >
                    <Icon className="mb-3 h-4 w-4 text-white/80" />
                    <p className="text-[15px] font-medium tabular-nums">{stat.value}</p>
                    <p className="text-[12px] text-white/50">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
