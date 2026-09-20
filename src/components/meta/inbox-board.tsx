"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TagBadge } from "@/components/meta/banners";
import {
  deleteCommentAction,
  hideCommentAction,
  replyCommentAction,
} from "@/server/actions/meta";
import type { MetaComment, MetaSuggestedReply } from "@/server/meta/types";

export function InboxBoard({
  comments,
  suggestions,
  killSwitch,
}: {
  comments: MetaComment[];
  suggestions: Record<string, MetaSuggestedReply>;
  killSwitch: boolean;
}) {
  const [selectedId, setSelectedId] = useState(comments[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "spam" | "question" | "lead">("all");

  const visible = useMemo(() => {
    if (filter === "all") return comments;
    return comments.filter((c) => c.tags.includes(filter));
  }, [comments, filter]);

  const selected = visible.find((c) => c.id === selectedId) ?? visible[0] ?? null;
  const suggestion = selected ? suggestions[selected.id] : null;

  async function run(
    key: string,
    fn: (fd: FormData) => Promise<{ ok: boolean; message: string }>,
    extra?: Record<string, string>,
  ) {
    if (!selected) return;
    setPending(key);
    const fd = new FormData();
    fd.set("commentId", selected.id);
    if (extra) {
      for (const [k, v] of Object.entries(extra)) fd.set(k, v);
    }
    const result = await fn(fd);
    setPending(null);
    if (result.ok) {
      toast.success(result.message);
      if (key === "reply") setDraft("");
    } else toast.error(result.message);
  }

  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Aucun commentaire pour le moment.</p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle>Fil</CardTitle>
          <div className="flex flex-wrap gap-1">
            {(["all", "question", "lead", "spam"] as const).map((f) => (
              <Button
                key={f}
                type="button"
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Tous" : f === "spam" ? "Spam" : f === "lead" ? "Leads" : "Questions"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Rien pour ce filtre.</p>
          ) : (
            visible.map((comment) => {
              const active = selected?.id === comment.id;
              return (
                <button
                  key={comment.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(comment.id);
                    setDraft("");
                  }}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/30",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{comment.from.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatDate(comment.created_time)}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {comment.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    {comment.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                    {comment.hidden ? <Badge variant="muted">Masqué</Badge> : null}
                    {comment.ad_name ? (
                      <span className="text-[11px] text-muted-foreground">{comment.ad_name}</span>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selected ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{selected.from.name}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {selected.ad_name ?? "Post page"} · {formatDate(selected.created_time)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{selected.message}</p>
                {selected.replies.length > 0 ? (
                  <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Réponses page
                    </p>
                    {selected.replies.map((r) => (
                      <p key={r.id} className="text-sm">
                        <span className="font-medium">{r.from.name} · </span>
                        {r.message}
                      </p>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Réponse publique…"
                    disabled={killSwitch || selected.hidden}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={killSwitch || pending !== null || !draft.trim()}
                      onClick={() => run("reply", replyCommentAction, { message: draft })}
                    >
                      {pending === "reply" ? "Envoi…" : "Répondre en public"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={killSwitch || pending !== null || selected.hidden}
                      onClick={() => run("hide", hideCommentAction)}
                    >
                      {pending === "hide" ? "…" : "Masquer"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={killSwitch || pending !== null}
                      onClick={() => run("delete", deleteCommentAction)}
                    >
                      {pending === "delete" ? "…" : "Supprimer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Suggestion IA</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Jamais envoyée automatiquement — « Utiliser la suggestion » remplit seulement
                  le champ.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestion ? (
                  <>
                    <p className="rounded-lg border border-border bg-[#0B0F14] p-3 text-sm">
                      {suggestion.text}
                    </p>
                    <p className="text-xs text-muted-foreground">{suggestion.rationale}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setDraft(suggestion.text)}
                    >
                      Utiliser la suggestion
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Pas de suggestion.</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Sélectionnez un commentaire.</p>
        )}
      </div>
    </div>
  );
}
