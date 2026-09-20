import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm text-muted-foreground">Rustine</p>
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <Link href="/" className="text-sm text-primary hover:underline">
        Retour au tableau de bord
      </Link>
    </div>
  );
}
