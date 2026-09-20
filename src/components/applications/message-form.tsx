"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendApplicationMessageAction } from "@/server/actions/applications";

export function MessageForm({
  applicationId,
  type,
}: {
  applicationId: string;
  type: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const result = await sendApplicationMessageAction(new FormData(e.currentTarget));
        setPending(false);
        if (result.ok) {
          toast.success(result.message);
          e.currentTarget.reset();
        } else toast.error(result.message);
      }}
    >
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="type" value={type} />
      <Textarea name="content" required placeholder="Message à Aurora…" />
      <Button type="submit" disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </Button>
    </form>
  );
}
