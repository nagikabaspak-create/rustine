"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createApplicationAction } from "@/server/actions/applications";

export function CreateApplicationDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Nouvelle demande META</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une application META</DialogTitle>
          <DialogDescription>
            Rustine appelle begin puis create. En DRY_RUN / mock, la demande est simulée.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const result = await createApplicationAction(new FormData(e.currentTarget));
            setPending(false);
            if (result.ok) {
              toast.success(result.message);
              setOpen(false);
            } else toast.error(result.message);
          }}
        >
          <input type="hidden" name="type" value="META" />
          <div className="space-y-1">
            <Label>Noms (séparés par virgule)</Label>
            <Input name="names" required defaultValue="Rustine — New META" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Timezone</Label>
              <Input name="timezone" required defaultValue="America/New_York" />
            </div>
            <div className="space-y-1">
              <Label>Devise</Label>
              <select
                name="currency"
                className="h-9 w-full rounded-md border border-input bg-[#0B0F14] px-3 text-sm"
                defaultValue="USD"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Liens publicitaires</Label>
            <Textarea name="advertisingLinks" required defaultValue="https://example.com" />
          </div>
          <div className="space-y-1">
            <Label>IDs Business Manager</Label>
            <Input name="businessManagerIds" defaultValue="1234567890123" />
          </div>
          <div className="space-y-1">
            <Label>Pages (BM_ID=URL, une par ligne)</Label>
            <Textarea
              name="pageLinks"
              defaultValue="1234567890123=https://facebook.com/mypage"
            />
          </div>
          <input type="hidden" name="accountType" value="Standard" />
          <input type="hidden" name="specificLinksAcknowledgement" value="on" />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked disabled />
            Accusé des liens spécifiques
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox disabled />
            Invited links
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Création…" : "Créer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
