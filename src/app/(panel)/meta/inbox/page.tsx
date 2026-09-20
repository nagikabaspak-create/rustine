import { meta } from "@/server/meta/client";
import { isMetaMockMode } from "@/server/meta/env";
import { loadGuardrails } from "@/server/meta/queue";
import { InboxBoard } from "@/components/meta/inbox-board";
import { MetaKillBanner, MetaMockBanner } from "@/components/meta/banners";

export const dynamic = "force-dynamic";

export default async function MetaInboxPage() {
  const mock = isMetaMockMode();
  const [comments, guard] = await Promise.all([
    meta.listComments().catch(() => []),
    loadGuardrails(),
  ]);
  const suggestions = Object.fromEntries(
    comments.map((c) => [c.id, meta.suggestReply(c)]),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Meta Inbox</h1>
        <p className="text-sm text-muted-foreground">
          Commentaires sous pubs et posts — répondre, masquer, supprimer. La suggestion IA ne
          part jamais toute seule.
        </p>
      </div>
      <MetaMockBanner mock={mock} />
      <MetaKillBanner enabled={guard.killSwitch} />
      {comments.length === 0 && !mock ? (
        <p className="text-sm text-destructive">
          Aucun commentaire chargé (Graph a échoué ou la page est vide). La structure live est
          active — vérifiez META_PAGE_ID et le token.
        </p>
      ) : (
        <InboxBoard
          comments={comments}
          suggestions={suggestions}
          killSwitch={guard.killSwitch}
        />
      )}
    </div>
  );
}
