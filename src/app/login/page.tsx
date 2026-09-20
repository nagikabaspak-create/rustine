import { LoginForm } from "@/components/login-form";
import { getSessionUser } from "@/server/auth/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/40 bg-primary/10 text-lg font-bold text-primary">
            R
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight">Rustine</p>
            <p className="text-xs text-muted-foreground">Panel interne Aurora / Vantage</p>
          </div>
        </div>
        <h1 className="mb-1 text-2xl font-semibold">Connexion</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Accès réservé à Micha et Xian Mu. Pas d’inscription publique.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
