"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export function SupportChat() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="fixed z-40"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      {open ? (
        <div className="mb-3 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Support Rustine</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground touch-manipulation"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Chat bientôt disponible. En attendant, le journal d’audit et les garde-fous Meta
            restent dans le panneau.
          </p>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-[#1a1a1a] text-foreground shadow-lg touch-manipulation hover:border-primary/40"
        title="Support"
        aria-label="Support Rustine"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
