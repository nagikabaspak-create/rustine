"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  topUpAction,
  clearFundsAction,
  bmShareAction,
} from "@/server/actions/accounts";

export function TopUpDialog({
  accountId,
  accountType,
  accountName,
}: {
  accountId: string;
  accountType: string;
  accountName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [amount, setAmount] = useState("500");
  const [addFee, setAddFee] = useState(true);
  const feeRate = 0.04;
  const n = Number(amount) || 0;
  const fee = n * feeRate;
  const charged = addFee ? n + fee : n;
  const credited = addFee ? n : n - fee;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Top-up</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recharger le compte</DialogTitle>
          <DialogDescription>
            {accountName ?? accountId} · {accountType}. Confirmez le montant avant envoi.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const fd = new FormData(e.currentTarget);
            const result = await topUpAction(fd);
            setPending(false);
            if (result.ok) {
              toast.success(result.message);
              setOpen(false);
            } else toast.error(result.message);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="accountType" value={accountType} />
          <div className="space-y-2">
            <Label htmlFor={`amount-${accountId}`}>Montant (unités, pas cents)</Label>
            <Input
              id={`amount-${accountId}`}
              name="amount"
              type="number"
              min={1}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="hidden" name="addFee" value={addFee ? "true" : "false"} />
            <Checkbox
              checked={addFee}
              onCheckedChange={(v) => setAddFee(Boolean(v))}
            />
            Ajouter les frais au-dessus (add_fee)
          </label>
          <div className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">
            <p>Frais estimés (4%) : {fee.toFixed(2)}</p>
            <p>Débit wallet : {charged.toFixed(2)}</p>
            <p>Crédit compte : {credited.toFixed(2)}</p>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Envoi…" : "Confirmer le top-up"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ClearFundsDialog({
  accountId,
  accountType,
  accountName,
}: {
  accountId: string;
  accountType: string;
  accountName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Retirer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retirer les fonds</DialogTitle>
          <DialogDescription>
            {accountName ?? accountId}. Laissez vide pour demander un clear complet.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const result = await clearFundsAction(new FormData(e.currentTarget));
            setPending(false);
            if (result.ok) {
              toast.success(result.message);
              setOpen(false);
            } else toast.error(result.message);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="accountType" value={accountType} />
          <div className="space-y-2">
            <Label>Montant à retirer (optionnel)</Label>
            <Input name="amountToClear" type="number" min={1} step="0.01" />
          </div>
          <Button type="submit" variant="destructive" className="w-full" disabled={pending}>
            {pending ? "Envoi…" : "Confirmer le retrait"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BmShareDialog({
  accountId,
  accountType,
  accountName,
}: {
  accountId: string;
  accountType: string;
  accountName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          BM share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partage Business Manager</DialogTitle>
          <DialogDescription>{accountName ?? accountId}</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPending(true);
            const result = await bmShareAction(new FormData(e.currentTarget));
            setPending(false);
            if (result.ok) {
              toast.success(result.message);
              setOpen(false);
            } else toast.error(result.message);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="accountId" value={accountId} />
          <input type="hidden" name="accountType" value={accountType} />
          <div className="space-y-2">
            <Label>ID Business Manager</Label>
            <Input name="businessManagerValue" required placeholder="1234567890123" />
          </div>
          <div className="space-y-2">
            <Label>Email admin (TikTok)</Label>
            <Input name="businessManagerEmail" type="email" placeholder="ops@example.com" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="confirmation" defaultChecked />
            Je confirme les conditions Aurora
          </label>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer la demande"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
