"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

export function SupportChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open ? (
        <div className="mb-3 w-72 rounded-2xl border border-border bg-card p-4 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Support Rustine</p>
            <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground">
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
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-[#1a1a1a] text-foreground shadow-lg hover:border-primary/40"
        title="Support"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
