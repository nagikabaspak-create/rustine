"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAuroraMappingAction } from "@/server/actions/settings";

export function MappingForm({
  userId,
  defaultValue,
}: {
  userId: string;
  defaultValue: string;
}) {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="flex flex-col gap-2 sm:flex-row"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        const result = await updateAuroraMappingAction(new FormData(e.currentTarget));
        setPending(false);
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Input
        name="auroraUserId"
        defaultValue={defaultValue}
        placeholder="UUID Aurora user_id"
        className="sm:max-w-md"
      />
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "…" : "Enregistrer"}
      </Button>
    </form>
  );
}
